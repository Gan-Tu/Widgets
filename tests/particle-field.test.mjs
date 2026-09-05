import assert from "node:assert/strict";
import test from "node:test";
import { FORM_DURATION, INITIAL_PARTICLE_FRAME, PARTICLE_COUNT, PARTICLE_FORMS, sampleParticleField } from "../src/components/home/particleField.ts";

const restingPointer = { x: 0, y: 0, strength: 0 };
test("particle formations remain finite and inside their artwork at every transition", () => {
  const frame = new Float32Array(PARTICLE_COUNT * 4);
  for (const pointer of [restingPointer, { x: 110, y: -90, strength: 1 }, { x: -190, y: 160, strength: 1 }]) {
    for (let time = 0; time < FORM_DURATION * PARTICLE_FORMS.length * 2; time += .2) {
      const label = sampleParticleField(time, pointer, frame);
      assert.ok(label >= 0 && label < PARTICLE_FORMS.length);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const [x, y, scale, opacity] = frame.subarray(i * 4, i * 4 + 4);
        assert.ok(Number.isFinite(x) && x > 10 && x < 410, `x bounds at ${time}`);
        assert.ok(Number.isFinite(y) && y > 10 && y < 410, `y bounds at ${time}`);
        assert.ok(scale > 0 && scale < 2);
        assert.ok(opacity >= .19 && opacity <= 1);
      }
    }
  }
});

test("formation boundaries and the cycle wrap have no position jump", () => {
  const before = new Float32Array(PARTICLE_COUNT * 4);
  const after = new Float32Array(PARTICLE_COUNT * 4);
  for (let boundary = FORM_DURATION; boundary <= FORM_DURATION * PARTICLE_FORMS.length; boundary += FORM_DURATION) {
    sampleParticleField(boundary - .0001, restingPointer, before);
    sampleParticleField(boundary + .0001, restingPointer, after);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      assert.ok(Math.hypot(after[i * 4] - before[i * 4], after[i * 4 + 1] - before[i * 4 + 1]) < .05, `jump at ${boundary}`);
    }
  }
});

test("the static artwork is deterministic and pointer influence stays bounded", () => {
  const staticFrame = new Float32Array(PARTICLE_COUNT * 4);
  sampleParticleField(0, restingPointer, staticFrame);
  assert.deepEqual(staticFrame, INITIAL_PARTICLE_FRAME);
  const responsive = new Float32Array(PARTICLE_COUNT * 4);
  sampleParticleField(0, { x: 80, y: 50, strength: 1 }, responsive);
  let moved = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const distance = Math.hypot(responsive[i * 4] - staticFrame[i * 4], responsive[i * 4 + 1] - staticFrame[i * 4 + 1]);
    if (distance > .1) moved++;
    assert.ok(distance < 25);
  }
  assert.ok(moved > PARTICLE_COUNT / 2);
});
