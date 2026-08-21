import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { sourceScrollDelta } from "../src/pages/heroExhibit.ts";

const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../src/pages/Home.tsx", import.meta.url), "utf8");

test("the mobile exhibit declares a bounded track and keyboard scroll contract", () => {
  assert.match(homeSource, /grid min-w-0 grid-cols-\[minmax\(0,1fr\)\] overflow-hidden border/);
  assert.match(homeSource, /min-h-\[280px\] min-w-0 flex-col/);
  assert.match(homeSource, /max-h-\[300px\] min-w-0 flex-1 overflow-auto/);
  assert.match(homeSource, /relative w-full max-w-\[360px\]/);
  assert.match(homeSource, /id="hero-source-panel"\s+ref=\{panelRef\}\s+role="region"\s+tabIndex=\{0\}\s+aria-label="Widget template source"/);
  assert.match(homeSource, /onKeyDown=\{scrollSourceHorizontally\}/);
  assert.equal(sourceScrollDelta("ArrowRight"), 48);
  assert.equal(sourceScrollDelta("ArrowLeft"), -48);
  assert.equal(sourceScrollDelta("Enter"), 0);
});

test("mobile header and primary actions use compact responsive layouts", () => {
  assert.match(appSource, /grid-cols-\[auto_minmax\(0,1fr\)\]/);
  assert.match(appSource, /<span className="sm:hidden">Spec/);
  assert.match(appSource, /min-w-10 justify-center gap-1\.5 sm:min-w-0/);
  assert.match(homeSource, /grid grid-cols-2 gap-2 sm:flex/);
  assert.match(homeSource, /inline-flex min-h-11 cursor-pointer items-center justify-center/);
});
