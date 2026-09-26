/**
 * Exploded-view hero: the model's template, the validation layer, and the
 * rendered widget, stacked in an orthographic 3D view that collapses into a
 * front-facing card. Pure geometry and timing — no DOM — so Node tests can
 * sample any moment and the component only writes numbers to the SVG.
 */

export const VIEW_WIDTH = 360;
export const VIEW_HEIGHT = 500;
export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 250;
export const MAX_LINES = 8;

/** Template-plate text metrics. Fragment Mono advances 0.6em per glyph. */
export const CODE = { size: 9, advance: 5.4, left: 14, top: 50, leading: 18.5 } as const;
/** In-plane plate labels ("01  WRITE") just beyond each plate's front edge. */
export const PLATE_LABEL = { x: 8, y: CARD_HEIGHT + 17, width: 64 } as const;
/** The onAction toast under the front-facing card. */
export const TOAST = { width: 152, top: CARD_HEIGHT + 14, height: 22 } as const;

const LAYER_GAP = 128;
const ISO_YAW = .64;
const ISO_PITCH = .98;
const FRONT_ZOOM = 1.28;
const CENTER_X = VIEW_WIDTH / 2;
const CENTER_Y = 250;

export type Point = readonly [number, number];
/** SVG `matrix(a b c d e f)` mapping card units onto the viewBox. */
export type Affine = [number, number, number, number, number, number];
/** Pointer offset from the figure center, -1..1 on both axes. */
export type StackTilt = { x: number; y: number; strength: number };

export type StackLine = {
  text: string;
  indent: number;
  /** Card part this line paints once its token lands. */
  part?: string;
  /** Landing point on the card, in card units. */
  lands?: Point;
  /** What the token carries once validated: the app's data or the literal prop. */
  value?: string;
  /** Unsafe output: the validation layer stops its token. */
  blocked?: boolean;
};

export type StackScene = {
  name: string;
  /** Action type the primary control sends through onAction. */
  action: string;
  /** Where the cursor clicks, in card units. */
  press: Point;
  lines: readonly StackLine[];
};

export const STACK_SCENES: readonly StackScene[] = [
  {
    name: "Agent approval",
    action: "deploy.approve",
    press: [98, 225],
    lines: [
      { text: '<Card size="sm">', indent: 0 },
      { text: '<Badge label="Agent" />', indent: 1, part: "badge", lands: [42, 24], value: '"Agent"' },
      { text: "<Title value={title} />", indent: 1, part: "title", lands: [96, 58], value: '"Ship auth fix…"' },
      { text: "<FileDiff rows={diff} />", indent: 1, part: "diff", lands: [100, 124], value: "diff · 4 rows" },
      { text: '<script src="//x.io/a.js" />', indent: 1, lands: [152, 150], blocked: true },
      { text: "<Caption value={checks} />", indent: 1, part: "checks", lands: [84, 184], value: '"248 passed"' },
      { text: '<Button label="Approve" />', indent: 1, part: "actions", lands: [71, 218], value: '"Approve"' },
      { text: "</Card>", indent: 0 }
    ]
  },
  {
    name: "Revenue",
    action: "report.open",
    press: [132, 222],
    lines: [
      { text: '<Card size="sm">', indent: 0 },
      { text: '<Caption value="Revenue" />', indent: 1, part: "caption", lands: [60, 24], value: '"Revenue"' },
      { text: "<Stat value={total} />", indent: 1, part: "stat", lands: [58, 52], value: '"$48.2k"' },
      { text: "<BarChart data={daily} />", indent: 1, part: "chart", lands: [104, 114], value: "daily · 14 pts" },
      { text: '<iframe src="//ads.biz" />', indent: 1, lands: [52, 150], blocked: true },
      { text: "<KeyValue rows={rows} />", indent: 1, part: "rows", lands: [100, 180], value: "rows · 2" },
      { text: '<Button label="Open report" />', indent: 1, part: "report", lands: [100, 216], value: '"Open report"' },
      { text: "</Card>", indent: 0 }
    ]
  },
  {
    name: "Now playing",
    action: "media.play",
    press: [109, 227],
    lines: [
      { text: '<Card size="sm">', indent: 0 },
      { text: "<Image src={cover} />", indent: 1, part: "cover", lands: [100, 72], value: "cover.jpg" },
      { text: "<Title value={track} />", indent: 1, part: "track", lands: [74, 152], value: '"Morning Grain"' },
      { text: '<img onerror="steal()" />', indent: 1, lands: [150, 120], blocked: true },
      { text: "<Progress value={pos} />", indent: 1, part: "progress", lands: [100, 184], value: "0.32" },
      { text: '<Button iconStart="play" />', indent: 1, part: "controls", lands: [100, 219], value: 'icon · "play"' },
      { text: "</Card>", indent: 0 }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Plate geometry                                                      */
/* ------------------------------------------------------------------ */

export function lineBaseline(line: number) {
  return CODE.top + line * CODE.leading;
}

export function lineStart(line: StackLine) {
  return CODE.left + line.indent * 2 * CODE.advance;
}

export type LineGeometry = {
  /** Where the token leaves the template plate. */
  emit: Point;
  /** Where the token crosses the validation plate (midway down the stack). */
  gate: Point;
};

export const LINE_GEOMETRY: readonly (readonly LineGeometry[])[] = STACK_SCENES.map(scene =>
  scene.lines.map((line, index) => {
    const emit: Point = [lineStart(line) + line.text.length * CODE.advance + 3, lineBaseline(index) - 3];
    const lands = line.lands ?? emit;
    return { emit, gate: [(emit[0] + lands[0]) / 2, (emit[1] + lands[1]) / 2] };
  })
);

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

const TYPE_START = 1.1;
const CHARS_PER_SECOND = 56;
const LINE_PAUSE = .1;
const BEAM_TIME = .82;
const BEAM_EASE = 1.4;
const BEAM_TRAIL = .42;
const EXPLODE_TIME = 1.3;
const SETTLE_TIME = 1.1;
const COLLAPSE_TIME = 1.35;
/** The plates fall for this long; the card turns to face the viewer after. */
const SLAM_TIME = .62;
const ACT_TIME = 3.1;
const CLEAR_TIME = .5;

type LineTiming = { start: number; end: number; gate: number; land: number };
type SceneTiming = {
  start: number;
  duration: number;
  lines: LineTiming[];
  collapse: number;
  act: number;
  clear: number;
};

const SCENE_TIMINGS: SceneTiming[] = [];
{
  let sceneStart = 0;
  for (const scene of STACK_SCENES) {
    let cursor = TYPE_START;
    let settled = 0;
    const lines = scene.lines.map(line => {
      const start = cursor;
      const end = start + line.text.length / CHARS_PER_SECOND;
      cursor = end + LINE_PAUSE;
      // The token reaches the midway plate when eased progress hits one half.
      const timing = { start, end, gate: end + BEAM_TIME * .5 ** (1 / BEAM_EASE), land: end + BEAM_TIME };
      settled = Math.max(settled, line.lands ? timing.land : end);
      return timing;
    });
    const collapse = settled + SETTLE_TIME;
    const act = collapse + COLLAPSE_TIME;
    const clear = act + ACT_TIME;
    const duration = clear + CLEAR_TIME;
    SCENE_TIMINGS.push({ start: sceneStart, duration, lines, collapse, act, clear });
    sceneStart += duration;
  }
}

export const LOOP_DURATION = SCENE_TIMINGS.reduce((sum, scene) => sum + scene.duration, 0);
export const SCENE_STARTS = SCENE_TIMINGS.map(scene => scene.start);
/** The fully assembled, exploded first scene: the reduced-motion still. */
export const STILL_TIME = SCENE_TIMINGS[0].collapse - .05;

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

export type BeamFrame = {
  /** Full path from the template line to the landing point, in viewBox units. */
  from: [number, number];
  to: [number, number];
  /** Visible comet segment along the path, 0..1. */
  tail: number;
  head: number;
  opacity: number;
  /** Faint persistent thread once the token has landed. */
  thread: number;
};

export type StackFrame = {
  scene: number;
  /** 1 = exploded axonometric view, 0 = front-facing card. */
  view: number;
  explode: number;
  /** Render, validate, and write plates, bottom to top. */
  plates: [Affine, Affine, Affine];
  shadow: Affine;
  /** Opacity of the validate and write plates. */
  upper: number;
  /** Card surface, 0 = dashed placeholder. */
  card: number;
  /** Closing-tag and plate-impact pulses on the card edge. */
  seal: number;
  content: number;
  streaming: boolean;
  /** Line holding the caret, and how many of its characters are typed. */
  caretLine: number;
  caret: number;
  typed: number[];
  /** Flash where a finished line emits its token. */
  sparks: number[];
  blocked: number[];
  gates: number[];
  rings: number[];
  reveal: number[];
  ripples: number[];
  beams: BeamFrame[];
  /** Corner assembly guides, screen space: x1 y1 x2 y2. */
  guides: [number, number, number, number][];
  guideOpacity: number;
  cursor: { x: number; y: number; opacity: number; press: number };
  pressed: boolean;
  toast: number;
};

export function createStackFrame(): StackFrame {
  const affine = (): Affine => [1, 0, 0, 1, 0, 0];
  const lines = () => Array.from({ length: MAX_LINES }, () => 0);
  return {
    scene: 0, view: 0, explode: 0,
    plates: [affine(), affine(), affine()], shadow: affine(),
    upper: 0, card: 0, seal: 0, content: 1, streaming: false, caretLine: 0, caret: 0,
    typed: lines(), sparks: lines(), blocked: lines(), gates: lines(), rings: lines(), reveal: lines(), ripples: lines(),
    beams: Array.from({ length: MAX_LINES }, () => ({ from: [0, 0], to: [0, 0], tail: 0, head: 0, opacity: 0, thread: 0 })),
    guides: Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    guideOpacity: 0,
    cursor: { x: 0, y: 0, opacity: 0, press: 0 }, pressed: false, toast: 0
  };
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
/** Overshoots by ~6% then settles: plates spring apart. */
const easeOutBack = (t: number) => 1 + 2.1 * (t - 1) ** 3 + 1.1 * (t - 1) ** 2;
const window01 = (t: number, from: number, length: number) => clamp01((t - from) / length);
/** 0 → 1 → 0 over [from, from + length]. */
const pulse = (t: number, from: number, length: number) => {
  const p = window01(t, from, length);
  return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI);
};

function setPlate(out: Affine, yaw: number, pitch: number, zoom: number, centerY: number, z: number) {
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  const a = cosYaw * zoom, b = sinYaw * cosPitch * zoom;
  const c = -sinYaw * zoom, d = cosYaw * cosPitch * zoom;
  out[0] = a; out[1] = b; out[2] = c; out[3] = d;
  out[4] = CENTER_X - CARD_WIDTH / 2 * a - CARD_HEIGHT / 2 * c;
  out[5] = centerY - CARD_WIDTH / 2 * b - CARD_HEIGHT / 2 * d - z * sinPitch * zoom;
}

export function applyAffine(m: Affine, u: number, v: number): [number, number] {
  return [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
}

export function sceneAt(time: number) {
  const loop = ((time % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;
  let index = SCENE_TIMINGS.length - 1;
  while (index > 0 && loop < SCENE_TIMINGS[index].start) index--;
  return { index, local: loop - SCENE_TIMINGS[index].start };
}

/** Write the state of the whole figure at `time` (seconds) into `frame`. */
export function sampleStack(time: number, tilt: StackTilt, frame: StackFrame): StackFrame {
  const { index, local: t } = sceneAt(time);
  const scene = STACK_SCENES[index];
  const timing = SCENE_TIMINGS[index];
  const geometry = LINE_GEOMETRY[index];
  frame.scene = index;

  // Stage: explode out of the front view, hold, then slam shut and stand up.
  const collapsed = t >= timing.collapse;
  const explode = collapsed ? 1 - easeIn(window01(t, timing.collapse, SLAM_TIME)) : easeOutBack(window01(t, .1, EXPLODE_TIME));
  const turn = window01(t, timing.collapse + SLAM_TIME * .72, COLLAPSE_TIME - SLAM_TIME * .72);
  const view = easeInOut(window01(t, 0, EXPLODE_TIME * .92)) * (1 - easeInOut(turn));
  const breathe = 1 + Math.sin(time * 1.05) * .022;
  const lift = tilt.strength * view;
  const yaw = view * (ISO_YAW + Math.sin(time * .31) * .045) + tilt.x * .2 * lift;
  const pitch = view * (ISO_PITCH + Math.sin(time * .23) * .03) - tilt.y * .12 * lift;
  const zoom = FRONT_ZOOM + (1 - FRONT_ZOOM) * view;
  const gap = LAYER_GAP * explode * breathe;
  const centerY = CENTER_Y + gap * Math.sin(pitch) * zoom;
  frame.view = view;
  frame.explode = explode;
  for (let plate = 0; plate < 3; plate++) setPlate(frame.plates[plate], yaw, pitch, zoom, centerY, gap * plate);
  setPlate(frame.shadow, yaw, pitch, zoom, centerY, -14);
  // Upper plates dissolve during the last stretch of the fall, so nothing muddy lands on the card.
  frame.upper = collapsed ? clamp01((explode - .06) / .5) : window01(t, .12, .6);

  // The card surface appears with the root tag and clears at the end.
  const clearing = window01(t, timing.clear, CLEAR_TIME);
  const lastLine = timing.lines[timing.lines.length - 1];
  frame.content = 1 - clearing;
  frame.card = window01(t, timing.lines[0].end, .35) * (1 - clearing);
  frame.seal = Math.max(pulse(t, lastLine.end, .9), pulse(t, timing.collapse + SLAM_TIME - .06, .7));
  frame.streaming = t > TYPE_START - .25 && t < lastLine.end + .25;

  // Template typing.
  frame.caretLine = 0;
  frame.caret = 0;
  for (let line = 0; line < MAX_LINES; line++) {
    const spec = scene.lines[line];
    const lineTiming = timing.lines[line];
    const beam = frame.beams[line];
    if (!spec || !lineTiming) {
      frame.typed[line] = frame.sparks[line] = frame.blocked[line] = frame.gates[line] = frame.rings[line] = 0;
      frame.reveal[line] = frame.ripples[line] = 0;
      beam.opacity = beam.thread = beam.head = beam.tail = 0;
      continue;
    }
    const typed = Math.min(spec.text.length, Math.max(0, Math.floor((t - lineTiming.start) * CHARS_PER_SECOND)));
    frame.typed[line] = typed;
    if (t >= lineTiming.start) { frame.caretLine = line; frame.caret = typed; }

    if (!spec.lands) {
      frame.sparks[line] = frame.blocked[line] = frame.gates[line] = frame.rings[line] = 0;
      frame.reveal[line] = frame.ripples[line] = 0;
      beam.opacity = beam.thread = beam.head = beam.tail = 0;
      continue;
    }
    // Token: an eased comet from the line end to its landing point.
    const travel = Math.max(0, (t - lineTiming.end) / BEAM_TIME) ** BEAM_EASE;
    const reach = spec.blocked ? .5 : 1;
    const from = applyAffine(frame.plates[2], geometry[line].emit[0], geometry[line].emit[1]);
    const to = applyAffine(frame.plates[0], spec.lands[0], spec.lands[1]);
    beam.from[0] = from[0]; beam.from[1] = from[1];
    beam.to[0] = to[0]; beam.to[1] = to[1];
    beam.head = Math.min(travel, reach);
    beam.tail = Math.min(beam.head, Math.max(0, travel - BEAM_TRAIL));
    beam.opacity = t < lineTiming.end ? 0 : clamp01(travel / .06) * (1 - clamp01((travel - reach) / .38)) * frame.upper;
    beam.thread = spec.blocked ? 0 : window01(t, lineTiming.land, .45) * frame.upper * explode;

    frame.sparks[line] = pulse(t, lineTiming.end - .04, .5);
    frame.gates[line] = window01(t, lineTiming.gate, .22);
    frame.rings[line] = window01(t, lineTiming.gate, .65);
    frame.blocked[line] = spec.blocked ? window01(t, lineTiming.gate, .3) : 0;
    frame.reveal[line] = spec.blocked ? 0 : window01(t, lineTiming.land, .42);
    frame.ripples[line] = spec.blocked ? 0 : window01(t, lineTiming.land, .75);
  }

  // Assembly guides between the render and write plate corners.
  const corners: Point[] = [[0, 0], [CARD_WIDTH, 0], [CARD_WIDTH, CARD_HEIGHT], [0, CARD_HEIGHT]];
  corners.forEach(([u, v], corner) => {
    const [x1, y1] = applyAffine(frame.plates[0], u, v);
    const [x2, y2] = applyAffine(frame.plates[2], u, v);
    const guide = frame.guides[corner];
    guide[0] = x1; guide[1] = y1; guide[2] = x2; guide[3] = y2;
  });
  frame.guideOpacity = clamp01(explode) * frame.upper;

  // Act: the cursor clicks the primary control and onAction fires.
  const act = timing.act;
  const enter = easeOut(window01(t, act + .1, .9));
  const leave = easeInOut(window01(t, act + 2.05, .75));
  const [pressX, pressY] = scene.press;
  frame.cursor.x = CARD_WIDTH + 34 + (pressX - CARD_WIDTH - 34) * enter + 50 * leave;
  frame.cursor.y = CARD_HEIGHT + 40 + (pressY - CARD_HEIGHT - 40) * enter + 26 * leave;
  frame.cursor.opacity = window01(t, act + .1, .25) * (1 - leave) * frame.content;
  frame.cursor.press = pulse(t, act + 1.08, .3);
  frame.pressed = t >= act + 1.2;
  frame.toast = window01(t, act + 1.25, .3) * (1 - window01(t, act + 2.6, .35));
  return frame;
}
