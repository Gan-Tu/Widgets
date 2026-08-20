import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { componentDocs } from "../src/docs/componentDocs.ts";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");

test("every documentation entry has exactly one live example", async () => {
  const source = await readFile(
    path.join(repoRoot, "src", "docs", "componentExamples.ts"),
    "utf8"
  );
  const objectStart = source.indexOf("export const componentExamples");
  assert.notEqual(objectStart, -1, "componentExamples export was not found");

  // Top-level example keys are indented by two spaces. Restrict unquoted keys
  // to component-style PascalCase so nested fields such as `template` and
  // `schema` cannot be mistaken for entries.
  const exampleIds = [
    ...source.slice(objectStart).matchAll(/^  (?:"([^"]+)"|([A-Z][A-Za-z0-9]*)): \{/gm)
  ].map((match) => match[1] ?? match[2]);
  const docIds = componentDocs.map((doc) => doc.id);

  assert.equal(new Set(docIds).size, docIds.length, "componentDocs contains duplicate ids");
  assert.equal(
    new Set(exampleIds).size,
    exampleIds.length,
    "componentExamples contains duplicate keys"
  );
  assert.deepEqual(
    [...exampleIds].sort(),
    [...docIds].sort(),
    "documentation metadata and live examples must stay in one-to-one sync"
  );
});
