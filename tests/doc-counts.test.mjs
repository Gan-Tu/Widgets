import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isFeaturedWidgetExample } from "../src/examples/featuredExamples.ts";
import { widgetCategories, widgetExamples } from "../src/examples/widgetExamples.ts";
import { widgetComponentNames } from "../api/widget-component-names.js";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");

// The Home hero chip derives its component count from the registry at runtime,
// but the remaining marketing literals cannot import the corpus without
// bloating their bundles — so this test pins them to the data instead. When it
// fails, update the quoted sentence in the named file to the new count.
test("advertised widget and component counts match the data", async () => {
  const examples = widgetExamples.length;
  const components = widgetComponentNames.length;

  const readme = await readFile(path.join(repoRoot, "README.md"), "utf8");
  assert.ok(
    readme.includes(`${components} registered components`),
    `README.md must advertise ${components} registered components`
  );
  assert.ok(
    readme.includes(`${examples} categorized, searchable pre-built widgets`),
    `README.md must advertise ${examples} gallery widgets`
  );

  const packageReadme = await readFile(
    path.join(repoRoot, "packages", "widgets", "README.md"),
    "utf8"
  );
  assert.ok(
    packageReadme.includes(`${components} registered component names`),
    `packages/widgets/README.md must advertise ${components} registered component names`
  );

  const indexHtml = await readFile(path.join(repoRoot, "index.html"), "utf8");
  assert.ok(
    indexHtml.includes(`${components} registered components`),
    `index.html meta description must advertise ${components} registered components`
  );

  const home = await readFile(path.join(repoRoot, "src", "pages", "Home.tsx"), "utf8");
  assert.ok(
    home.includes(`${examples} widgets · ${widgetCategories.length} categories`),
    `src/pages/Home.tsx collection eyebrow must read "${examples} widgets · ${widgetCategories.length} categories"`
  );

  // The collection index rows are curated literals; pin each gallery chip's
  // count. "Featured" is the flag-driven showcase, the rest count by category.
  for (const category of widgetCategories) {
    const count =
      category === "Featured"
        ? widgetExamples.filter(isFeaturedWidgetExample).length
        : widgetExamples.filter((example) => example.category === category).length;
    const row = new RegExp(
      `\\{ name: "${category}", note: "[^"]*", count: ${count} \\}`
    );
    assert.ok(
      row.test(home),
      `src/pages/Home.tsx must list the "${category}" collection row with count: ${count}`
    );
  }

  // Every example renders in light mode; the gallery's dark frame is retired.
  const darkExamples = widgetExamples.filter((example) => example.theme === "dark");
  assert.deepEqual(
    darkExamples.map((example) => example.id),
    [],
    "gallery examples must all be light mode"
  );
});
