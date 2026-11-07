import assert from "node:assert/strict";
import { test } from "node:test";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { consumeGenerationQuota, getTrustedClientIp, GENERATION_QUOTA_SCRIPT } from "../api/_lib/generation-quota.js";

const runFile = promisify(execFile);
const windowMs = 86_400_000;

function configure(t, overrides = {}) {
  const values = {
    WIDGET_QUOTA_SECRET: "test-quota-secret-at-least-32-characters",
    UPSTASH_REDIS_REST_URL: "https://quota.example.test",
    UPSTASH_REDIS_REST_TOKEN: "test-redis-token",
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

function context(ip = "203.0.113.1", cookie) {
  const headers = {};
  return {
    req: { headers: cookie ? { cookie } : {}, socket: { remoteAddress: ip } },
    res: {
      setHeader(key, value) { headers[key] = value; },
      getHeader(key) { return headers[key]; }
    },
    headers
  };
}

function mockStore(t, result) {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://quota.example.test/");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.authorization, "Bearer test-redis-token");
    const command = JSON.parse(options.body);
    assert.equal(command[0], "EVAL");
    assert.equal(command[1], GENERATION_QUOTA_SCRIPT);
    assert.equal(command[2], "2");
    assert.equal(command[5], String(windowMs));
    assert.equal(command[6], "3");
    calls.push(command);
    const now = Date.now();
    return Response.json({ result: result ?? [1, 2, now + windowMs, now] });
  });
  return calls;
}

test("trusts only platform-overwritten IPs on Vercel and socket IPs elsewhere", (t) => {
  configure(t);
  const { req } = context("203.0.113.1");
  req.headers = { "x-real-ip": "203.0.113.8", "x-forwarded-for": "203.0.113.9" };
  assert.equal(getTrustedClientIp(req), "203.0.113.1");
  process.env.VERCEL = "1";
  assert.equal(getTrustedClientIp(req), "203.0.113.9");
  req.headers["x-forwarded-for"] = "203.0.113.8, 203.0.113.9";
  assert.equal(getTrustedClientIp(req), null, "ambiguous platform IP must fail closed");
  delete req.headers["x-forwarded-for"];
  assert.equal(getTrustedClientIp(req), null, "do not fall back to a caller-supplied alternate header");
});

test("canonicalizes IPv6 and IPv4-mapped addresses into the same quota identity", (t) => {
  configure(t);
  assert.equal(getTrustedClientIp(context("2001:0DB8:0000:0000:0000:0000:0000:0001").req), "2001:db8::1");
  assert.equal(getTrustedClientIp(context("::ffff:203.0.113.1").req), "203.0.113.1");
  assert.equal(getTrustedClientIp(context("::ffff:cb00:7101").req), "203.0.113.1");
  assert.equal(getTrustedClientIp(context("invalid-ip").req), null);
});

test("signs a persistent HttpOnly browser cookie and stores only HMAC identities", async (t) => {
  configure(t);
  const calls = mockStore(t);
  const first = context();
  const result = await consumeGenerationQuota(first.req, first.res);
  assert.equal(result.remaining, 2);
  assert.match(first.headers["set-cookie"], /^widget_visitor=v1\./);
  assert.match(first.headers["set-cookie"], /Path=\/; HttpOnly; SameSite=Lax; Max-Age=31536000/);
  assert.equal(first.headers["x-generation-limit"], "3");
  assert.equal(first.headers["x-generation-remaining"], "2");
  assert.equal(first.headers["cache-control"], "no-store");
  const cookie = first.headers["set-cookie"].split(";")[0];
  const second = context("203.0.113.2", cookie);
  await consumeGenerationQuota(second.req, second.res);
  assert.equal(second.headers["set-cookie"], undefined, "valid visitor cookie is reused");
  assert.equal(calls[0][4], calls[1][4], "browser identity follows an IP change");
  assert.notEqual(calls[0][3], calls[1][3]);
  assert.ok(!calls[0][3].includes("203.0.113.1"));
  assert.ok(!calls[0][4].includes(cookie.split(".")[1]));
  const forged = context("203.0.113.1", cookie.slice(0, -1) + (cookie.endsWith("A") ? "B" : "A"));
  await consumeGenerationQuota(forged.req, forged.res);
  assert.ok(forged.headers["set-cookie"]);
  assert.equal(calls[2][3], calls[0][3], "forging/deleting cookies cannot change the IP bucket");
  assert.notEqual(calls[2][4], calls[0][4]);
});

test("production cookie is host-only and Secure, preserving other response cookies", async (t) => {
  configure(t, { NODE_ENV: "production" });
  mockStore(t);
  const item = context();
  item.headers["set-cookie"] = "other=value; Path=/";
  await consumeGenerationQuota(item.req, item.res);
  assert.equal(item.headers["set-cookie"][0], "other=value; Path=/");
  assert.match(item.headers["set-cookie"][1], /^__Host-widget_visitor=/);
  assert.match(item.headers["set-cookie"][1], /; Secure$/);
  assert.ok(!item.headers["set-cookie"][1].includes("Domain="));
});

test("supports the Vercel KV credential aliases", async (t) => {
  configure(t, {
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined,
    KV_REST_API_URL: "https://quota.example.test",
    KV_REST_API_TOKEN: "test-redis-token"
  });
  mockStore(t);
  const item = context();
  assert.equal((await consumeGenerationQuota(item.req, item.res)).remaining, 2);
});

test("quota rejection reports the retry time without exposing backend details", async (t) => {
  configure(t);
  const now = Date.now();
  mockStore(t, [0, 0, now + 5001, now]);
  const item = context();
  await assert.rejects(consumeGenerationQuota(item.req, item.res), { statusCode: 429 });
  assert.equal(item.headers["retry-after"], "6");
  assert.equal(item.headers["x-generation-remaining"], "0");
  assert.equal(item.headers["x-generation-reset"], String(Math.ceil((now + 5001) / 1000)));
});

for (const overrides of [
  { WIDGET_QUOTA_SECRET: undefined },
  { WIDGET_QUOTA_SECRET: "short" },
  { UPSTASH_REDIS_REST_URL: undefined },
  { UPSTASH_REDIS_REST_TOKEN: undefined },
  { UPSTASH_REDIS_REST_URL: "http://quota.example.test" }
]) {
  test(`fails closed without valid configuration: ${JSON.stringify(overrides)}`, async (t) => {
    configure(t, overrides);
    t.mock.method(globalThis, "fetch", () => assert.fail("must reject before network access"));
    const item = context();
    await assert.rejects(consumeGenerationQuota(item.req, item.res), { statusCode: 503 });
  });
}

test("fails closed without a trustworthy IP", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", () => assert.fail("must reject before network access"));
  const item = context("invalid");
  await assert.rejects(consumeGenerationQuota(item.req, item.res), { statusCode: 503 });
});

for (const failure of ["network", "http", "json", "error", "shape"]) {
  test(`fails closed and sanitizes Redis ${failure} failures`, async (t) => {
    configure(t);
    t.mock.method(globalThis, "fetch", async () => {
      if (failure === "network") throw new Error("secret connection details");
      if (failure === "http") return new Response("secret details", { status: 500 });
      if (failure === "json") return new Response("not json");
      if (failure === "error") return Response.json({ error: "secret details" });
      return Response.json({ result: [1, 99, 1, 1] });
    });
    const item = context();
    await assert.rejects(consumeGenerationQuota(item.req, item.res), (error) => {
      assert.equal(error.statusCode, 503);
      assert.ok(!error.message.includes("secret"));
      return true;
    });
  });
}

// Run against an actual disposable Redis instance when binaries are available:
// WIDGET_TEST_REDIS_SERVER=/path/redis-server WIDGET_TEST_REDIS_CLI=/path/redis-cli
// node --test tests/generation-quota.test.mjs
test("real Redis enforces concurrent rolling IP and browser limits atomically", {
  skip: !process.env.WIDGET_TEST_REDIS_SERVER || !process.env.WIDGET_TEST_REDIS_CLI
}, async (t) => {
  configure(t);
  const directory = await mkdtemp(path.join(os.tmpdir(), "widgets-quota-test-"));
  const socket = path.join(directory, "redis.sock");
  const server = spawn(process.env.WIDGET_TEST_REDIS_SERVER, [
    "--port", "0", "--unixsocket", socket, "--save", "", "--appendonly", "no"
  ], { stdio: ["ignore", "pipe", "pipe"] });
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
      if (String(chunk).includes("ready to accept connections") || String(chunk).includes("Ready to accept connections")) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
  async function command(args) {
    const { stdout } = await runFile(process.env.WIDGET_TEST_REDIS_CLI, ["-s", socket, "--json", ...args]);
    return JSON.parse(stdout);
  }
  const seenCommands = [];
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    const args = JSON.parse(options.body);
    seenCommands.push(args);
    return Response.json({ result: await command(args) });
  });
  async function consume(ip, cookie) {
    const item = context(ip, cookie);
    const quota = await consumeGenerationQuota(item.req, item.res);
    return { ...item, quota, cookie: item.headers["set-cookie"]?.split(";")[0] ?? cookie };
  }

  const concurrent = await Promise.allSettled(Array.from({ length: 12 }, () => consume("203.0.113.10")));
  assert.equal(concurrent.filter((entry) => entry.status === "fulfilled").length, 3);
  assert.ok(concurrent.filter((entry) => entry.status === "rejected").every((entry) => entry.reason.statusCode === 429));

  const first = await consume("203.0.113.20");
  await consume("203.0.113.21", first.cookie);
  await consume("203.0.113.22", first.cookie);
  await assert.rejects(consume("203.0.113.23", first.cookie), { statusCode: 429 });
  assert.equal((await consume("203.0.113.23")).quota.remaining, 2, "rejection must not consume the fresh IP quota");
  await consume("203.0.113.23");
  await consume("203.0.113.23");
  await assert.rejects(consume("203.0.113.23"), { statusCode: 429 });

  // Seed all three events outside the rolling window: no wall-clock sleeps,
  // and no reset boundary which could allow six immediate calls.
  const ipKey = seenCommands[0][3];
  await command(["EVAL", "local t = redis.call('TIME'); local old = tonumber(t[1])*1000 - 86400001; redis.call('DEL',KEYS[1]); for i=1,3 do redis.call('ZADD',KEYS[1],old,tostring(i)); end; return 1", "1", ipKey]);
  assert.equal((await consume("203.0.113.10")).quota.remaining, 2);

  // A separate module instance still observes the shared store's quota.
  const other = await import(`../api/_lib/generation-quota.js?instance=${Date.now()}`);
  const repeated = context("203.0.113.23");
  await assert.rejects(other.consumeGenerationQuota(repeated.req, repeated.res), { statusCode: 429 });
});
