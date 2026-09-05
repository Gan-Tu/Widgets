/** Deterministic SVG geometry: no randomness during render and no canvas dependency. */
export const PARTICLE_COUNT = 480;
export const FORM_DURATION = 6;
export const PARTICLE_FORMS = ["Orbit", "Interface", "Composition", "Knot", "Possibility"] as const;
export const VIEW_SIZE = 420;
const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

type Point = readonly [number, number, number];
export type ParticlePointer = { x: number; y: number; strength: number };

function roundedFrame(t: number, width: number, height: number, radius: number): Point {
  const w = width / 2 - radius;
  const h = height / 2 - radius;
  const segments = [2 * w, Math.PI * radius / 2, 2 * h, Math.PI * radius / 2, 2 * w, Math.PI * radius / 2, 2 * h, Math.PI * radius / 2];
  let distance = t * segments.reduce((sum, length) => sum + length, 0);
  let segment = 0;
  while (segment < 7 && distance > segments[segment]) distance -= segments[segment++];
  const f = distance / segments[segment];
  switch (segment) {
    case 0: return [-w + f * 2 * w, -height / 2, 0];
    case 1: { const a = -Math.PI / 2 + f * Math.PI / 2; return [w + radius * Math.cos(a), -h + radius * Math.sin(a), 0]; }
    case 2: return [width / 2, -h + f * 2 * h, 0];
    case 3: { const a = f * Math.PI / 2; return [w + radius * Math.cos(a), h + radius * Math.sin(a), 0]; }
    case 4: return [w - f * 2 * w, height / 2, 0];
    case 5: { const a = Math.PI / 2 + f * Math.PI / 2; return [-w + radius * Math.cos(a), h + radius * Math.sin(a), 0]; }
    case 6: return [-width / 2, h - f * 2 * h, 0];
    default: { const a = Math.PI + f * Math.PI / 2; return [-w + radius * Math.cos(a), -h + radius * Math.sin(a), 0]; }
  }
}

function tilePoint(i: number, count: number, width: number, height: number): Point {
  const perimeterCount = Math.floor(count * .68);
  if (i < perimeterCount) return roundedFrame(i / perimeterCount, width, height, 13);
  const local = i - perimeterCount;
  const contentCount = count - perimeterCount;
  const row = local % 4;
  const x = (Math.floor(local / 4) / Math.max(1, Math.floor(contentCount / 4) - 1) - .5) * (width - 30);
  if (row === 0) return [x, -height * .27, 0];
  if (row === 1) return [x * .65 - 9, -height * .1, 0];
  return [x, height * .23 - Math.sin((x / width + .5) * Math.PI * 1.5) * height * .14 + (row - 2) * 5, 0];
}

function makeForm(form: number): Float32Array {
  const points = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let point: Point;
    if (form === 0) {
      const tile = Math.floor(i / 120);
      const p = tilePoint(i % 120, 120, 100, 106);
      point = [p[0] + (tile % 2 ? 59 : -59), p[1] + (tile < 2 ? -63 : 63), tile % 2 ? 14 : -14];
    } else if (form === 1) {
      const layer = Math.floor(i / 160);
      const p = tilePoint(i % 160, 160, 159, 201);
      point = [p[0] + (layer - 1) * 24, p[1] + (layer - 1) * 15, (layer - 1) * 40];
    } else if (form === 2) {
      const u = Math.floor(i / 16) / 30 * TAU;
      const v = (i % 16) / 16 * TAU;
      point = [(91 + 29 * Math.cos(v)) * Math.cos(u), (91 + 29 * Math.cos(v)) * Math.sin(u), 29 * Math.sin(v)];
    } else if (form === 3) {
      const y = 1 - 2 * (i + .5) / PARTICLE_COUNT;
      const r = Math.sqrt(1 - y * y);
      const a = i * GOLDEN_ANGLE;
      point = [Math.cos(a) * r * 116, y * 116, Math.sin(a) * r * 116];
    } else {
      // A tubular trefoil: the strands pass above and below each other in 3D.
      const u = Math.floor(i / 6) / (PARTICLE_COUNT / 6) * TAU;
      const v = (i % 6) / 6 * TAU;
      const radius = (2 + Math.cos(3 * u)) * 36 + Math.cos(v) * 9;
      point = [radius * Math.cos(2 * u), radius * Math.sin(2 * u), Math.sin(3 * u) * 39 + Math.sin(v) * 9];
    }
    points.set(point, i * 3);
  }
  return points;
}

const FORM_TYPES = [2, 0, 1, 4, 3];
const FORMS = FORM_TYPES.map(makeForm);
const SEEDS = Array.from({ length: PARTICLE_COUNT }, (_, i) => (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1).map(v => v < 0 ? v + 1 : v);
const smooth = (t: number) => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (t * 6 - 15) + 10); };

/** Write projected x, y, scale, opacity into a reusable buffer. */
export function sampleParticleField(time: number, pointer: ParticlePointer, out: Float32Array): number {
  const cycleTime = ((time % (FORM_DURATION * FORMS.length)) + FORM_DURATION * FORMS.length) % (FORM_DURATION * FORMS.length);
  const form = Math.floor(cycleTime / FORM_DURATION);
  const localTime = cycleTime % FORM_DURATION;
  const next = (form + 1) % FORMS.length;
  const yaw = -.36 + Math.sin(time * .19) * .24 + pointer.x / VIEW_SIZE * .2 * pointer.strength;
  const pitch = -.28 + Math.sin(time * .14) * .2 - pointer.y / VIEW_SIZE * .15 * pointer.strength;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  // Rotate sculptural forms continuously, while UI layouts stay readable.
  // Transform both endpoints at the same time so morph boundaries stay seamless.
  const fromAngle = FORM_TYPES[form] >= 2 ? time * .26 : 0;
  const toAngle = FORM_TYPES[next] >= 2 ? time * .26 : 0;
  const fromCos = Math.cos(fromAngle), fromSin = Math.sin(fromAngle);
  const toCos = Math.cos(toAngle), toSin = Math.sin(toAngle);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const index = i * 3;
    const seed = SEEDS[i];
    const progress = smooth((localTime - 3.25 - seed * .4) / 2.35);
    const scatter = Math.sin(progress * Math.PI);
    const fromX = FORMS[form][index] * fromCos + FORMS[form][index + 2] * fromSin;
    const fromZ = FORMS[form][index + 2] * fromCos - FORMS[form][index] * fromSin;
    const toX = FORMS[next][index] * toCos + FORMS[next][index + 2] * toSin;
    const toZ = FORMS[next][index + 2] * toCos - FORMS[next][index] * toSin;
    let x = fromX + (toX - fromX) * progress;
    let y = FORMS[form][index + 1] + (FORMS[next][index + 1] - FORMS[form][index + 1]) * progress;
    let z = fromZ + (toZ - fromZ) * progress;
    x += Math.sin(seed * TAU + progress * TAU) * scatter * 32;
    y += Math.cos(seed * TAU + progress * TAU) * scatter * 25;
    z += Math.sin(seed * TAU + time * .4) * scatter * 46;
    const breathe = 1 + Math.sin(time * .7 + seed) * .014;
    x *= breathe; y *= breathe;
    const rx = x * cy + z * sy;
    const rz = z * cy - x * sy;
    const ry = y * cp - rz * sp;
    const depth = rz * cp + y * sp;
    const perspective = 570 / (570 + depth);
    let px = rx * perspective, py = ry * perspective;
    const dx = px - pointer.x, dy = py - pointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const influence = Math.max(0, 1 - distance / 78) ** 2 * pointer.strength;
    if (distance > .01) { px += dx / distance * influence * 15; py += dy / distance * influence * 15; }
    const k = i * 4;
    out[k] = px + VIEW_SIZE / 2;
    out[k + 1] = py + VIEW_SIZE / 2;
    out[k + 2] = perspective * (.8 + seed * .55);
    out[k + 3] = Math.max(.2, Math.min(1, .73 - depth / 260 + Math.sin(time * .8 + seed * TAU) * .045));
  }
  return progressLabel(localTime, form, next);
}

function progressLabel(localTime: number, current: number, next: number) {
  return localTime > 4.65 ? next : current;
}

export const INITIAL_PARTICLE_FRAME = new Float32Array(PARTICLE_COUNT * 4);
sampleParticleField(0, { x: 0, y: 0, strength: 0 }, INITIAL_PARTICLE_FRAME);

export const PARTICLE_LINKS = Array.from({ length: 40 }, (_, i) => [i * 12, i * 12 + 1] as const);
