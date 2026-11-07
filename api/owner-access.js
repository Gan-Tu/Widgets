import { getOwnerSession, handleOwnerAction, limitOwnerRequests, listOwnerCredentials, requireSameOrigin } from "./_lib/owner-auth.js";

function reply(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (typeof req.headers["content-type"] !== "string" || req.headers["content-type"].split(";")[0].trim().toLowerCase() !== "application/json") {
    throw Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 });
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > 65_536) throw Object.assign(new Error("Request is too large."), { statusCode: 413 });
    chunks.push(Buffer.from(chunk));
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw Object.assign(new Error("Invalid request."), { statusCode: 400 });
  }
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("referrer-policy", "no-referrer");
  try {
    if (req.method === "GET") {
      const session = await getOwnerSession(req, res);
      reply(res, 200, session ? { owner: true, expiresAt: session.expiresAt, credentials: await listOwnerCredentials() } : { owner: false });
      return;
    }
    if (req.method !== "POST") {
      res.setHeader("allow", "GET, POST");
      reply(res, 405, { error: "Method not allowed." });
      return;
    }
    requireSameOrigin(req);
    const body = await readBody(req);
    await limitOwnerRequests(req, res);
    reply(res, 200, await handleOwnerAction(req, res, body));
  } catch (error) {
    const status = Number(error?.statusCode) || 503;
    reply(res, status, { error: error?.statusCode ? error.message : "Owner access is temporarily unavailable." });
  }
}
