import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

const LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const UNAVAILABLE = "Generation limits are temporarily unavailable. Please try again later.";

// One script runs on the primary store: both rolling windows are checked and
// consumed atomically, including across concurrent serverless instances.
export const GENERATION_QUOTA_SCRIPT = `
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000 + math.floor(tonumber(clock[2]) / 1000)
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local counts = {}
local allowed = 1
for i, key in ipairs(KEYS) do
  redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
  counts[i] = redis.call('ZCARD', key)
  if counts[i] >= limit then allowed = 0 end
end
if allowed == 1 then
  for i, key in ipairs(KEYS) do
    redis.call('ZADD', key, now, ARGV[3])
    redis.call('PEXPIRE', key, window)
    counts[i] = counts[i] + 1
  end
end
local largest = math.max(counts[1], counts[2])
local reset = now
for i, key in ipairs(KEYS) do
  if counts[i] == largest and counts[i] > 0 then
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    reset = math.max(reset, tonumber(oldest[2]) + window)
  end
end
return {allowed, math.max(0, limit - largest), reset, now}
`;

function unavailable() {
  return Object.assign(new Error(UNAVAILABLE), { statusCode: 503 });
}

function canonicalIp(value) {
  if (typeof value !== "string" || value.includes("%")) return null;
  const address = value.trim();
  const family = isIP(address);
  if (family === 4) return address;
  if (family !== 6) return null;
  const normalized = new URL(`http://[${address}]`).hostname.slice(1, -1);
  // A direct socket can represent IPv4 as IPv6; both must share one bucket.
  const mapped = normalized.match(/^::ffff:([0-9a-f]+):([0-9a-f]+)$/);
  if (mapped) {
    const high = parseInt(mapped[1], 16);
    const low = parseInt(mapped[2], 16);
    return [high >>> 8, high & 255, low >>> 8, low & 255].join(".");
  }
  return normalized;
}

export function getTrustedClientIp(req) {
  // Vercel overwrites this header at its edge. Outside Vercel no request
  // headers are trusted: a separately hosted proxy needs an explicit adapter.
  const address = process.env.VERCEL === "1"
    ? req.headers["x-forwarded-for"]
    : req.socket?.remoteAddress;
  return canonicalIp(address);
}

function digest(secret, purpose, value) {
  return createHmac("sha256", secret).update(`${purpose}:${value}`).digest("base64url");
}

function visitorId(req, res, secret) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const cookieName = secure ? "__Host-widget_visitor" : "widget_visitor";
  const cookies = typeof req.headers.cookie === "string" ? req.headers.cookie : "";
  const value = cookies.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const match = value?.match(/^v1\.([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/);
  if (match) {
    const expected = digest(secret, "visitor-cookie-v1", match[1]);
    if (timingSafeEqual(Buffer.from(match[2]), Buffer.from(expected))) return match[1];
  }

  const id = randomUUID();
  const signed = `v1.${id}.${digest(secret, "visitor-cookie-v1", id)}`;
  const cookie = `${cookieName}=${signed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure ? "; Secure" : ""}`;
  const existing = res.getHeader?.("set-cookie");
  res.setHeader("set-cookie", existing ? [...(Array.isArray(existing) ? existing : [existing]), cookie] : cookie);
  return id;
}

export async function consumeGenerationQuota(req, res) {
  res.setHeader("cache-control", "no-store");
  const secret = process.env.WIDGET_QUOTA_SECRET;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const ip = getTrustedClientIp(req);
  if (!secret || secret.length < 32 || !url || !token || !ip) throw unavailable();
  let endpoint;
  try {
    endpoint = new URL(url);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) throw unavailable();
  } catch {
    throw unavailable();
  }

  const visitor = visitorId(req, res, secret);
  // Shared hash tag keeps both keys in the same Redis cluster slot. Raw IPs
  // and cookie values are never stored, and the two HMAC domains are distinct.
  const prefix = "{widgets-generation-quota}:v1";
  const keys = [
    `${prefix}:ip:${digest(secret, "quota-ip", ip)}`,
    `${prefix}:visitor:${digest(secret, "quota-visitor", visitor)}`
  ];

  let result;
  try {
    const response = await fetch(endpoint.href, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(["EVAL", GENERATION_QUOTA_SCRIPT, "2", ...keys, String(WINDOW_MS), String(LIMIT), randomUUID()]),
      signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) throw unavailable();
    const payload = await response.json();
    result = payload.result;
    if (payload.error || !Array.isArray(result) || result.length !== 4 ||
        !result.every(Number.isSafeInteger) || ![0, 1].includes(result[0]) ||
        result[1] < 0 || result[1] > LIMIT || result[3] <= 0 ||
        result[2] <= result[3] || result[2] > result[3] + WINDOW_MS ||
        (result[0] === 0 && result[1] !== 0)) throw unavailable();
  } catch {
    // A timeout may mean the script already consumed the allowance. Never
    // retry automatically or refund an uncertain result: fail closed instead.
    throw unavailable();
  }

  const [allowed, remaining, resetAt, now] = result;
  res.setHeader("x-generation-limit", String(LIMIT));
  res.setHeader("x-generation-remaining", String(remaining));
  res.setHeader("x-generation-reset", String(Math.ceil(resetAt / 1000)));
  if (!allowed) {
    res.setHeader("retry-after", String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
    throw Object.assign(new Error("Free generation limit reached (3 per browser and network in 24 hours). Please try again when your allowance resets."), { statusCode: 429 });
  }
  return { limit: LIMIT, remaining, resetAt };
}
