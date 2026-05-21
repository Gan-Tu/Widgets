import { parseExpression } from "@babel/parser";
import { readFile } from "node:fs/promises";
import path from "node:path";

const RATE_LIMIT = {
  limit: 20,
  windowMs: 60_000
};

const buckets = new Map();

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["designSpec", "template", "sampleDataJson", "theme"],
  properties: {
    designSpec: {
      type: "string",
      description: "A concise design rationale, no more than 3 short sentences."
    },
    template: {
      type: "string",
      description: "A valid Widget UI template string using only allowed components."
    },
    sampleDataJson: {
      type: "string",
      description:
        "A valid JSON object string containing sample data for the template."
    },
    theme: {
      type: "string",
      enum: ["light", "dark"]
    }
  }
};

function sendJson(res, status, body, headers = {}) {
  res.statusCode = status;
  Object.entries({
    "content-type": "application/json; charset=utf-8",
    ...headers
  }).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.end(JSON.stringify(body));
}

function getClientKey(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const firstForwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "anonymous"
  );
}

function checkRateLimit(req) {
  const key = String(getClientKey(req));
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const nextBucket = { count: 1, resetAt: now + RATE_LIMIT.windowMs };
    buckets.set(key, nextBucket);
    return {
      allowed: true,
      remaining: RATE_LIMIT.limit - nextBucket.count,
      resetAt: nextBucket.resetAt
    };
  }

  if (bucket.count >= RATE_LIMIT.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT.limit - bucket.count,
    resetAt: bucket.resetAt
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJsonBody(req) {
  const rawBody = await readBody(req);
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function parseModelOutput(output) {
  if (!output || typeof output !== "object") {
    throw new Error("The model returned an empty response.");
  }

  const { template, sampleDataJson, theme, designSpec } = output;
  if (typeof template !== "string" || !template.trim()) {
    throw new Error("The model did not return a widget template.");
  }
  if (typeof sampleDataJson !== "string" || !sampleDataJson.trim()) {
    throw new Error("The model did not return sample data.");
  }

  parseExpression(template.trim(), {
    plugins: ["jsx", "typescript"]
  });

  const data = JSON.parse(sampleDataJson);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Sample data must be a JSON object.");
  }

  return {
    template: template.trim(),
    data,
    theme: theme === "dark" ? "dark" : "light",
    designSpec:
      typeof designSpec === "string"
        ? designSpec.trim()
        : "Generated compact widget."
  };
}

async function callOpenAI(prompt) {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const agentPrompt = await readFile(
    path.join(process.cwd(), "public", "AGENTS.md"),
    "utf8"
  );

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: agentPrompt
        },
        {
          role: "user",
          content: [
            "Create a compact Widget UI response for this request.",
            "Return a valid template and a sample JSON object that satisfies it.",
            "Do not include markdown fences in string fields.",
            "",
            `User request: ${prompt}`
          ].join("\n")
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "widget_authoring_result",
          strict: true,
          schema: outputSchema
        }
      }
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message || `OpenAI request failed (${response.status}).`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const text = payload?.output
    ?.flatMap((item) => item?.content ?? [])
    ?.find((content) => content?.type === "output_text")?.text;

  if (typeof text !== "string") {
    throw new Error("OpenAI response did not include output text.");
  }

  return parseModelOutput(JSON.parse(text));
}

async function getOpenAIKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  try {
    const envFile = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    const match = envFile.match(/^OPENAI_API_KEY=(.*)$/m);
    return match?.[1]?.trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." }, { allow: "POST" });
    return;
  }

  const rateLimit = checkRateLimit(req);
  const resetSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));

  res.setHeader("x-ratelimit-limit", String(RATE_LIMIT.limit));
  res.setHeader("x-ratelimit-remaining", String(rateLimit.remaining));
  res.setHeader("x-ratelimit-reset", String(Math.ceil(rateLimit.resetAt / 1000)));

  if (!rateLimit.allowed) {
    sendJson(
      res,
      429,
      {
        error: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`
      },
      { "retry-after": String(resetSeconds) }
    );
    return;
  }

  try {
    const body = await readJsonBody(req);
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      sendJson(res, 400, { error: "Prompt is required." });
      return;
    }

    if (prompt.length > 2_000) {
      sendJson(res, 400, { error: "Prompt must be 2,000 characters or fewer." });
      return;
    }

    const result = await callOpenAI(prompt);
    sendJson(res, 200, result);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    sendJson(res, status, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate a widget."
    });
  }
}
