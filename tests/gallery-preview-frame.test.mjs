import assert from "node:assert/strict";
import test from "node:test";
import { measurePreviewFrame } from "../src/components/gallery/previewFrame.ts";

test("tabs and replay growth keep the same gallery slot", () => {
  const initial = measurePreviewFrame(undefined, { width: 360, height: 600 }, 45, 340);
  assert.deepEqual(initial, { width: 360, height: 645 });
  assert.equal(measurePreviewFrame(initial, { width: 360, height: 250 }, 45, 340), initial);
  assert.equal(measurePreviewFrame(initial, { width: 360, height: 950 }, 45, 340), initial);
  assert.equal(measurePreviewFrame(initial, { width: 360.2, height: 950 }, 45, 340), initial);
});

test("responsive widths refit the slot and preserve the minimum for compact widgets", () => {
  const initial = measurePreviewFrame(undefined, { width: 400, height: 600 }, 45, 340);
  assert.deepEqual(measurePreviewFrame(initial, { width: 280, height: 850 }, 33, 290), { width: 280, height: 883 });
  assert.deepEqual(measurePreviewFrame(undefined, { width: 400, height: 100 }, 45, 340), { width: 400, height: 340 });
  assert.equal(measurePreviewFrame(initial, { width: 0, height: 0 }, 45, 340), initial);
});
