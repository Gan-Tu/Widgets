import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { Readable } from "node:stream";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import handler from "../api/owner-access.js";
import authorHandler from "../api/author-widget.js";
import { createOwnerInvite, getOwnerSession, requireSameOrigin, revokeOwnerCredential } from "../api/_lib/owner-auth.js";

const runFile = promisify(execFile);
const origin = "https://widgets.example.test";
const rpID = "widgets.example.test";
const dayMs = 86_400_000;
let requestId = 0;

function configure(t, overrides = {}) {
  const values = {
    WIDGET_OWNER_ORIGIN: origin,
    WIDGET_QUOTA_SECRET: "test-quota-secret-at-least-32-characters",
    UPSTASH_REDIS_REST_URL: "https://quota.example.test",
    UPSTASH_REDIS_REST_TOKEN: "test-redis-token",
    OPENAI_API_KEY: "test-only-openai-key",
    KV_REST_API_URL: undefined,
    KV_REST_API_TOKEN: undefined,
    VERCEL: undefined,
    NODE_ENV: "test",
    ...overrides
  };
  for (const [key, value] of Object.entries(values)) {
    const previous = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }
}

function context(cookie, headers = {}) {
  const responseHeaders = {};
  return {
    req: { headers: { ...(cookie ? { cookie } : {}), ...headers }, socket: { remoteAddress: "203.0.113.5" } },
    res: {
      setHeader(key, value) { responseHeaders[key.toLowerCase()] = value; },
      getHeader(key) { return responseHeaders[key.toLowerCase()]; }
    },
    headers: responseHeaders
  };
}

async function request({ method = "POST", body = {}, cookie, headers = {}, rawBody, target = handler, ip } = {}) {
  const req = Readable.from([Buffer.from(rawBody ?? JSON.stringify(body))]);
  req.method = method;
  req.headers = { "content-type": "application/json", origin, ...(cookie ? { cookie } : {}), ...headers };
  req.socket = { remoteAddress: ip ?? `203.0.${Math.floor(++requestId / 250)}.${requestId % 250 + 1}` };
  const result = { headers: {}, text: "", ended: false };
  const res = {
    statusCode: 200,
    setHeader(key, value) { result.headers[key.toLowerCase()] = value; },
    getHeader(key) { return result.headers[key.toLowerCase()]; },
    write(value) { result.text += value; },
    end(value = "") { result.text += value; result.ended = true; }
  };
  await target(req, res);
  assert.equal(result.ended, true);
  return { ...result, status: res.statusCode, body: result.text ? JSON.parse(result.text) : {} };
}

function cookies(result, pattern) {
  const values = result.headers["set-cookie"];
  return (Array.isArray(values) ? values : values ? [values] : [])
    .filter((value) => pattern.test(value.split("=")[0]) && !value.includes("Max-Age=0"))
    .map((value) => value.split(";")[0]).join("; ");
}

// Minimal CBOR encoder used solely to build real WebAuthn test responses. The
// production verifier still parses and verifies every signature and RP binding.
function cborHead(major, value) {
  if (value < 24) return Buffer.from([(major << 5) | value]);
  if (value < 256) return Buffer.from([(major << 5) | 24, value]);
  const bytes = Buffer.alloc(3);
  bytes[0] = (major << 5) | 25;
  bytes.writeUInt16BE(value, 1);
  return bytes;
}

function cbor(value) {
  if (Buffer.isBuffer(value)) return Buffer.concat([cborHead(2, value.length), value]);
  if (typeof value === "string") {
    const bytes = Buffer.from(value);
    return Buffer.concat([cborHead(3, bytes.length), bytes]);
  }
  if (typeof value === "number") return cborHead(value < 0 ? 1 : 0, value < 0 ? -1 - value : value);
  if (value instanceof Map) return Buffer.concat([cborHead(5, value.size), ...[...value].flatMap(([key, item]) => [cbor(key), cbor(item)])]);
  throw new Error("Unsupported CBOR fixture value");
}

function authenticator() {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = publicKey.export({ format: "jwk" });
  const id = randomBytes(32);
  const coseKey = cbor(new Map([[1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, "base64url")], [-3, Buffer.from(jwk.y, "base64url")]]));
  let counter = 0;
  const hash = (value) => createHash("sha256").update(value).digest();
  const clientData = (type, challenge, expectedOrigin) => Buffer.from(JSON.stringify({ type, challenge, origin: expectedOrigin, crossOrigin: false }));
  function authData(flags, relyingParty, count) {
    const bytes = Buffer.alloc(37);
    hash(relyingParty).copy(bytes);
    bytes[32] = flags;
    bytes.writeUInt32BE(count, 33);
    return bytes;
  }
  return {
    id: id.toString("base64url"),
    register(options, overrides = {}) {
      const client = clientData("webauthn.create", overrides.challenge ?? options.challenge, overrides.origin ?? origin);
      const length = Buffer.alloc(2);
      length.writeUInt16BE(id.length);
      const data = Buffer.concat([authData(overrides.flags ?? 0x45, overrides.rpID ?? rpID, 0), Buffer.alloc(16), length, id, coseKey]);
      const attestation = cbor(new Map([["fmt", "none"], ["attStmt", new Map()], ["authData", data]]));
      return {
        id: id.toString("base64url"), rawId: id.toString("base64url"), type: "public-key",
        response: { clientDataJSON: client.toString("base64url"), attestationObject: attestation.toString("base64url"), transports: ["internal"] },
        clientExtensionResults: { credProps: { rk: true } }, authenticatorAttachment: "platform"
      };
    },
    authenticate(options, overrides = {}) {
      const client = clientData("webauthn.get", overrides.challenge ?? options.challenge, overrides.origin ?? origin);
      const data = authData(overrides.flags ?? 0x05, overrides.rpID ?? rpID, ++counter);
      const signature = sign("sha256", Buffer.concat([data, hash(client)]), privateKey);
      if (overrides.badSignature) signature[signature.length - 1] ^= 1;
      return {
        id: overrides.id ?? id.toString("base64url"), rawId: overrides.id ?? id.toString("base64url"), type: "public-key",
        response: { clientDataJSON: client.toString("base64url"), authenticatorData: data.toString("base64url"), signature: signature.toString("base64url"), userHandle: null },
        clientExtensionResults: {}, authenticatorAttachment: "platform"
      };
    }
  };
}

test("anonymous requests do not need owner configuration or a store", async (t) => {
  configure(t, { WIDGET_OWNER_ORIGIN: undefined, UPSTASH_REDIS_REST_URL: undefined, UPSTASH_REDIS_REST_TOKEN: undefined });
  t.mock.method(globalThis, "fetch", () => assert.fail("anonymous requests must not contact owner storage"));
  const item = context();
  assert.equal(await getOwnerSession(item.req, item.res), null);
});

test("owner mutations reject untrusted origins before contacting the store", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", () => assert.fail("origin rejection must precede storage"));
  for (const value of ["https://attacker.example", "null", undefined]) {
    assert.throws(() => requireSameOrigin(context(undefined, { origin: value }).req));
    const result = await request({ headers: { origin: value }, body: { action: "authenticate-options" } });
    assert.equal(result.status, 403);
  }
});

test("invalid owner origins cannot derive trust from request headers", async (t) => {
  configure(t, { WIDGET_OWNER_ORIGIN: "http://widgets.example.test" });
  t.mock.method(globalThis, "fetch", () => assert.fail("invalid configuration must fail before storage"));
  const result = await request({ body: { action: "authenticate-options" } });
  assert.equal(result.status, 503);
});

test("owner API rejects non-JSON and oversized mutation bodies", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", () => assert.fail("invalid payloads must not contact the store"));
  assert.equal((await request({ headers: { "content-type": "text/plain" } })).status, 415);
  assert.equal((await request({ rawBody: "{" })).status, 400);
  const oversized = await request({ body: { action: "authenticate-options", padding: "x".repeat(70_000) } });
  assert.ok([400, 413].includes(oversized.status));
});

// These tests use an actual Redis process and actual P256 signatures. No
// WebAuthn verification method is mocked. Enable with WIDGET_TEST_REDIS_SERVER
// and WIDGET_TEST_REDIS_CLI pointing to local Redis binaries.
test("owner enrollment, passkey proofs, renewal, revocation, and quota bypass", {
  skip: !process.env.WIDGET_TEST_REDIS_SERVER || !process.env.WIDGET_TEST_REDIS_CLI
}, async (t) => {
  configure(t);
  const directory = await mkdtemp(path.join(os.tmpdir(), "widgets-owner-test-"));
  const socket = path.join(directory, "redis.sock");
  const server = spawn(process.env.WIDGET_TEST_REDIS_SERVER, ["--port", "0", "--unixsocket", socket, "--save", "", "--appendonly", "no"], { stdio: ["ignore", "pipe", "pipe"] });
  t.after(async () => {
    if (server.exitCode === null) {
      const exited = new Promise((resolve) => server.once("exit", resolve));
      server.kill("SIGTERM");
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Redis startup timed out")), 5000);
    server.once("error", reject);
    server.once("exit", (code) => reject(new Error(`Redis exited during startup: ${code}`)));
    server.stdout.on("data", (chunk) => {
      if (/ready to accept connections/i.test(String(chunk))) { clearTimeout(timeout); resolve(); }
    });
  });
  async function command(args) {
    const { stdout } = await runFile(process.env.WIDGET_TEST_REDIS_CLI, ["-s", socket, "--json", ...args.map(String)]);
    return JSON.parse(stdout);
  }
  const commands = [];
  const openaiCalls = [];
  const openaiOutputs = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url === "https://api.openai.com/v1/responses") {
      assert.ok(openaiOutputs.length, "unexpected paid upstream call");
      openaiCalls.push(JSON.parse(options.body));
      return Response.json({ output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(openaiOutputs.shift()) }] }] });
    }
    assert.equal(url, "https://quota.example.test/");
    const args = JSON.parse(options.body);
    commands.push(args);
    let result = await command(args);
    // redis-cli renders HGETALL as an object; the Redis REST wire response is
    // the alternating key/value array returned by RESP2.
    if (args[0] === "HGETALL" && !Array.isArray(result)) result = Object.entries(result).flat();
    return Response.json({ result });
  });

  async function options(action, cookie, extra = {}) {
    const result = await request({ cookie, body: { action, ...extra } });
    assert.equal(result.status, 200, result.text);
    assert.ok(result.body.options.challenge);
    return { options: result.body.options, cookie: cookies(result, /ceremony$/) };
  }
  async function verify(action, ceremony, response) {
    return request({ cookie: ceremony.cookie, body: { action, response } });
  }
  async function invitation() {
    const result = await createOwnerInvite();
    const url = typeof result === "string" ? result : result.url;
    assert.ok(url, "createOwnerInvite returns its private link");
    const token = new URLSearchParams(new URL(url).hash.slice(1)).get("owner-invite");
    assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    return token;
  }

  const device = authenticator();
  let ownerCookie;
  await t.test("only a private, single-use invitation can register the first passkey", async () => {
    const denied = await request({ body: { action: "register-options" } });
    assert.ok([401, 403].includes(denied.status));
    const token = await invitation();
    const enrollment = await options("register-options", undefined, { inviteToken: token });
    assert.equal(enrollment.options.authenticatorSelection.userVerification, "required");
    assert.equal(enrollment.options.authenticatorSelection.residentKey, "required");
    const reused = await request({ body: { action: "register-options", inviteToken: token } });
    assert.ok([400, 401, 403].includes(reused.status));
    const response = device.register(enrollment.options);
    const registered = await verify("register-verify", enrollment, response);
    assert.equal(registered.status, 200, registered.text);
    assert.equal(registered.body.owner, true);
    ownerCookie = cookies(registered, /owner$/);
    assert.ok(ownerCookie);
    assert.match([registered.headers["set-cookie"]].flat().join("; "), /HttpOnly/);
    assert.match([registered.headers["set-cookie"]].flat().join("; "), /SameSite=Strict/);
    assert.ok(registered.body.expiresAt >= Date.now() + 89 * dayMs);
    const replayed = await verify("register-verify", enrollment, response);
    assert.ok([400, 401, 403].includes(replayed.status));
  });

  await t.test("owner session is server-backed and a forged cookie gives no owner access", async () => {
    assert.equal((await request({ method: "GET", cookie: ownerCookie })).body.owner, true);
    const forged = ownerCookie.slice(0, -1) + (ownerCookie.endsWith("A") ? "B" : "A");
    assert.equal((await request({ method: "GET", cookie: forged })).body.owner, false);
  });

  await t.test("active sessions renew near expiry but expired sessions cannot renew themselves", async () => {
    const key = `{widgets-owner}:v1:session:${createHash("sha256").update(ownerCookie.split("=")[1]).digest("hex")}`;
    const session = JSON.parse(await command(["GET", key]));
    session.expiresAt = Date.now() + 29 * dayMs;
    await command(["SET", key, JSON.stringify(session), "PX", String(29 * dayMs)]);
    const renewed = await request({ method: "GET", cookie: ownerCookie });
    assert.equal(renewed.body.owner, true);
    assert.ok(renewed.body.expiresAt > Date.now() + 89 * dayMs);
    assert.equal(cookies(renewed, /owner$/), ownerCookie);
    const persisted = JSON.parse(await command(["GET", key]));
    assert.equal(persisted.expiresAt, renewed.body.expiresAt);
    persisted.expiresAt = Date.now() - 2000;
    await command(["SET", key, JSON.stringify(persisted), "EX", "60"]);
    assert.equal((await request({ method: "GET", cookie: ownerCookie })).body.owner, false);
    assert.equal(await command(["GET", key]), null, "expired authorization is deleted rather than renewed");
  });

  await t.test("valid passkey proof signs in; its challenge is single-use and browser-bound", async () => {
    const ceremony = await options("authenticate-options");
    assert.equal(ceremony.options.userVerification, "required");
    const response = device.authenticate(ceremony.options);
    const wrongBrowser = await request({ body: { action: "authenticate-verify", response } });
    assert.ok([400, 401, 403].includes(wrongBrowser.status));
    const verified = await verify("authenticate-verify", ceremony, response);
    assert.equal(verified.status, 200, verified.text);
    ownerCookie = cookies(verified, /owner$/);
    assert.equal((await verify("authenticate-verify", ceremony, response)).body.owner, undefined);
  });

  for (const [name, overrides] of [
    ["wrong origin", { origin: "https://attacker.example" }],
    ["wrong relying party", { rpID: "attacker.example" }],
    ["missing user verification", { flags: 0x01 }],
    ["wrong challenge", { challenge: randomBytes(32).toString("base64url") }],
    ["invalid signature", { badSignature: true }]
  ]) {
    await t.test(`rejects a passkey assertion with ${name}`, async () => {
      const ceremony = await options("authenticate-options");
      const result = await verify("authenticate-verify", ceremony, device.authenticate(ceremony.options, overrides));
      assert.ok([400, 401, 403].includes(result.status), result.text);
      assert.equal(result.body.owner, undefined);
    });
  }

  await t.test("an unrelated passkey cannot authenticate as owner", async () => {
    const ceremony = await options("authenticate-options");
    const result = await verify("authenticate-verify", ceremony, authenticator().authenticate(ceremony.options));
    assert.ok([400, 401, 403].includes(result.status), result.text);
    const impersonation = await options("authenticate-options");
    const spoofed = await verify("authenticate-verify", impersonation, authenticator().authenticate(impersonation.options, { id: device.id }));
    assert.ok([400, 401, 403].includes(spoofed.status), "claiming the owner's credential ID does not prove possession");
  });

  await t.test("expired invitations and ceremonies cannot authorize a browser", async () => {
    const token = await invitation();
    const inviteKey = `{widgets-owner}:v1:invite:${createHash("sha256").update(token).digest("hex")}`;
    assert.ok(await command(["TTL", inviteKey]) <= 600);
    await command(["DEL", inviteKey]);
    const expired = await request({ body: { action: "register-options", inviteToken: token } });
    assert.equal(expired.status, 403);
    const ceremony = await options("authenticate-options");
    const ceremonyKey = `{widgets-owner}:v1:ceremony:${createHash("sha256").update(ceremony.cookie.split("=")[1]).digest("hex")}`;
    assert.ok(await command(["TTL", ceremonyKey]) <= 300);
    await command(["DEL", ceremonyKey]);
    assert.equal((await verify("authenticate-verify", ceremony, device.authenticate(ceremony.options))).status, 400);
  });

  await t.test("a private invitation cannot be claimed by two simultaneous browsers", async () => {
    const token = await invitation();
    const attempts = await Promise.all(Array.from({ length: 2 }, () => request({ body: { action: "register-options", inviteToken: token } })));
    assert.equal(attempts.filter((result) => result.status === 200).length, 1);
    assert.equal(attempts.filter((result) => result.status === 403).length, 1);
  });

  for (const [name, overrides] of [
    ["wrong origin", { origin: "https://attacker.example" }],
    ["wrong relying party", { rpID: "attacker.example" }],
    ["missing user verification", { flags: 0x41 }]
  ]) {
    await t.test(`registration rejects ${name} even with a valid invitation`, async () => {
      const ceremony = await options("register-options", undefined, { inviteToken: await invitation() });
      const result = await verify("register-verify", ceremony, authenticator().register(ceremony.options, overrides));
      assert.equal(result.status, 400, result.text);
      assert.equal(result.body.owner, undefined);
    });
  }

  await t.test("registration and authentication ceremonies cannot be interchanged", async () => {
    const ceremony = await options("authenticate-options");
    const result = await verify("register-verify", ceremony, authenticator().register(ceremony.options));
    assert.ok([400, 401, 403].includes(result.status), result.text);
  });

  await t.test("owner generation skips both visitor counters while requiring the expected origin", async () => {
    const firstCommand = commands.length;
    const widget = { template: '<Card><Text value={title} /></Card>', data: { title: "Owner test" }, theme: "light", designSpec: "A status card." };
    openaiOutputs.push({ webSearches: [], imageSearches: [] }, widget);
    const generated = await request({ target: authorHandler, cookie: ownerCookie, body: { prompt: "A status card" } });
    assert.equal(generated.status, 200, generated.text);
    assert.equal(generated.headers["x-generation-owner"], "true");
    assert.equal(generated.body.template, widget.template);
    assert.equal(commands.slice(firstCommand).some((args) => args.some((arg) => String(arg).includes("{widgets-generation-quota}"))), false);
    const paidCount = openaiCalls.length;
    const forbidden = await request({ target: authorHandler, cookie: ownerCookie, headers: { origin: "https://attacker.example" }, body: { prompt: "A status card" } });
    assert.equal(forbidden.status, 403);
    assert.equal(openaiCalls.length, paidCount);
  });

  await t.test("owners may add passkeys; signing out one browser preserves other sessions", async () => {
    const additional = authenticator();
    const enrollment = await options("register-options", ownerCookie);
    const registered = await verify("register-verify", enrollment, additional.register(enrollment.options));
    assert.equal(registered.status, 200, registered.text);
    const secondCookie = cookies(registered, /owner$/);
    assert.notEqual(secondCookie, ownerCookie);
    const signedOut = await request({ cookie: secondCookie, body: { action: "logout" } });
    assert.equal(signedOut.body.owner, false);
    assert.equal((await request({ method: "GET", cookie: secondCookie })).body.owner, false);
    assert.equal((await request({ method: "GET", cookie: ownerCookie })).body.owner, true);
    const removed = await request({ cookie: ownerCookie, body: { action: "remove-passkey", credentialId: additional.id } });
    assert.equal(removed.status, 200, removed.text);
    assert.equal(removed.body.credentials.some((entry) => entry.id === additional.id), false);
  });

  await t.test("signing out all browsers revokes every existing session but preserves passkey login", async () => {
    const outstanding = await options("authenticate-options");
    const outstandingProof = device.authenticate(outstanding.options);
    const revoked = await request({ cookie: ownerCookie, body: { action: "revoke-all" } });
    assert.equal(revoked.status, 200, revoked.text);
    assert.equal((await request({ method: "GET", cookie: ownerCookie })).body.owner, false);
    assert.equal((await verify("authenticate-verify", outstanding, outstandingProof)).status, 400,
      "a proof issued before revocation cannot recreate owner authorization");
    const firstCommand = commands.length;
    openaiOutputs.push({ webSearches: [], imageSearches: [] }, { template: '<Card><Text value="Public" /></Card>', data: {}, theme: "light", designSpec: "A status card." });
    const publicGeneration = await request({ target: authorHandler, cookie: ownerCookie, body: { prompt: "A status card" } });
    assert.equal(publicGeneration.status, 200, publicGeneration.text);
    assert.equal(publicGeneration.headers["x-generation-owner"], "false");
    assert.equal(publicGeneration.headers["x-generation-remaining"], "2");
    assert.equal(commands.slice(firstCommand).some((args) => args.some((arg) => String(arg).includes("{widgets-generation-quota}"))), true);
    const ceremony = await options("authenticate-options");
    const signedIn = await verify("authenticate-verify", ceremony, device.authenticate(ceremony.options));
    assert.equal(signedIn.status, 200, signedIn.text);
    ownerCookie = cookies(signedIn, /owner$/);
  });

  await t.test("revoking a passkey invalidates its sessions and future assertions", async () => {
    await revokeOwnerCredential(device.id);
    assert.equal((await request({ method: "GET", cookie: ownerCookie })).body.owner, false);
    const ceremony = await options("authenticate-options");
    const denied = await verify("authenticate-verify", ceremony, device.authenticate(ceremony.options));
    assert.ok([400, 401, 403].includes(denied.status), denied.text);
  });

  await t.test("public authentication attempts are limited per trusted IP", async () => {
    for (let attempt = 0; attempt <= 20; attempt += 1) {
      const result = await request({ ip: "198.51.100.88", headers: { "x-forwarded-for": `192.0.2.${attempt + 1}` }, body: { action: "authenticate-options" } });
      assert.equal(result.status, attempt < 20 ? 200 : 429);
      if (attempt === 20) assert.ok(Number(result.headers["retry-after"]) > 0);
    }
  });
  assert.equal(openaiOutputs.length, 0);
});
