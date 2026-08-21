import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../src/pages/Home.tsx", import.meta.url), "utf8");
const cssSource = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

test("the homepage contains its intrinsically wide exhibit on narrow screens", () => {
  assert.match(homeSource, /grid min-w-0 overflow-hidden border/);
  assert.match(homeSource, /min-h-\[280px\] min-w-0 flex-col/);
  assert.match(homeSource, /max-h-\[300px\] min-w-0 flex-1 overflow-auto/);
  assert.match(homeSource, /relative w-full max-w-\[360px\]/);
  assert.match(cssSource, /overflow-x:\s*clip/);
});

test("mobile header and primary actions use compact responsive layouts", () => {
  assert.match(appSource, /grid-cols-\[auto_minmax\(0,1fr\)\]/);
  assert.match(appSource, /<span className="sm:hidden">Spec/);
  assert.match(homeSource, /grid grid-cols-2 gap-2 sm:flex/);
});
