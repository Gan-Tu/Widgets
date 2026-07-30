import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildWidgetExamplesMarkdown,
  OUTPUT_PATH
} from "../scripts/build-widget-examples-doc.mjs";
import { widgetExamples } from "../src/examples/widgetExamples.ts";

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
