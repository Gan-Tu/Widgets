import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { widgetRegistry } from "../packages/widgets/dist/widget/registry.js";
import { iconNames } from "../packages/widgets/dist/widget/iconNames.js";
import { widgetComponentNames } from "../api/widget-component-names.js";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");

test("api/widget-component-names.js matches the widget registry exactly", () => {
  const registryNames = new Set(Object.keys(widgetRegistry));
  const manifestNames = new Set(widgetComponentNames);

  const missingFromManifest = [...registryNames].filter((name) => !manifestNames.has(name));
  const missingFromRegistry = [...manifestNames].filter((name) => !registryNames.has(name));

  assert.deepEqual(
    missingFromManifest,
    [],
    `Components registered but missing from api/widget-component-names.js: ${missingFromManifest.join(", ")}`
  );
  assert.deepEqual(
    missingFromRegistry,
    [],
    `Components in api/widget-component-names.js but not registered: ${missingFromRegistry.join(", ")}`
  );
});

test("AGENTS.md documents every registered component", async () => {
  const guide = await readFile(path.join(repoRoot, "public", "AGENTS.md"), "utf8");
  // Bare substring matching is vacuous ("Card" matches inside "CardCarousel"),
  // so require an anchored occurrence: the name as inline code or as a JSX tag.
  const missing = Object.keys(widgetRegistry).filter(
    (name) => !guide.includes(`\`${name}\``) && !guide.includes(`<${name}`)
  );
  assert.deepEqual(
    missing,
    [],
    `Components missing from public/AGENTS.md: ${missing.join(", ")}`
  );
});

test("AGENTS.md icon list matches iconNames exactly", async () => {
  const guide = await readFile(path.join(repoRoot, "public", "AGENTS.md"), "utf8");
  // Parse the fenced icon block and set-compare it in both directions so a
  // dropped icon AND a documented-but-nonexistent icon both fail.
  const fences = [...guide.matchAll(/```\n([\s\S]*?)```/g)].map((match) => match[1]);
  const iconBlock = fences.find(
    (block) => block.includes("analytics,") && block.includes("dots-vertical")
  );
  assert.ok(iconBlock, "Could not locate the fenced icon list in AGENTS.md");

  const documented = new Set(
    iconBlock
      .split(/[,\s]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );
  const expected = new Set(iconNames);

  const missing = [...expected].filter((name) => !documented.has(name));
  const phantom = [...documented].filter((name) => !expected.has(name));
  assert.deepEqual(missing, [], `Icons missing from AGENTS.md list: ${missing.join(", ")}`);
  assert.deepEqual(
    phantom,
    [],
    `AGENTS.md lists icons that don't exist: ${phantom.join(", ")}`
  );
});
