import { parse, parseExpression } from "@babel/parser";
import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MODEL = "gpt-5.5";
const MAX_PROMPT_LENGTH = 2_000;
const MAX_REFERENCE_IMAGES = 3;
const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ASSET_SEARCHES = 10;
const MAX_AVAILABLE_IMAGES = 24;
const FINAL_GENERATION_STATUS_INTERVAL_MS = 8_000;
const MAX_REQUEST_BODY_BYTES =
  Math.ceil(MAX_REFERENCE_IMAGES * MAX_REFERENCE_IMAGE_BYTES * 1.5) + 200_000;

const RATE_LIMIT = {
  limit: 20,
  windowMs: 60_000
};

const REFERENCE_IMAGE_DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpe?g|webp));base64,([a-z0-9+/=\s]+)$/i;

const IMAGE_REQUEST_PATTERN =
  /\b(images?|photos?|pictures?|thumbnails?|logos?|avatars?|covers?|posters?|visuals?)\b/i;
const CURRENT_FACTS_PATTERN =
  /\b(current|latest|today|tonight|now|live|recent|newest|upcoming|pricing|price|release|status|news|202[5-9]|203[0-9])\b/i;

const finalGenerationStatuses = [
  "Generating the widget interface",
  "Needing more time",
  "Shaping the layout",
  "Choosing the right structure",
  "Fitting the data into the widget",
  "Balancing the content",
  "Arranging the sections",
  "Tuning the visual hierarchy",
  "Checking the preview",
  "Reviewing the widget data",
  "Polishing the details",
  "Keeping the widget compact",
  "Preparing the final widget"
];

const rootComponents = new Set(["Basic", "Card", "ListView", "Response"]);
const supportedFunctionCalls = new Set([
  "append",
  "bind",
  "Boolean",
  "bp",
  "ceil",
  "closeExpr",
  "expr",
  "floor",
  "has",
  "isDark",
  "isMobile",
  "isSafeExpr",
  "max",
  "min",
  "mutateExpr",
  "now",
  "Number",
  "prepend",
  "read",
  "remove",
  "round",
  "set",
  "size",
  "String"
]);

const imageUrlPropsByComponent = new Map([
  ["Avatar", new Set(["src"])],
  ["Favicon", new Set(["src", "url"])],
  ["Image", new Set(["src"])]
]);

let widgetRegistryComponentCache;

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["designSpec", "template", "data", "theme"],
  properties: {
    designSpec: {
      type: "string",
      description: "A concise design rationale, no more than 3 short sentences."
    },
    template: {
      type: "string",
      description: "A valid Widget UI template string using only allowed components."
    },
    data: {
      type: "object",
      description: "A JSON object containing all data referenced by the template.",
      additionalProperties: true
    },
    theme: {
      type: "string",
      enum: ["light", "dark"]
    }
  }
};

const assetPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["webSearches", "imageSearches"],
  properties: {
    webSearches: {
      type: "array",
      maxItems: MAX_ASSET_SEARCHES,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["query", "purpose"],
        properties: {
          query: { type: "string" },
          purpose: { type: "string" }
        }
      }
    },
    imageSearches: {
      type: "array",
      maxItems: MAX_ASSET_SEARCHES,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["query", "purpose"],
        properties: {
          query: { type: "string" },
          purpose: { type: "string" }
        }
      }
    }
  }
};

const assetPlanningPrompt = `
You decide whether a generated widget needs current web research, real web image URLs, both, or neither.

Return webSearches as an empty array unless current or factual web information would clearly improve the final widget.
Use web search for real entities or topics where details matter, such as movies, shows, books, products, restaurants, travel destinations, companies, public figures, sports, events, venues, news, releases, prices, ratings, or current status.
Do not use web search for generic dashboards, forms, settings panels, package tracking, mock finance summaries, timers, todo lists, schedules, invoices, alerts, or purely fictional/demo cards unless the user asks for real/current information.

Return imageSearches as an empty array unless real images would clearly improve the final widget.
If the user explicitly asks for images, photos, pictures, thumbnails, logos, avatars, covers, posters, or visual rows/cards, return imageSearches.
Use image search for visual, real-world subjects such as products, movies, books, restaurants, travel destinations, venues, public figures, brands, articles, albums, recipes, or events.
For dashboards, forms, settings panels, package tracking, finance summaries, metrics, timers, todo lists, schedules, invoices, alerts, and status cards, use image search when a real visual anchor would materially improve the widget, such as product photos, merchant logos, app icons, carrier logos, venue photos, cover art, company logos, person headshots, or other concrete subjects implied by the prompt.
Skip image search only when the widget is purely abstract, numeric, text-only, or would be clearer with icons/badges instead of external images.

When searches are useful:
- Return as many precise webSearches as are useful for the widget, up to ${MAX_ASSET_SEARCHES}. Use fewer when fewer are enough.
- Return as many precise image search queries as are useful for the widget, up to ${MAX_ASSET_SEARCHES}. Use fewer when fewer are enough.
- If the user specifies a count of entities/items/cards/images to show, use that count as guidance for search count when useful, capped at ${MAX_ASSET_SEARCHES}.
- Each query should name the concrete thing to research or show, not the entire user prompt.
- Prefer product/place/person/media-title queries that can return directly usable image URLs.
`.trim();

const buckets = new Map();

function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

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

function sendStreamLine(res, event) {
  res.write(`${JSON.stringify(event)}\n`);
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
    let byteLength = 0;

    req.on("data", (chunk) => {
      byteLength += chunk.length;
      if (byteLength > MAX_REQUEST_BODY_BYTES) {
        reject(createHttpError("Request body is too large.", 400));
        req.destroy();
        return;
      }
      body += chunk;
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
    throw createHttpError("Request body must be valid JSON.", 400);
  }
}

function normalizeModel(model) {
  if (typeof model !== "string") return DEFAULT_MODEL;
  const trimmed = model.trim();
  if (!trimmed) return DEFAULT_MODEL;
  if (!/^[a-z0-9._:/-]{1,80}$/i.test(trimmed)) {
    throw createHttpError("Model name is invalid.", 400);
  }
  return trimmed;
}

function getDataUrlByteSize(dataUrl) {
  const base64 = dataUrl.split(",", 2)[1]?.replace(/\s/g, "") || "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function normalizeReferenceImages(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw createHttpError("referenceImages must be an array.", 400);
  }
  if (value.length > MAX_REFERENCE_IMAGES) {
    throw createHttpError(
      `You can upload at most ${MAX_REFERENCE_IMAGES} reference images.`,
      400
    );
  }

  return value.map((image, index) => {
    if (!image || typeof image !== "object") {
      throw createHttpError("Reference images must include dataUrl strings.", 400);
    }

    const dataUrl = typeof image.dataUrl === "string" ? image.dataUrl.trim() : "";
    const match = dataUrl.match(REFERENCE_IMAGE_DATA_URL_PATTERN);
    if (!match) {
      throw createHttpError("Reference images must be PNG, JPEG, or WebP data URLs.", 400);
    }

    if (getDataUrlByteSize(dataUrl) > MAX_REFERENCE_IMAGE_BYTES) {
      throw createHttpError("Each reference image must be 5 MB or smaller.", 400);
    }

    return {
      name:
        typeof image.name === "string" && image.name.trim()
          ? image.name.trim().slice(0, 120)
          : `reference-${index + 1}`,
      dataUrl,
      mimeType: match[1].toLowerCase()
    };
  });
}

function validateGenerateRequest(body) {
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    throw createHttpError("Prompt is required.", 400);
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw createHttpError(
      `Prompt must be ${MAX_PROMPT_LENGTH.toLocaleString()} characters or fewer.`,
      400
    );
  }

  return {
    prompt,
    model: normalizeModel(body.model),
    referenceImages: normalizeReferenceImages(body.referenceImages)
  };
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

async function callOpenAIResponses(apiKey, body) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const rawText = await response.text();
  let payload = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    if (!response.ok) {
      throw createHttpError(
        `OpenAI request failed (${response.status}).`,
        response.status
      );
    }
    throw new Error("OpenAI returned an invalid JSON response.");
  }
  if (!response.ok) {
    const message =
      payload?.error?.message || `OpenAI request failed (${response.status}).`;
    throw createHttpError(message, response.status);
  }

  return payload;
}

function collectOutputText(value, text = []) {
  if (!value || typeof value !== "object") return text;

  if (Array.isArray(value)) {
    for (const item of value) collectOutputText(item, text);
    return text;
  }

  if (value.type === "output_text" && typeof value.text === "string") {
    text.push(value.text);
  }

  for (const child of Object.values(value)) {
    collectOutputText(child, text);
  }

  return text;
}

function extractJsonText(text) {
  return text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? text.trim();
}

function parseJsonOutput(payload) {
  const outputText = collectOutputText(payload).join("\n").trim();
  if (!outputText) throw new Error("OpenAI response did not include output text.");
  return JSON.parse(extractJsonText(outputText));
}

function createReferenceImagePrompt(prompt, referenceImages) {
  const imageNames = referenceImages.map((image) => image.name).join(", ");

  return `
You are analyzing uploaded reference images for a Widget UI generator.

The final output will be a compact chat widget, mobile-friendly, usually around
400px wide and never wider than 600px unless the renderer supports more. The
generator can use declarative Widget UI components such as Card, Row, Col, Box,
Text, Title, Caption, Badge, Button, Image, Avatar, Table, List, Each, Show, and
form controls. It cannot use custom CSS, arbitrary JavaScript, callbacks, or
uploaded image data URLs in the final widget data.

User prompt:
${prompt}

Reference image files:
${imageNames || "Unnamed uploaded images"}

Return concise, structured notes for the planner and final widget generator:
- User intent alignment: what kind of widget the images imply for this prompt.
- Layout and hierarchy: major regions, reading order, density, spacing, and what should be centered, stacked, grouped, or repeated.
- Visual style: color palette, tone, radius, borders, shadows, typography scale, and whether the widget should feel plain, polished, dense, playful, editorial, etc.
- Widget components: likely Widget UI primitives to mirror, such as Card, Row, Col, Image, Badge, Table, Button, Progress, List, or form controls.
- Content cues: visible labels or values that are safe and relevant to mirror.
- Image/media guidance: where real image URLs would help the final widget and what concrete subjects those image searches should target.
- Customer/contact guidance: whether the reference implies a customer profile, checkout contact block, delivery details, account owner, or similar demo fields.
- Avoid: visual clutter, unsupported UI patterns, real privacy-sensitive details, or anything that would not fit a narrow compact widget.

Privacy and safety:
- Do not include uploaded image data URLs.
- Do not transcribe or expose real personal contact details, payment details, private addresses, or unique identifiers from the uploaded images.
- You may say that the final widget should use synthetic demo customer/contact placeholders such as a fake name, example.com email, 555 phone number, or generic address when that would match the layout.
- Do not invent facts outside what the prompt or reference images support.

Do not create the final widget. Do not include markdown fences. Keep the notes short but specific.
`.trim();
}

async function analyzeReferenceImages({ apiKey, model, prompt, referenceImages }) {
  if (referenceImages.length === 0) return "";

  const payload = await callOpenAIResponses(apiKey, {
    model,
    reasoning: { effort: "high" },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: createReferenceImagePrompt(prompt, referenceImages)
          },
          ...referenceImages.map((image) => ({
            type: "input_image",
            image_url: image.dataUrl,
            detail: "low"
          }))
        ]
      }
    ]
  });

  return collectOutputText(payload).join("\n").trim();
}

function createReferenceImageContext(referenceImages, notes) {
  if (referenceImages.length === 0) return undefined;

  return {
    count: referenceImages.length,
    names: referenceImages.map((image) => image.name),
    notes
  };
}

function normalizeSearches(searches) {
  if (!Array.isArray(searches)) return [];
  return searches
    .filter(
      (search) =>
        search &&
        typeof search === "object" &&
        typeof search.query === "string" &&
        typeof search.purpose === "string"
    )
    .map((search) => ({
      query: search.query.trim().replace(/\s+/g, " ").slice(0, 240),
      purpose: search.purpose.trim().replace(/\s+/g, " ").slice(0, 300)
    }))
    .filter((search) => search.query.length >= 2 && search.purpose)
    .slice(0, MAX_ASSET_SEARCHES);
}

function promptExplicitlyRequestsImages(prompt) {
  return IMAGE_REQUEST_PATTERN.test(prompt);
}

function promptExplicitlyRequiresCurrentFacts(prompt) {
  return CURRENT_FACTS_PATTERN.test(prompt);
}

function createFallbackImageSearch(prompt) {
  return {
    query: prompt.trim().replace(/\s+/g, " ").slice(0, 160),
    purpose: "The user explicitly requested images in the widget."
  };
}

async function planWidgetAssets({ apiKey, model, prompt, referenceImageContext }) {
  const payload = await callOpenAIResponses(apiKey, {
    model,
    reasoning: { effort: "high" },
    instructions: assetPlanningPrompt,
    input: JSON.stringify({
      prompt,
      referenceImageContext: referenceImageContext || null
    }),
    text: {
      format: {
        type: "json_schema",
        name: "widget_asset_plan",
        strict: true,
        schema: assetPlanSchema
      }
    }
  });

  const plan = parseJsonOutput(payload);
  const normalizedPlan = {
    webSearches: normalizeSearches(plan.webSearches),
    imageSearches: normalizeSearches(plan.imageSearches)
  };

  if (
    promptExplicitlyRequestsImages(prompt) &&
    normalizedPlan.imageSearches.length === 0
  ) {
    normalizedPlan.imageSearches = [createFallbackImageSearch(prompt)];
  }

  return normalizedPlan;
}

function formatReferenceContext(referenceImageContext) {
  if (!referenceImageContext?.notes) return "Reference image context: none";

  return `
Reference image context:
- Uploaded image count: ${referenceImageContext.count}
- Uploaded image names: ${referenceImageContext.names.join(", ") || "unnamed"}
- Reference notes:
${referenceImageContext.notes}
`.trim();
}

function createWidgetResearchPrompt({
  prompt,
  query,
  purpose,
  referenceImageContext
}) {
  return `
Research facts for a compact widget.

User widget prompt:
${prompt}

Planner search query:
${query}

Why this search is needed:
${purpose}

${formatReferenceContext(referenceImageContext)}

Return 4-6 concise, widget-usable facts only. Prioritize details that can become labels, values, badges, captions, rows, prices, dates, statuses, ratings, names, release info, or short descriptions in the final widget.

Rules:
- Stay scoped to the user prompt and search purpose.
- Do not write a general article summary.
- Do not include citation markdown or URLs unless a URL itself is useful widget data.
- If sources conflict or the fact is uncertain, say so briefly.
- Do not include real personal contact details, full addresses, payment identifiers, or secrets from web results.
- If the widget needs customer/contact demo data, instruct the final widget generator to use synthetic placeholders instead of web-sourced personal data.
- Do not invent facts that are not supported by the search results.
`.trim();
}

async function researchWithWebSearch({
  apiKey,
  model,
  prompt,
  search,
  referenceImageContext
}) {
  const payload = await callOpenAIResponses(apiKey, {
    model,
    reasoning: { effort: "high" },
    tools: [
      {
        type: "web_search",
        search_context_size: "low"
      }
    ],
    input: createWidgetResearchPrompt({
      prompt,
      query: search.query,
      purpose: search.purpose,
      referenceImageContext
    })
  });

  return collectOutputText(payload).join("\n").trim();
}

function collectImageResults(value, results = []) {
  if (!value || typeof value !== "object") return results;

  if (Array.isArray(value)) {
    for (const item of value) collectImageResults(item, results);
    return results;
  }

  if (
    value.type === "image_result" ||
    typeof value.image_url === "string" ||
    typeof value.thumbnail_url === "string"
  ) {
    results.push(value);
  }

  for (const child of Object.values(value)) {
    collectImageResults(child, results);
  }

  return results;
}

function normalizeImageResult(result) {
  const url = result.image_url || result.thumbnail_url;
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return null;

  return {
    url,
    title:
      typeof result.caption === "string" && result.caption.trim()
        ? result.caption.trim()
        : undefined,
    source:
      typeof result.source_website_url === "string"
        ? result.source_website_url
        : undefined
  };
}

async function searchImagesWithOpenAI({ apiKey, model, query }) {
  const payload = await callOpenAIResponses(apiKey, {
    model,
    reasoning: { effort: "high" },
    tools: [
      {
        type: "web_search",
        search_content_types: ["image"],
        image_settings: {
          max_results: 3,
          caption: true
        }
      }
    ],
    include: ["web_search_call.results"],
    input: `Find image results for: ${query}`
  });

  return collectImageResults(payload).map(normalizeImageResult).filter(Boolean);
}

function dedupeImages(images) {
  const seen = new Set();
  const deduped = [];

  for (const image of images) {
    if (seen.has(image.url)) continue;
    seen.add(image.url);
    deduped.push(image);
    if (deduped.length >= MAX_AVAILABLE_IMAGES) break;
  }

  return deduped;
}

function compactResearchNotes(notes) {
  return notes
    .filter((note) => note.summary)
    .map(
      (note) =>
        `Query: ${note.query}\nPurpose: ${note.purpose}\nFacts:\n${note.summary}`
    );
}

function sanitizeTemplateCompatibility(template) {
  return template
    .replace(/\sborder(?:=\{(?:true|false)\}|="(?:true|false)")?(?=[\s/>])/g, "")
    .replace(/\s\$(\w+)=\{([^{}]+)\}/g, ' $$$1="$2"')
    .replace(/\s<(Badge)([^>]*)\svalue=/g, " <$1$2 label=")
    .replace(/\s<(Button)([^>]*)\svalue=/g, " <$1$2 label=")
    .replace(/\s<(Badge|Button)([^>]*)\stone=/g, " <$1$2 color=")
    .replace(/\s<(Text|Title|Caption)([^>]*)\salign=/g, " <$1$2 textAlign=")
    .replace(/\scolor="green"/g, ' color="success"')
    .replace(/\scolor="red"/g, ' color="danger"')
    .replace(/\scolor="yellow"/g, ' color="warning"')
    .replace(/\scolor="orange"/g, ' color="warning"')
    .replace(/\scolor="blue"/g, ' color="info"')
    .replace(/\scolor="purple"/g, ' color="discovery"')
    .replace(/\scolor="gray"/g, ' color="secondary"');
}

function normalizeDILSyntax(template) {
  return template.replace(/(\s)\*([A-Za-z_$][\w$-]*)=/g, "$1__dilComponentProp_$2=");
}

function getJSXComponentName(nameNode) {
  if (nameNode.type === "JSXIdentifier") return nameNode.name;
  if (nameNode.type === "JSXMemberExpression") {
    return `${getJSXComponentName(nameNode.object)}.${nameNode.property.name}`;
  }
  return "";
}

function getAttributeName(attributeName) {
  if (attributeName.type !== "JSXIdentifier") return "";
  return attributeName.name;
}

function getObjectPropertyName(property) {
  if (property.type !== "ObjectProperty") return undefined;
  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "StringLiteral") return property.key.value;
  return undefined;
}

function extractWidgetRegistryComponents(source) {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  });

  let registryNode;
  traverseNode(ast, (node) => {
    if (
      node.type === "VariableDeclarator" &&
      node.id?.type === "Identifier" &&
      node.id.name === "widgetRegistry" &&
      node.init?.type === "ObjectExpression"
    ) {
      registryNode = node.init;
    }
  });

  if (!registryNode) {
    throw new Error("Unable to locate widgetRegistry component map.");
  }

  const components = new Set();
  for (const property of registryNode.properties) {
    const name = getObjectPropertyName(property);
    if (name) components.add(name);
  }

  if (components.size === 0) {
    throw new Error("widgetRegistry did not expose any component names.");
  }

  return components;
}

async function getAllowedWidgetComponents() {
  if (widgetRegistryComponentCache) return widgetRegistryComponentCache;

  const source = await readFile(
    path.join(process.cwd(), "src", "widget", "registry.ts"),
    "utf8"
  );
  widgetRegistryComponentCache = extractWidgetRegistryComponents(source);
  return widgetRegistryComponentCache;
}

function traverseNode(node, visitor, parent = null) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) traverseNode(child, visitor, parent);
    return;
  }

  visitor(node, parent);

  for (const [key, child] of Object.entries(node)) {
    if (
      key === "loc" ||
      key === "start" ||
      key === "end" ||
      key === "leadingComments" ||
      key === "innerComments" ||
      key === "trailingComments" ||
      key === "extra"
    ) {
      continue;
    }
    if (child && typeof child === "object") {
      traverseNode(child, visitor, node);
    }
  }
}

function containsDataUrl(value) {
  if (typeof value === "string") return /^data:image\//i.test(value);
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsDataUrl);
  return Object.values(value).some(containsDataUrl);
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isImageLikeKey(key) {
  return /(?:image|photo|avatar|cover|poster|thumbnail|thumb|logo|favicon|banner|picture|src)$/i.test(
    key
  );
}

function looksLikeImageUrl(value) {
  try {
    const parsed = new URL(value);
    return /\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function validateAllowedImageUrl(url, allowedImageUrls, location) {
  if (/^data:image\//i.test(url)) {
    throw new Error(`Uploaded image data URLs cannot be used in ${location}.`);
  }
  if (!isHttpUrl(url)) return;
  if (!allowedImageUrls.has(url)) {
    throw new Error(
      `Image URL in ${location} was not returned by image search: ${url}`
    );
  }
}

function validateDataImageUrls(value, allowedImageUrls, pathParts = []) {
  if (typeof value === "string") {
    if (/^data:image\//i.test(value)) {
      throw new Error("Uploaded image data URLs cannot appear in widget data.");
    }

    const key = pathParts.at(-1) || "";
    if (isHttpUrl(value) && (isImageLikeKey(key) || looksLikeImageUrl(value))) {
      validateAllowedImageUrl(value, allowedImageUrls, `data.${pathParts.join(".")}`);
    }
    return;
  }

  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateDataImageUrls(value[index], allowedImageUrls, [
        ...pathParts,
        String(index)
      ])
    );
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    validateDataImageUrls(child, allowedImageUrls, [...pathParts, key]);
  }
}

function validateTemplate(template, allowedImageUrls, allowedComponents) {
  if (/data:image\//i.test(template)) {
    throw new Error("Uploaded image data URLs cannot appear in the widget template.");
  }

  const ast = parseExpression(normalizeDILSyntax(template), {
    plugins: ["jsx", "typescript"]
  });

  if (ast.type !== "JSXElement") {
    throw new Error("Widget template must have a root Widget UI component.");
  }

  const rootName = getJSXComponentName(ast.openingElement.name);
  if (!rootComponents.has(rootName)) {
    throw new Error(
      `Widget template root must be one of: ${Array.from(rootComponents).join(", ")}.`
    );
  }

  traverseNode(ast, (node, parent) => {
    if (node.type === "JSXElement") {
      const componentName = getJSXComponentName(node.openingElement.name);
      if (!allowedComponents.has(componentName)) {
        throw new Error(`Unsupported widget component: ${componentName || "unknown"}.`);
      }

      for (const attribute of node.openingElement.attributes) {
        if (attribute.type === "JSXSpreadAttribute") {
          throw new Error("Widget templates cannot use spread props.");
        }

        const rawName = getAttributeName(attribute.name);
        if (!rawName) throw new Error("Widget templates cannot use namespaced props.");
        const normalizedName = rawName.replace("__dilComponentProp_", "");
        const propName = normalizedName.startsWith("$")
          ? normalizedName.slice(1)
          : normalizedName;
        if (
          propName === "className" ||
          propName === "style" ||
          propName === "dangerouslySetInnerHTML"
        ) {
          throw new Error(`Unsupported widget prop: ${propName}.`);
        }
        if (/^on[A-Z]/.test(propName) && !propName.endsWith("Action")) {
          throw new Error(`Unsupported callback prop: ${propName}.`);
        }

        const imageProps = imageUrlPropsByComponent.get(componentName);
        if (
          imageProps?.has(propName) &&
          attribute.value?.type === "StringLiteral"
        ) {
          validateAllowedImageUrl(
            attribute.value.value,
            allowedImageUrls,
            `${componentName}.${propName}`
          );
        }
      }
    }

    if (node.type === "JSXSpreadChild") {
      throw new Error("Widget templates cannot use JSX spread children.");
    }

    if (
      node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression" ||
      node.type === "AssignmentExpression" ||
      node.type === "UpdateExpression" ||
      node.type === "NewExpression" ||
      node.type === "AwaitExpression" ||
      node.type === "YieldExpression" ||
      node.type === "TaggedTemplateExpression"
    ) {
      if (
        !(
          parent?.type === "CallExpression" &&
          parent.callee?.type === "MemberExpression" &&
          parent.callee.property?.type === "Identifier" &&
          parent.callee.property.name === "map" &&
          node.type === "ArrowFunctionExpression"
        )
      ) {
        throw new Error(`Unsupported JavaScript in widget template: ${node.type}.`);
      }
    }

    if (node.type === "CallExpression") {
      if (
        node.callee.type === "Identifier" &&
        supportedFunctionCalls.has(node.callee.name)
      ) {
        return;
      }
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "map"
      ) {
        return;
      }
      throw new Error("Only renderer-supported helper calls and .map() are allowed.");
    }
  });
}

function parseModelOutput(output, availableImages, allowedComponents) {
  if (!output || typeof output !== "object") {
    throw new Error("The model returned an empty response.");
  }

  const { template, theme, designSpec } = output;
  const data = output.data ?? (output.sampleDataJson ? JSON.parse(output.sampleDataJson) : undefined);
  if (typeof template !== "string" || !template.trim()) {
    throw new Error("The model did not return a widget template.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The model did not return widget data.");
  }

  const sanitizedTemplate = sanitizeTemplateCompatibility(template.trim());
  const allowedImageUrls = new Set(availableImages.map((image) => image.url));
  validateTemplate(sanitizedTemplate, allowedImageUrls, allowedComponents);
  validateDataImageUrls(data, allowedImageUrls);

  if (containsDataUrl(data)) {
    throw new Error("Uploaded image data URLs cannot appear in generated data.");
  }

  return {
    template: sanitizedTemplate,
    data,
    theme: theme === "dark" ? "dark" : "light",
    designSpec:
      typeof designSpec === "string"
        ? designSpec.trim()
        : "Generated compact widget."
  };
}

async function generateFinalWidget({
  apiKey,
  model,
  widgetAuthoringGuide,
  context,
  availableImages
}) {
  const allowedComponents = await getAllowedWidgetComponents();
  const instructions = `
You are an expert widget designer and developer.
Return only valid JSON with these keys: template, data, theme, designSpec.
Do not wrap the JSON in markdown or prose.

Important generation rules:
- Keep widgets compact and mobile-friendly.
- Design for a narrow preview, preferably around 400px wide and never wider than 600px.
- Use loops/repeated data primitives for repeated rows.
- Every value referenced by the template must exist in data.
- Use only availableImages[].url for image URLs.
- Do not hallucinate image URLs.
- Use web research facts when provided; do not invent facts that conflict with them.
- Use synthetic demo customer/contact fields when a realistic widget needs them.
- Fake names, phone numbers, emails, companies, addresses, and notes are allowed for generated customer, checkout, delivery, account, support, booking, or CRM widgets.
- Prefer safe demo conventions: example.com, 555-01xx phone numbers, and generic addresses like 123 Demo St.
- Never use real personal data from web research or uploaded reference images as customer/contact data.
- Do not include secrets, payment identifiers, or unique private identifiers.
- For payment details, prefer labels like Saved method or Card ending 4242.

${widgetAuthoringGuide}
`.trim();

  const body = {
    model,
    reasoning: { effort: "high" },
    instructions,
    input: JSON.stringify(context),
    text: {
      format: {
        type: "json_schema",
        name: "generated_widget",
        strict: false,
        schema: outputSchema
      }
    }
  };

  const payload = await callOpenAIResponses(apiKey, body);
  const outputText = collectOutputText(payload).join("\n").trim();
  const parsedOutput = JSON.parse(extractJsonText(outputText));

  try {
    return parseModelOutput(parsedOutput, availableImages, allowedComponents);
  } catch (validationError) {
    const repairPayload = await callOpenAIResponses(apiKey, {
      model,
      reasoning: { effort: "high" },
      instructions: `
Repair a generated Widget UI JSON object so it satisfies the renderer.
Return only valid JSON with these keys: template, data, theme, designSpec.
Keep the original user intent.
Use only image URLs from availableImages.
Remove unsupported components, class names, inline styles, arbitrary JavaScript, callbacks, and uploaded data URLs.

${widgetAuthoringGuide}
`.trim(),
      input: JSON.stringify({
        context,
        invalidOutput: parsedOutput,
        validationError:
          validationError instanceof Error
            ? validationError.message
            : "Generated widget failed validation."
      }),
      text: {
        format: {
          type: "json_schema",
          name: "repaired_generated_widget",
          strict: false,
          schema: outputSchema
        }
      }
    });
    return parseModelOutput(
      parseJsonOutput(repairPayload),
      availableImages,
      allowedComponents
    );
  }
}

async function runWithFinalGenerationStatuses(work, progress) {
  let statusIndex = 0;
  progress(finalGenerationStatuses[statusIndex]);
  statusIndex += 1;

  const timer = setInterval(() => {
    progress(finalGenerationStatuses[statusIndex % finalGenerationStatuses.length]);
    statusIndex += 1;
  }, FINAL_GENERATION_STATUS_INTERVAL_MS);

  try {
    return await work();
  } finally {
    clearInterval(timer);
  }
}

async function runGeneration(request, progress) {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    throw createHttpError("OPENAI_API_KEY is not configured.", 500);
  }

  const widgetAuthoringGuide = await readFile(
    path.join(process.cwd(), "public", "AGENTS.md"),
    "utf8"
  );

  let referenceImageNotes = "";
  if (request.referenceImages.length > 0) {
    progress(
      request.referenceImages.length === 1
        ? "Reading reference image"
        : "Reading reference images"
    );
    try {
      referenceImageNotes = await analyzeReferenceImages({
        apiKey,
        model: request.model,
        prompt: request.prompt,
        referenceImages: request.referenceImages
      });
    } catch (error) {
      console.error("Failed to analyze reference images:", error);
    }
  }

  const referenceImageContext = createReferenceImageContext(
    request.referenceImages,
    referenceImageNotes
  );

  progress("Planning the widget");
  const assetPlan = await planWidgetAssets({
    apiKey,
    model: request.model,
    prompt: request.prompt,
    referenceImageContext
  });

  const searchCount = assetPlan.webSearches.length + assetPlan.imageSearches.length;
  progress(
    searchCount > 0
      ? "Planning complete. Gathering supporting context"
      : "Planning complete. No web or image search needed"
  );

  let researchNotes = [];
  if (assetPlan.webSearches.length > 0) {
    progress(
      assetPlan.webSearches.length === 1
        ? "Searching the web for facts"
        : `Searching the web for ${assetPlan.webSearches.length} fact sources`
    );

    const researchResults = await Promise.allSettled(
      assetPlan.webSearches.map(async (search) => ({
        ...search,
        summary: await researchWithWebSearch({
          apiKey,
          model: request.model,
          prompt: request.prompt,
          search,
          referenceImageContext
        })
      }))
    );
    const failures = researchResults.filter((result) => result.status === "rejected");
    failures.forEach((failure) =>
      console.error("Failed to enrich widget with web research:", failure.reason)
    );
    if (failures.length > 0 && promptExplicitlyRequiresCurrentFacts(request.prompt)) {
      throw createHttpError(
        "Web research failed, but this prompt requires current facts.",
        502
      );
    }
    researchNotes = researchResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
  }

  let availableImages = [];
  if (assetPlan.imageSearches.length > 0) {
    progress(
      assetPlan.imageSearches.length === 1
        ? "Searching for real image URLs"
        : `Searching for real image URLs from ${assetPlan.imageSearches.length} queries`
    );

    const imageResults = await Promise.allSettled(
      assetPlan.imageSearches.map((search) =>
        searchImagesWithOpenAI({
          apiKey,
          model: request.model,
          query: search.query
        })
      )
    );
    const failures = imageResults.filter((result) => result.status === "rejected");
    failures.forEach((failure) =>
      console.error("Failed to enrich widget with image search:", failure.reason)
    );
    if (failures.length > 0 && promptExplicitlyRequestsImages(request.prompt)) {
      throw createHttpError(
        "Image search failed, but this prompt explicitly requested images.",
        502
      );
    }
    availableImages = dedupeImages(
      imageResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
    );
  }

  const finalContext = {
    prompt: request.prompt,
    referenceImageContext,
    webSearchesRequested: assetPlan.webSearches,
    researchNotes: compactResearchNotes(researchNotes),
    imageSearchesRequested: assetPlan.imageSearches,
    availableImages
  };

  const widget = await runWithFinalGenerationStatuses(
    () =>
      generateFinalWidget({
        apiKey,
        model: request.model,
        widgetAuthoringGuide,
        context: finalContext,
        availableImages
      }),
    progress
  );
  progress("Widget ready");

  return widget;
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

  let body;
  let request;
  try {
    body = await readJsonBody(req);
    request = validateGenerateRequest(body);
  } catch (error) {
    const status = Number(error?.statusCode) || 400;
    sendJson(res, status, {
      error:
        error instanceof Error
          ? error.message
          : "Invalid widget generation request."
    });
    return;
  }

  const wantsStream =
    body.stream === true ||
    String(req.headers.accept || "").includes("application/x-ndjson");

  if (wantsStream) {
    const statuses = [];
    res.statusCode = 200;
    res.setHeader("content-type", "application/x-ndjson; charset=utf-8");
    res.setHeader("cache-control", "no-cache, no-transform");
    res.setHeader("x-accel-buffering", "no");

    const progress = (message) => {
      statuses.push(message);
      sendStreamLine(res, { type: "status", message });
    };

    try {
      const widget = await runGeneration(request, progress);
      sendStreamLine(res, { type: "result", widget, stages: statuses });
    } catch (error) {
      sendStreamLine(res, {
        type: "error",
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate a widget."
      });
    } finally {
      res.end();
    }
    return;
  }

  const statuses = [];
  try {
    const result = await runGeneration(request, (message) => statuses.push(message));
    sendJson(res, 200, { ...result, stages: statuses });
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
