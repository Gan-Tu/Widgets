// Generates the complete and featured example docs from widgetExamples.ts.
// Run with: node --experimental-strip-types scripts/build-widget-examples-doc.mjs
// tests/widget-examples-doc.test.mjs fails when the file is stale.
import { realpathSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  compareFeaturedWidgetExamples,
  isFeaturedWidgetExample
} from "../src/examples/featuredExamples.ts";
import { widgetExamples, widgetCategories } from "../src/examples/widgetExamples.ts";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
export const OUTPUT_PATH = path.join(repoRoot, "public", "WIDGET_EXAMPLES.md");
export const FEATURED_OUTPUT_PATH = path.join(
  repoRoot,
  "public",
  "FEATURED_WIDGET_EXAMPLES.md"
);

// A fence must be longer than any backtick run inside the content, or a
// template containing ``` would close the block and corrupt everything after.
function fenceFor(content) {
  const longestRun = Math.max(0, ...[...content.matchAll(/`+/g)].map((m) => m[0].length));
  return "`".repeat(Math.max(3, longestRun + 1));
}

function appendExample(lines, example) {
  lines.push("");
  lines.push(`### ${example.title}`);
  lines.push("");
  const meta = [`id: \`${example.id}\``];
  if (example.theme === "dark") meta.push("theme: `dark`");
  lines.push(`${example.description} (${meta.join(" · ")})`);
  lines.push("");
  const dataJson = JSON.stringify(example.data, null, 2);
  const templateFence = fenceFor(example.template);
  const dataFence = fenceFor(dataJson);
  lines.push("WIDGET TEMPLATE:");
  lines.push("");
  lines.push(templateFence);
  lines.push(example.template);
  lines.push(templateFence);
  lines.push("");
  lines.push("WIDGET DATA:");
  lines.push("");
  lines.push(`${dataFence}json`);
  lines.push(dataJson);
  lines.push(dataFence);
}

export function buildWidgetExamplesMarkdown() {
  const lines = [];
  lines.push("# Widget examples");
  lines.push("");
  lines.push(
    "The complete gallery corpus — every demo widget from the gallery as a" +
      " `template` + `data` pair. This is the optional companion to" +
      " `AGENTS.md`: the guide defines the authoring contract and a curated" +
      " example set; this file provides the full corpus for richer LLM" +
      " context windows, retrieval, or fine-tuning."
  );
  lines.push("");
  lines.push(
    "> Generated from `src/examples/widgetExamples.ts` by" +
      " `scripts/build-widget-examples-doc.mjs` — do not edit by hand."
  );
  lines.push("");
  lines.push(`${widgetExamples.length} widgets across ${widgetCategories.length} categories.`);

  for (const category of widgetCategories) {
    const entries = widgetExamples.filter((example) => example.category === category);
    if (entries.length === 0) continue;
    lines.push("");
    lines.push(`## ${category}`);
    for (const example of entries) {
      appendExample(lines, example);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function buildFeaturedWidgetExamplesMarkdown() {
  const featuredExamples = widgetExamples
    .filter(isFeaturedWidgetExample)
    .sort(compareFeaturedWidgetExamples);
  const lines = [];
  lines.push("# Featured widget examples");
  lines.push("");
  lines.push(
    "The curated gallery showcase — every demo shown by the gallery's" +
      " `Featured` filter as a `template` + `data` pair. Use this focused" +
      " companion to `AGENTS.md` when a compact set of representative widget" +
      " patterns is more useful than the complete gallery corpus."
  );
  lines.push("");
  lines.push(
    "> Generated from `src/examples/widgetExamples.ts` by" +
      " `scripts/build-widget-examples-doc.mjs` — do not edit by hand."
  );
  lines.push("");
  lines.push(`${featuredExamples.length} featured widgets.`);
  lines.push("");
  lines.push("## Featured");
  for (const example of featuredExamples) {
    appendExample(lines, example);
  }
  lines.push("");
  return lines.join("\n");
}

const isMain = (() => {
  if (!process.argv[1]) return false;
  try {
    return (
      realpathSync(path.resolve(process.argv[1])) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
})();

if (isMain) {
  await Promise.all([
    writeFile(OUTPUT_PATH, buildWidgetExamplesMarkdown()),
    writeFile(FEATURED_OUTPUT_PATH, buildFeaturedWidgetExamplesMarkdown())
  ]);
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${FEATURED_OUTPUT_PATH}`);
}
