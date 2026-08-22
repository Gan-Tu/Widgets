import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildFeaturedWidgetExamplesMarkdown,
  buildWidgetExamplesMarkdown,
  FEATURED_OUTPUT_PATH,
  OUTPUT_PATH
} from "../scripts/build-widget-examples-doc.mjs";
import {
  compareFeaturedWidgetExamples,
  isFeaturedWidgetExample
} from "../src/examples/featuredExamples.ts";
import { widgetExamples } from "../src/examples/widgetExamples.ts";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");

test("public/WIDGET_EXAMPLES.md is generated and up to date", async () => {
  let current;
  try {
    current = await readFile(OUTPUT_PATH, "utf8");
  } catch {
    assert.fail(
      "public/WIDGET_EXAMPLES.md is missing — run: node --experimental-strip-types scripts/build-widget-examples-doc.mjs"
    );
  }
  assert.equal(
    current,
    buildWidgetExamplesMarkdown(),
    "public/WIDGET_EXAMPLES.md is stale — run: node --experimental-strip-types scripts/build-widget-examples-doc.mjs"
  );
  for (const example of widgetExamples) {
    assert.ok(current.includes(`id: \`${example.id}\``), `missing example ${example.id}`);
  }
});

test("public/FEATURED_WIDGET_EXAMPLES.md matches the gallery's Featured filter", async () => {
  let current;
  try {
    current = await readFile(FEATURED_OUTPUT_PATH, "utf8");
  } catch {
    assert.fail(
      "public/FEATURED_WIDGET_EXAMPLES.md is missing — run: node --experimental-strip-types scripts/build-widget-examples-doc.mjs"
    );
  }
  assert.equal(
    current,
    buildFeaturedWidgetExamplesMarkdown(),
    "public/FEATURED_WIDGET_EXAMPLES.md is stale — run: node --experimental-strip-types scripts/build-widget-examples-doc.mjs"
  );

  const featuredExamples = widgetExamples
    .filter(isFeaturedWidgetExample)
    .sort(compareFeaturedWidgetExamples);
  const nonFeaturedExamples = widgetExamples.filter(
    (example) => !isFeaturedWidgetExample(example)
  );

  for (const example of featuredExamples) {
    assert.ok(current.includes(`id: \`${example.id}\``), `missing example ${example.id}`);
  }
  for (const example of nonFeaturedExamples) {
    assert.ok(
      !current.includes(`id: \`${example.id}\``),
      `unexpected non-featured example ${example.id}`
    );
  }

  const renderedIds = [...current.matchAll(/id: `([^`]+)`/g)].map((match) => match[1]);
  assert.deepEqual(
    renderedIds,
    featuredExamples.map((example) => example.id),
    "featured examples must use the gallery's featuredRank order"
  );
});

test("the navbar downloads featured examples while the gallery keeps the full corpus", async () => {
  const [app, gallery] = await Promise.all([
    readFile(path.join(repoRoot, "src", "App.tsx"), "utf8"),
    readFile(path.join(repoRoot, "src", "pages", "Gallery.tsx"), "utf8")
  ]);

  assert.ok(
    app.includes('href="/FEATURED_WIDGET_EXAMPLES.md"'),
    "the navbar must point to the featured example corpus"
  );
  assert.ok(
    gallery.includes('href="/WIDGET_EXAMPLES.md"'),
    "the gallery must keep pointing to the complete example corpus"
  );
});

test("Playground AI generation uses the featured example corpus", async () => {
  const authorWidgetSource = await readFile(
    path.join(repoRoot, "api", "author-widget.js"),
    "utf8"
  );

  assert.ok(
    authorWidgetSource.includes('"FEATURED_WIDGET_EXAMPLES.md"'),
    "the authoring context must load the featured example corpus"
  );
  assert.ok(
    !authorWidgetSource.includes(
      'path.join(process.cwd(), "public", "WIDGET_EXAMPLES.md")'
    ),
    "the authoring context must not load the complete example corpus"
  );
});
