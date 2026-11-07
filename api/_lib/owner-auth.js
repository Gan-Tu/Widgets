import { createHash, createHmac, randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import { getTrustedClientIp } from "./generation-quota.js";

const PREFIX = "{widgets-owner}:v1";
const CREDENTIALS = `${PREFIX}:credentials`;
const EPOCH = `${PREFIX}:epoch`;
const SESSION_SECONDS = 90 * 24 * 60 * 60;
const RENEW_SECONDS = 30 * 24 * 60 * 60;
const CEREMONY_SECONDS = 300;
const INVITE_SECONDS = 600;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const CREDENTIAL_ID = /^[A-Za-z0-9_-]{1,1400}$/;
const USER_ID = new TextEncoder().encode("widgets-private-owner");

function httpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}
const unavailable = () => httpError("Owner access is temporarily unavailable.", 503);
const unauthorized = () => httpError("Owner authorization is required.", 401);
const invalidCeremony = () => httpError("This authorization attempt expired or could not be verified. Please try again.", 400);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const secureCookies = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const cookieName = (kind) => `${secureCookies() ? "__Host-" : ""}widget_${kind}`;

export function getOwnerConfig() {
  try {
    const raw = process.env.WIDGET_OWNER_ORIGIN;
    const url = new URL(raw);
    if (raw !== url.origin && raw !== `${url.origin}/`) throw unavailable();
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost" && !secureCookies())) throw unavailable();
    return { origin: url.origin, rpID: url.hostname };
  } catch {
    throw unavailable();
  }
}

export function requireSameOrigin(req) {
  const { origin } = getOwnerConfig();
  if (req.headers.origin !== origin) throw httpError("This request must come from the Widgets website.", 403);
  if (req.headers["sec-fetch-site"] && req.headers["sec-fetch-site"] !== "same-origin") {
    throw httpError("This request must come from the Widgets website.", 403);
  }
}

function readCookie(req, kind) {
  const name = `${cookieName(kind)}=`;
  const header = typeof req.headers.cookie === "string" ? req.headers.cookie : "";
  const values = header.split(";").map((part) => part.trim()).filter((part) => part.startsWith(name));
  // Do not let duplicate cookie ordering decide an authorization identity.
  return values.length === 1 ? values[0].slice(name.length) : null;
}

function setCookie(res, kind, value, seconds) {
  const cookie = `${cookieName(kind)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${secureCookies() ? "; Secure" : ""}`;
  const previous = res.getHeader?.("set-cookie");
  res.setHeader("set-cookie", previous ? [...(Array.isArray(previous) ? previous : [previous]), cookie] : cookie);
}

// A REST command is deliberately never automatically retried: mutations may
// already have happened when a network response is lost.
async function redis(...command) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  try {
    const endpoint = new URL(url);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || !token) throw unavailable();
    const response = await fetch(endpoint.href, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) throw unavailable();
    const payload = await response.json();
    if (!payload || payload.error || !Object.hasOwn(payload, "result")) throw unavailable();
    return payload.result;
  } catch {
    throw unavailable();
  }
}

function parseRecord(value) {
  try {
    const record = JSON.parse(value);
    if (!record || typeof record !== "object" || Array.isArray(record)) throw unavailable();
    return record;
  } catch {
    throw unavailable();
  }
}

function sessionKey(token) {
  return `${PREFIX}:session:${digest(token)}`;
}

const SESSION_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return false end
local session = cjson.decode(raw)
local epoch = redis.call('GET', KEYS[2]) or '0'
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000
if session.epoch ~= epoch or session.expiresAt <= now or redis.call('HEXISTS', KEYS[3], session.credentialId) == 0 then
  redis.call('DEL', KEYS[1])
  return false
end
local renewed = 0
if session.expiresAt - now < tonumber(ARGV[1]) * 1000 then
  session.expiresAt = now + tonumber(ARGV[2]) * 1000
  redis.call('SET', KEYS[1], cjson.encode(session), 'EX', ARGV[2])
  renewed = 1
end
return {cjson.encode(session), renewed}
`;

export async function getOwnerSession(req, res) {
  const token = readCookie(req, "owner");
  if (!token) return null;
  if (!TOKEN.test(token)) {
    setCookie(res, "owner", "", 0);
    return null;
  }
  getOwnerConfig();
  const key = sessionKey(token);
  const result = await redis("EVAL", SESSION_SCRIPT, "3", key, EPOCH, CREDENTIALS, String(RENEW_SECONDS), String(SESSION_SECONDS));
  if (result === null || result === false) {
    setCookie(res, "owner", "", 0);
    return null;
  }
  if (!Array.isArray(result) || result.length !== 2 || ![0, 1].includes(result[1])) throw unavailable();
  const session = parseRecord(result[0]);
  if (typeof session.credentialId !== "string" || !CREDENTIAL_ID.test(session.credentialId) || !Number.isSafeInteger(session.expiresAt) || typeof session.epoch !== "string") throw unavailable();
  if (result[1] === 1) setCookie(res, "owner", token, SESSION_SECONDS);
  return { ...session, sessionKey: key };
}

export async function limitOwnerRequests(req, res) {
  const ip = getTrustedClientIp(req);
  const secret = process.env.WIDGET_QUOTA_SECRET;
  if (!ip || !secret || secret.length < 32) throw unavailable();
  const identity = createHmac("sha256", secret).update(`owner-rate:${ip}`).digest("hex");
  const result = await redis("EVAL", `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 60) end
return {count, redis.call('TTL', KEYS[1])}
`, "1", `${PREFIX}:rate:${identity}`);
  if (!Array.isArray(result) || result.length !== 2 || !result.every(Number.isSafeInteger) || result[0] < 1 || result[1] < 0) throw unavailable();
  if (result[0] > 20) {
    res.setHeader("retry-after", String(Math.max(1, result[1])));
    throw httpError("Too many owner access attempts. Please try again shortly.", 429);
  }
}

async function currentEpoch() {
  const epoch = await redis("GET", EPOCH);
  if (epoch !== null && (typeof epoch !== "string" || !/^\d+$/.test(epoch))) throw unavailable();
  return epoch || "0";
}

export async function listOwnerCredentials() {
  const entries = await redis("HGETALL", CREDENTIALS);
  if (!Array.isArray(entries) || entries.length % 2 !== 0) throw unavailable();
  const credentials = [];
  for (let index = 0; index < entries.length; index += 2) {
    const item = parseRecord(entries[index + 1]);
    if (typeof entries[index] !== "string" || !CREDENTIAL_ID.test(entries[index]) || !Number.isSafeInteger(item.createdAt)) throw unavailable();
    credentials.push({ id: entries[index], createdAt: item.createdAt });
  }
  return credentials;
}

export async function createOwnerInvite() {
  const { origin } = getOwnerConfig();
  const token = newToken();
  const epoch = await currentEpoch();
  const result = await redis("SET", `${PREFIX}:invite:${digest(token)}`, epoch, "EX", String(INVITE_SECONDS), "NX");
  if (result !== "OK") throw unavailable();
  return { url: `${origin}/playground#owner-invite=${token}`, expiresInSeconds: INVITE_SECONDS };
}

export async function revokeAllOwnerSessions() {
  const epoch = await redis("INCR", EPOCH);
  if (!Number.isSafeInteger(epoch)) throw unavailable();
}

export async function revokeOwnerCredential(credentialId) {
  if (typeof credentialId !== "string" || !CREDENTIAL_ID.test(credentialId)) throw httpError("Invalid passkey.", 400);
  const count = await redis("HDEL", CREDENTIALS, credentialId);
  if (![0, 1].includes(count)) throw unavailable();
}

async function writeCeremony(req, res, type, challenge, { session, inviteToken } = {}) {
  const token = newToken();
  const epoch = await currentEpoch();
  const record = { type, challenge, epoch, sessionKey: session?.sessionKey || null };
  const key = `${PREFIX}:ceremony:${digest(token)}`;
  if (type === "register") {
    const invite = typeof inviteToken === "string" && TOKEN.test(inviteToken) ? `${PREFIX}:invite:${digest(inviteToken)}` : `${PREFIX}:no-invite`;
    const result = await redis("EVAL", `
local epoch = redis.call('GET', KEYS[1]) or '0'
if epoch ~= ARGV[1] then return 0 end
if ARGV[3] ~= '' then
  local raw = redis.call('GET', KEYS[3])
  if not raw then return 0 end
  local session = cjson.decode(raw)
  if session.epoch ~= epoch or redis.call('HEXISTS', KEYS[4], session.credentialId) == 0 then return 0 end
else
  local invitation = redis.call('GET', KEYS[5])
  if not invitation or invitation ~= epoch then return 0 end
  redis.call('DEL', KEYS[5])
end
redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[4])
return 1
`, "5", EPOCH, key, session?.sessionKey || `${PREFIX}:no-session`, CREDENTIALS, invite,
    epoch, JSON.stringify(record), session?.sessionKey || "", String(CEREMONY_SECONDS));
    if (result !== 1) throw httpError("This setup link is invalid or expired. Request a new private link.", 403);
  } else {
    const result = await redis("SET", key, JSON.stringify(record), "EX", String(CEREMONY_SECONDS), "NX");
    if (result !== "OK") throw unavailable();
  }
  setCookie(res, "ceremony", token, CEREMONY_SECONDS);
}

async function takeCeremony(req, res, type) {
  const token = readCookie(req, "ceremony");
  setCookie(res, "ceremony", "", 0);
  if (!token || !TOKEN.test(token)) throw invalidCeremony();
  const raw = await redis("GETDEL", `${PREFIX}:ceremony:${digest(token)}`);
  if (raw === null) throw invalidCeremony();
  const record = parseRecord(raw);
  if (record.type !== type || typeof record.challenge !== "string" || typeof record.epoch !== "string") throw invalidCeremony();
  return record;
}

// Session issuance is atomic with membership/epoch verification and credential
// writes. A concurrent revocation cannot resurrect a credential or session.
const COMPLETE_SCRIPT = `
local epoch = redis.call('GET', KEYS[1]) or '0'
if epoch ~= ARGV[1] then return false end
if ARGV[2] == 'register' then
  if ARGV[6] ~= '' then
    local raw = redis.call('GET', KEYS[4])
    if not raw then return false end
    local owner = cjson.decode(raw)
    if owner.epoch ~= epoch or redis.call('HEXISTS', KEYS[2], owner.credentialId) == 0 then return false end
  end
  if redis.call('HLEN', KEYS[2]) >= 10 or redis.call('HEXISTS', KEYS[2], ARGV[3]) == 1 then return false end
else
  if redis.call('HGET', KEYS[2], ARGV[3]) ~= ARGV[5] then return false end
end
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000
local credential = cjson.decode(ARGV[4])
if ARGV[2] == 'register' then credential.createdAt = now end
redis.call('HSET', KEYS[2], ARGV[3], cjson.encode(credential))
local session = {credentialId=ARGV[3], epoch=epoch, expiresAt=now + tonumber(ARGV[7])*1000}
redis.call('SET', KEYS[3], cjson.encode(session), 'EX', ARGV[7])
return cjson.encode(session)
`;

async function complete(res, ceremony, credential, original = "") {
  const token = newToken();
  const raw = await redis("EVAL", COMPLETE_SCRIPT, "4", EPOCH, CREDENTIALS, sessionKey(token), ceremony.sessionKey || `${PREFIX}:no-session`,
    ceremony.epoch, ceremony.type, credential.id, JSON.stringify(credential), original, ceremony.sessionKey || "", String(SESSION_SECONDS));
  if (raw === null || raw === false) throw invalidCeremony();
  const session = parseRecord(raw);
  if (!Number.isSafeInteger(session.expiresAt)) throw unavailable();
  setCookie(res, "owner", token, SESSION_SECONDS);
  return { owner: true, expiresAt: session.expiresAt };
}

export async function handleOwnerAction(req, res, body) {
  const { origin, rpID } = getOwnerConfig();
  switch (body.action) {
    case "register-options": {
      const session = await getOwnerSession(req, res);
      if (!session && (typeof body.inviteToken !== "string" || !TOKEN.test(body.inviteToken))) throw unauthorized();
      const options = await generateRegistrationOptions({
        rpName: "Widgets owner access", rpID, userName: "Widgets owner", userDisplayName: "Widgets owner",
        userID: USER_ID, attestationType: "none",
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        excludeCredentials: (await listOwnerCredentials()).map(({ id }) => ({ id }))
      });
      await writeCeremony(req, res, "register", options.challenge, { session, inviteToken: body.inviteToken });
      return { options };
    }
    case "register-verify": {
      const ceremony = await takeCeremony(req, res, "register");
      let verified;
      try {
        verified = await verifyRegistrationResponse({ response: body.response, expectedChallenge: ceremony.challenge,
          expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
      } catch { throw invalidCeremony(); }
      if (!verified.verified) throw invalidCeremony();
      const credential = verified.registrationInfo.credential;
      if (!CREDENTIAL_ID.test(credential.id)) throw invalidCeremony();
      return complete(res, ceremony, {
        id: credential.id, publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter, transports: credential.transports || []
      });
    }
    case "authenticate-options": {
      const options = await generateAuthenticationOptions({ rpID, userVerification: "required" });
      await writeCeremony(req, res, "authenticate", options.challenge);
      return { options };
    }
    case "authenticate-verify": {
      const ceremony = await takeCeremony(req, res, "authenticate");
      const id = body.response?.id;
      if (typeof id !== "string" || !CREDENTIAL_ID.test(id)) throw invalidCeremony();
      const raw = await redis("HGET", CREDENTIALS, id);
      if (raw === null) throw invalidCeremony();
      const stored = parseRecord(raw);
      let verified;
      try {
        verified = await verifyAuthenticationResponse({ response: body.response, expectedChallenge: ceremony.challenge,
          expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true,
          credential: { id, publicKey: new Uint8Array(Buffer.from(stored.publicKey, "base64url")), counter: stored.counter, transports: stored.transports }
        });
      } catch { throw invalidCeremony(); }
      if (!verified.verified) throw invalidCeremony();
      return complete(res, ceremony, { ...stored, counter: verified.authenticationInfo.newCounter }, raw);
    }
    case "logout": {
      const token = readCookie(req, "owner");
      if (token && TOKEN.test(token)) await redis("DEL", sessionKey(token));
      setCookie(res, "owner", "", 0);
      return { owner: false };
    }
    case "revoke-all": {
      if (!await getOwnerSession(req, res)) throw unauthorized();
      await revokeAllOwnerSessions();
      setCookie(res, "owner", "", 0);
      return { owner: false };
    }
    case "remove-passkey": {
      if (!await getOwnerSession(req, res)) throw unauthorized();
      await revokeOwnerCredential(body.credentialId);
      const session = await getOwnerSession(req, res);
      return session ? { owner: true, expiresAt: session.expiresAt, credentials: await listOwnerCredentials() } : { owner: false };
    }
    default: throw httpError("Unknown owner access action.", 400);
  }
}
