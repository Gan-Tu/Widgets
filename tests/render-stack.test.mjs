import assert from "node:assert/strict";
import test from "node:test";

import { widgetComponentNames } from "../api/widget-component-names.js";
import {
  CARD_HEIGHT, CARD_WIDTH, CODE, LOOP_DURATION, PLATE_LABEL, SCENE_STARTS, STACK_SCENES, STILL_TIME, TOAST, VIEW_HEIGHT, VIEW_WIDTH,
  applyAffine, createStackFrame, lineStart, sampleStack
} from "../src/components/home/renderStack.ts";

const resting = { x: 0, y: 0, strength: 0 };
const corners = [[0, 0], [CARD_WIDTH, 0], [CARD_WIDTH, CARD_HEIGHT], [0, CARD_HEIGHT]];
const labelBox = [[PLATE_LABEL.x, PLATE_LABEL.y - 7], [PLATE_LABEL.x + PLATE_LABEL.width, PLATE_LABEL.y + 2]];
const toastLeft = (CARD_WIDTH - TOAST.width) / 2;
const toastBox = [[toastLeft, TOAST.top + TOAST.height], [toastLeft + TOAST.width, TOAST.top + TOAST.height]];
const sceneEnd = index => SCENE_STARTS[index + 1] ?? LOOP_DURATION;

test("the stack stays finite and inside the artwork for the whole loop, under any pointer", () => {
  const frame = createStackFrame();
  for (const tilt of [resting, { x: 1, y: -1, strength: 1 }, { x: -1, y: 1, strength: 1 }]) {
    for (let time = 0; time < LOOP_DURATION; time += .05) {
      sampleStack(time, tilt, frame);
      // Probe what is on screen: every plate, labels while they show, the toast while it shows.
      const probes = frame.plates.flatMap(plate => [
        ...corners.map(point => [plate, point]),
        ...(Math.min(1, frame.explode) * frame.view > 0 ? labelBox.map(point => [plate, point]) : [])
      ]);
      if (frame.toast > 0) probes.push(...toastBox.map(point => [frame.plates[0], point]));
      for (const [plate, [u, v]] of probes) {
        const [x, y] = applyAffine(plate, u, v);
        assert.ok(Number.isFinite(x) && x > 0 && x < VIEW_WIDTH, `x ${x} at ${time}`);
        assert.ok(Number.isFinite(y) && y > 0 && y < VIEW_HEIGHT, `y ${y} at ${time}`);
      }
      for (const value of [frame.view, frame.upper, frame.card, frame.seal, frame.content, frame.toast, frame.cursor.opacity]) {
        assert.ok(value >= 0 && value <= 1, `unit range at ${time}`);
      }
      for (const beam of frame.beams) {
        assert.ok(beam.tail <= beam.head && beam.head <= 1, `beam order at ${time}`);
        assert.ok(beam.opacity >= 0 && beam.opacity <= 1 && beam.thread >= 0 && beam.thread <= 1);
      }
    }
  }
});

test("scene boundaries and the loop wrap have no visible jump", () => {
  const before = createStackFrame();
  const after = createStackFrame();
  for (const boundary of [...SCENE_STARTS.slice(1), LOOP_DURATION]) {
    sampleStack(boundary - 1e-4, resting, before);
    sampleStack(boundary + 1e-4, resting, after);
    for (const key of ["view", "explode", "upper", "card", "toast"]) {
      assert.ok(Math.abs(before[key] - after[key]) < .01, `${key} jumps at ${boundary}`);
    }
    assert.ok(before.cursor.opacity < .01 && after.cursor.opacity < .01);
    // Widget content has cleared before the next scene begins painting.
    assert.ok(before.content < .01);
    assert.ok(after.reveal.every(reveal => reveal === 0));
    for (let plate = 0; plate < 3; plate++) {
      for (const [u, v] of corners) {
        const [x1, y1] = applyAffine(before.plates[plate], u, v);
        const [x2, y2] = applyAffine(after.plates[plate], u, v);
        assert.ok(Math.hypot(x2 - x1, y2 - y1) < .5, `plate ${plate} jumps at ${boundary}`);
      }
    }
  }
});

test("the card faces the viewer, unskewed, while the cursor acts on it", () => {
  const frame = createStackFrame();
  STACK_SCENES.forEach((_, index) => {
    let acted = 0;
    for (let time = SCENE_STARTS[index]; time < sceneEnd(index); time += .02) {
      sampleStack(time, { x: 1, y: 1, strength: 1 }, frame);
      if (frame.cursor.opacity < .5) continue;
      acted++;
      const [a, b, c, d] = frame.plates[0];
      assert.equal(frame.view, 0);
      assert.ok(Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9 && Math.abs(a - d) < 1e-9, `skewed card at ${time}`);
    }
    assert.ok(acted > 0, `scene ${index} never reaches its act beat`);
  });
});

test("unsafe lines are stopped at the validation layer; every other token lands", () => {
  const frame = createStackFrame();
  STACK_SCENES.forEach((scene, index) => {
    const heads = [], reveals = [], blocks = [];
    for (let time = SCENE_STARTS[index]; time < sceneEnd(index); time += .01) {
      sampleStack(time, resting, frame);
      scene.lines.forEach((_, line) => {
        heads[line] = Math.max(heads[line] ?? 0, frame.beams[line].head);
        reveals[line] = Math.max(reveals[line] ?? 0, frame.reveal[line]);
        blocks[line] = Math.max(blocks[line] ?? 0, frame.blocked[line]);
      });
    }
    scene.lines.forEach((line, i) => {
      if (!line.lands) return;
      assert.equal(heads[i], line.blocked ? .5 : 1, `${line.text} token reach`);
      assert.equal(reveals[i], line.blocked ? 0 : 1, `${line.text} reveal`);
      assert.equal(blocks[i], line.blocked ? 1 : 0, `${line.text} rejection`);
    });
  });
});

test("the template plate shows real components; only the injected lines are unregistered", () => {
  const registered = new Set(widgetComponentNames);
  for (const scene of STACK_SCENES) {
    assert.equal(scene.lines.filter(line => line.blocked).length, 1, `${scene.name} rejects one line`);
    const parts = scene.lines.map(line => line.part).filter(Boolean);
    assert.equal(new Set(parts).size, parts.length, `${scene.name} part names are unique`);
    for (const line of scene.lines) {
      const tag = line.text.match(/^<\/?([\w.]+)/)?.[1];
      assert.equal(registered.has(tag), !line.blocked, `<${tag}> registration`);
      assert.equal(Boolean(line.part), Boolean(line.lands) && !line.blocked, `${line.text} paints a part`);
      assert.ok(lineStart(line) + line.text.length * CODE.advance + 6 < CARD_WIDTH, `${line.text} overflows the plate`);
    }
  }
});

test("the reduced-motion still is the assembled, exploded first scene", () => {
  const frame = sampleStack(STILL_TIME, resting, createStackFrame());
  assert.equal(frame.scene, 0);
  assert.equal(frame.view, 1);
  assert.equal(frame.upper, 1);
  assert.equal(frame.explode, 1);
  assert.equal(frame.card, 1);
  STACK_SCENES[0].lines.forEach((line, i) => {
    assert.equal(frame.typed[i], line.text.length);
    if (line.lands) assert.equal(frame.reveal[i], line.blocked ? 0 : 1);
  });
  assert.deepEqual(sampleStack(STILL_TIME, resting, createStackFrame()), frame);
});
