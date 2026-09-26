import React from "react";
import { Pause, Play } from "lucide-react";
import {
  CARD_HEIGHT, CARD_WIDTH, CODE, LINE_GEOMETRY, MAX_LINES, PLATE_LABEL, STACK_SCENES, STILL_TIME, TOAST, VIEW_HEIGHT, VIEW_WIDTH,
  createStackFrame, lineBaseline, lineStart, sampleStack,
  type Affine, type StackFrame, type StackLine, type StackTilt
} from "./renderStack";
import "./render-stack-hero.css";

const SCENES = STACK_SCENES.map((_, index) => index);
const LINES = Array.from({ length: MAX_LINES }, (_, index) => index);
const TOKEN_ADVANCE = 4.08;
const TOKEN_OFFSET = 8;
const BAR_HEIGHTS = [20, 27, 24, 33, 30, 38, 35, 43, 39, 48, 44, 53, 50, 62];

type SceneNodes = {
  code: SVGGElement | null;
  membrane: SVGGElement | null;
  card: SVGGElement | null;
  labels: SVGGElement | null;
  lines: (SVGTextElement | null)[];
  strikes: (SVGLineElement | null)[];
  sparks: (SVGCircleElement | null)[];
  gates: (SVGGElement | null)[];
  rings: (SVGCircleElement | null)[];
  tokens: (SVGGElement | null)[];
  parts: (SVGGElement | null)[];
  ripples: (SVGCircleElement | null)[];
  press: SVGGElement | null;
  toast: SVGGElement | null;
};

type BeamNodes = {
  thread: SVGLineElement | null;
  glow: SVGLineElement | null;
  body: SVGLineElement | null;
  gradient: SVGLinearGradientElement | null;
  head: SVGGElement | null;
};

type StackNodes = {
  root: HTMLElement | null;
  plates: (SVGGElement | null)[];
  shadow: SVGGElement | null;
  labels: (SVGTextElement | null)[];
  guides: (SVGLineElement | null)[];
  placeholder: SVGRectElement | null;
  surface: SVGRectElement | null;
  seal: SVGRectElement | null;
  typeClip: SVGRectElement | null;
  caret: SVGRectElement | null;
  cursor: SVGGElement | null;
  click: SVGCircleElement | null;
  scenes: SceneNodes[];
  beams: BeamNodes[];
};

function createNodes(): StackNodes {
  const slots = <T,>() => Array.from({ length: MAX_LINES }, () => null as T | null);
  return {
    root: null, plates: [null, null, null], shadow: null, labels: [null, null, null], guides: [null, null, null, null],
    placeholder: null, surface: null, seal: null, typeClip: null, caret: null, cursor: null, click: null,
    scenes: SCENES.map(() => ({
      code: null, membrane: null, card: null, labels: null, press: null, toast: null,
      lines: slots(), strikes: slots(), sparks: slots(), gates: slots(), rings: slots(), tokens: slots(), parts: slots(), ripples: slots()
    })),
    beams: LINES.map(() => ({ thread: null, glow: null, body: null, gradient: null, head: null }))
  };
}

/* ------------------------------------------------------------------ */
/* Frame → DOM                                                         */
/* ------------------------------------------------------------------ */

const matrix = (m: Affine) => `matrix(${m[0].toFixed(4)} ${m[1].toFixed(4)} ${m[2].toFixed(4)} ${m[3].toFixed(4)} ${m[4].toFixed(2)} ${m[5].toFixed(2)})`;
const setOpacity = (node: Element | null, value: number) => {
  if (node) (node as SVGElement).style.opacity = value <= .001 ? "0" : value.toFixed(3);
};
const easeOutBack = (t: number) => 1 + 2.6 * (t - 1) ** 3 + 1.6 * (t - 1) ** 2;

type PaintState = { scene: number; clipped: SVGTextElement | null };

function paintFrame(frame: StackFrame, nodes: StackNodes, state: PaintState, clipUrl: string) {
  const scene = STACK_SCENES[frame.scene];
  const sceneNodes = nodes.scenes[frame.scene];

  if (state.scene !== frame.scene) {
    state.scene = frame.scene;
    nodes.scenes.forEach((other, index) => {
      const display = index === frame.scene ? "inline" : "none";
      for (const group of [other.code, other.membrane, other.card, other.labels]) if (group) group.style.display = display;
    });
    nodes.beams.forEach((beam, line) => beam.head?.setAttribute("data-blocked", String(Boolean(scene.lines[line]?.blocked))));
  }

  nodes.plates.forEach((plate, index) => plate?.setAttribute("transform", matrix(frame.plates[index])));
  nodes.shadow?.setAttribute("transform", matrix(frame.shadow));
  setOpacity(nodes.shadow, .1 + .9 * frame.card);
  setOpacity(nodes.plates[1], frame.upper);
  setOpacity(nodes.plates[2], frame.upper);
  nodes.labels.forEach(label => setOpacity(label, Math.min(1, frame.explode) * frame.view));
  nodes.guides.forEach((guide, index) => {
    if (!guide) return;
    const [x1, y1, x2, y2] = frame.guides[index];
    guide.setAttribute("x1", x1.toFixed(2)); guide.setAttribute("y1", y1.toFixed(2));
    guide.setAttribute("x2", x2.toFixed(2)); guide.setAttribute("y2", y2.toFixed(2));
  });
  setOpacity(nodes.guides[0]?.parentElement ?? null, frame.guideOpacity);
  setOpacity(nodes.placeholder, 1 - frame.card);
  setOpacity(nodes.surface, frame.card);
  setOpacity(nodes.seal, frame.seal * frame.card);
  nodes.root?.setAttribute("data-streaming", String(frame.streaming));

  // Template: whole lines are shown; the one being typed is clipped to its caret.
  let clipped: SVGTextElement | null = null;
  scene.lines.forEach((line, index) => {
    const node = sceneNodes.lines[index];
    if (!node) return;
    const typed = frame.typed[index];
    node.style.visibility = typed > 0 ? "visible" : "hidden";
    if (typed > 0 && typed < line.text.length) clipped = node;
    node.setAttribute("data-blocked", String(frame.blocked[index] > 0));
    setOpacity(sceneNodes.strikes[index], frame.blocked[index]);
    const strike = sceneNodes.strikes[index];
    if (strike) strike.setAttribute("x2", (lineStart(line) + (line.text.length * CODE.advance) * frame.blocked[index]).toFixed(2));
    setOpacity(sceneNodes.sparks[index], frame.sparks[index]);
  });
  if (state.clipped !== clipped) {
    state.clipped?.removeAttribute("clip-path");
    (clipped as SVGTextElement | null)?.setAttribute("clip-path", clipUrl);
    state.clipped = clipped;
  }
  const caretLine = scene.lines[frame.caretLine];
  const caretX = lineStart(caretLine) + frame.caret * CODE.advance;
  if (nodes.typeClip) {
    nodes.typeClip.setAttribute("y", (lineBaseline(frame.caretLine) - CODE.size - 2).toFixed(2));
    nodes.typeClip.setAttribute("width", caretX.toFixed(2));
  }
  if (nodes.caret) {
    nodes.caret.setAttribute("x", (caretX + .6).toFixed(2));
    nodes.caret.setAttribute("y", (lineBaseline(frame.caretLine) - CODE.size + 1.2).toFixed(2));
  }

  // Validation layer and tokens.
  scene.lines.forEach((line, index) => {
    if (!line.lands) return;
    const gate = sceneNodes.gates[index];
    gate?.setAttribute("data-state", frame.blocked[index] > 0 ? "blocked" : frame.gates[index] > 0 ? "passed" : "idle");
    const ring = sceneNodes.rings[index];
    if (ring) {
      ring.setAttribute("r", (4 + frame.rings[index] * 15).toFixed(2));
      setOpacity(ring, frame.rings[index] > 0 && frame.rings[index] < 1 ? (1 - frame.rings[index]) * .9 : 0);
    }
  });
  nodes.beams.forEach((beam, index) => {
    const state = frame.beams[index];
    const visible = state.opacity > .001;
    const [x1, y1] = state.from;
    const [x2, y2] = state.to;
    const at = (p: number) => [x1 + (x2 - x1) * p, y1 + (y2 - y1) * p] as const;
    const [tx, ty] = at(state.tail);
    const [hx, hy] = at(state.head);
    for (const line of [beam.glow, beam.body]) {
      if (!line) continue;
      line.style.visibility = visible ? "visible" : "hidden";
      if (!visible) continue;
      line.setAttribute("x1", tx.toFixed(2)); line.setAttribute("y1", ty.toFixed(2));
      line.setAttribute("x2", hx.toFixed(2)); line.setAttribute("y2", hy.toFixed(2));
    }
    if (visible && beam.gradient) {
      beam.gradient.setAttribute("x1", tx.toFixed(2)); beam.gradient.setAttribute("y1", ty.toFixed(2));
      beam.gradient.setAttribute("x2", hx.toFixed(2)); beam.gradient.setAttribute("y2", hy.toFixed(2));
    }
    setOpacity(beam.body, state.opacity);
    setOpacity(beam.glow, state.opacity * .35);
    if (beam.head) {
      beam.head.style.visibility = visible ? "visible" : "hidden";
      beam.head.setAttribute("transform", `translate(${hx.toFixed(2)} ${hy.toFixed(2)})`);
      beam.head.setAttribute("data-hit", String(frame.blocked[index] > 0));
      setOpacity(beam.head, state.opacity);
    }
    const token = sceneNodes.tokens[index];
    if (token) {
      const width = Number(token.dataset.width ?? 0);
      const flip = hx + TOKEN_OFFSET + width > VIEW_WIDTH - 2;
      token.style.visibility = visible ? "visible" : "hidden";
      token.setAttribute("transform", `translate(${(flip ? hx - TOKEN_OFFSET - width : hx + TOKEN_OFFSET).toFixed(2)} ${hy.toFixed(2)})`);
      token.setAttribute("data-state", frame.blocked[index] > 0 ? "blocked" : frame.gates[index] > 0 ? "bound" : "raw");
      // Labels appear once the token has cleared the template plate.
      setOpacity(token, state.opacity * Math.min(1, Math.max(0, (state.head - .16) / .1)));
    }
    if (beam.thread) {
      beam.thread.style.visibility = state.thread > .001 ? "visible" : "hidden";
      beam.thread.setAttribute("x1", x1.toFixed(2)); beam.thread.setAttribute("y1", y1.toFixed(2));
      beam.thread.setAttribute("x2", x2.toFixed(2)); beam.thread.setAttribute("y2", y2.toFixed(2));
      setOpacity(beam.thread, state.thread);
    }
  });

  // Rendered card: parts land with a small spring, ripples spread from impact.
  setOpacity(sceneNodes.card, frame.content);
  scene.lines.forEach((line, index) => {
    const part = sceneNodes.parts[index];
    if (part) {
      const reveal = frame.reveal[index];
      const lift = (1 - easeOutBack(reveal)) * 7;
      part.setAttribute("transform", `translate(0 ${lift.toFixed(2)})`);
      setOpacity(part, Math.min(1, reveal * 2.2));
    }
    const ripple = sceneNodes.ripples[index];
    if (ripple && line.lands) {
      const progress = frame.ripples[index];
      ripple.setAttribute("r", (3 + progress * 30).toFixed(2));
      setOpacity(ripple, progress > 0 && progress < 1 ? (1 - progress) * .7 : 0);
    }
  });

  // Act: cursor, press, and the onAction toast.
  const [pressX, pressY] = scene.press;
  const press = frame.cursor.press;
  sceneNodes.card?.setAttribute("data-pressed", String(frame.pressed));
  if (sceneNodes.press) sceneNodes.press.style.transform = press > 0 ? `scale(${(1 - press * .05).toFixed(4)})` : "";
  if (nodes.cursor) {
    nodes.cursor.setAttribute("transform", `translate(${frame.cursor.x.toFixed(2)} ${frame.cursor.y.toFixed(2)}) scale(${(1 - press * .12).toFixed(3)})`);
    setOpacity(nodes.cursor, frame.cursor.opacity);
  }
  if (nodes.click) {
    nodes.click.setAttribute("cx", String(pressX));
    nodes.click.setAttribute("cy", String(pressY));
    nodes.click.setAttribute("r", (6 + press * 10).toFixed(2));
    setOpacity(nodes.click, press * .5);
  }
  if (sceneNodes.toast) {
    sceneNodes.toast.setAttribute("transform", `translate(0 ${((1 - frame.toast) * 6).toFixed(2)})`);
    setOpacity(sceneNodes.toast, frame.toast);
  }
}

/* ------------------------------------------------------------------ */
/* Artwork                                                             */
/* ------------------------------------------------------------------ */

function CodeTokens({ text }: { text: string }) {
  return text.split(/("[^"]*"|\{[^}]*\}|[A-Za-z]+=)/g).filter(Boolean).map((token, index) => (
    <tspan key={index} className={token.startsWith('"') || token.startsWith("{") ? "rs-code-value" : token.endsWith("=") ? "rs-code-attr" : undefined}>
      {token}
    </tspan>
  ));
}

/** Each scene's card, as parts keyed by the template line that paints them. */
const CARD_PARTS: Record<string, React.ReactNode> = {
  // Agent approval
  badge: <>
    <rect x={16} y={15} width={54} height={18} rx={9} className="rs-soft-violet" />
    <circle cx={26} cy={24} r={2.6} className="rs-violet" />
    <text x={32} y={27.2} className="rs-t-badge rs-t-violet">Agent</text>
    <text x={184} y={27.2} textAnchor="end" className="rs-t-meta">needs approval</text>
  </>,
  title: <>
    <text x={16} y={57} className="rs-t-title">Ship auth fix to prod?</text>
    <text x={16} y={72} className="rs-t-caption">api-gateway · 3 files changed</text>
  </>,
  diff: <>
    <rect x={16} y={83} width={168} height={82} rx={8} className="rs-well" />
    <text x={25} y={97} className="rs-t-mono">src/auth.ts</text>
    <text x={175} y={97} textAnchor="end" className="rs-t-mono"><tspan className="rs-t-add">+12</tspan> <tspan className="rs-t-del">−4</tspan></text>
    <path d="M16 103.5h168" className="rs-rule" />
    <rect x={17} y={118.5} width={166} height={14} className="rs-diff-del" />
    <rect x={17} y={132.5} width={166} height={14} className="rs-diff-add" />
    <rect x={17} y={146.5} width={166} height={14} className="rs-diff-add" />
    {[["41", " ", "const t = sign(user)"], ["42", "−", "verify(t)"], ["42", "+", "verify(t, { alg })"], ["43", "+", "assertIssuer(t)"]].map(([number, mark, code], row) => (
      <text key={row} y={114 + row * 14} className="rs-t-mono">
        <tspan x={24} className="rs-t-faint">{number}</tspan>
        <tspan x={37} className={mark === "+" ? "rs-t-add" : mark === "−" ? "rs-t-del" : undefined}>{mark}</tspan>
        <tspan x={46}>{code}</tspan>
      </text>
    ))}
  </>,
  checks: <>
    <circle cx={22} cy={184} r={5.6} className="rs-ok" />
    <path d="M19.5 184.2l1.8 1.8 3.3-3.6" className="rs-icon-inverse" />
    <text x={32} y={187} className="rs-t-body">248 tests passed</text>
    <text x={184} y={187} textAnchor="end" className="rs-t-meta">2m ago</text>
  </>,
  actions: <>
    <g data-press>
      <rect x={16} y={204} width={110} height={28} rx={7} className="rs-btn-primary" />
      <text x={71} y={221.4} textAnchor="middle" className="rs-t-btn rs-before">Approve</text>
      <text x={71} y={221.4} textAnchor="middle" className="rs-t-btn rs-after">✓ Approved</text>
    </g>
    <rect x={132.5} y={204.5} width={51} height={27} rx={6.5} className="rs-btn-ghost" />
    <text x={158} y={221.4} textAnchor="middle" className="rs-t-btn-ghost">Deny</text>
  </>,

  // Revenue
  caption: <>
    <text x={16} y={28} className="rs-t-caption">Revenue · last 30 days</text>
    <path d="M168 28l5-5 3 3 6-6M178 20h4v4" className="rs-icon" />
  </>,
  stat: <>
    <text x={16} y={61} className="rs-t-stat">$48.2k</text>
    <rect x={104} y={47} width={44} height={16} rx={8} className="rs-soft-green" />
    <text x={126} y={58.2} textAnchor="middle" className="rs-t-badge rs-t-green">+12.4%</text>
  </>,
  chart: <>
    <path d="M16 92.5h168M16 118.5h168" className="rs-grid" />
    {BAR_HEIGHTS.map((height, bar) => (
      <rect key={bar} x={16 + bar * 12.15} y={145 - height * .92} width={8} height={height * .92} rx={2}
        className="rs-bar" style={{ opacity: bar === BAR_HEIGHTS.length - 1 ? 1 : .32 + bar * .03 }} />
    ))}
    <path d="M16 145.5h168" className="rs-rule" />
  </>,
  rows: <>
    <text x={16} y={169} className="rs-t-caption">Orders</text>
    <text x={184} y={169} textAnchor="end" className="rs-t-value">1,284</text>
    <path d="M16 177.5h168" className="rs-rule" />
    <text x={16} y={191} className="rs-t-caption">Avg. order</text>
    <text x={184} y={191} textAnchor="end" className="rs-t-value">$37.54</text>
  </>,
  report: <g data-press>
    <rect x={16.5} y={203.5} width={167} height={27} rx={6.5} className="rs-btn-ghost" />
    <text x={100} y={220.6} textAnchor="middle" className="rs-t-btn-ghost rs-before">Open report</text>
    <text x={100} y={220.6} textAnchor="middle" className="rs-t-btn-ghost rs-after">Opening…</text>
  </g>,

  // Now playing
  cover: <>
    <g clipPath="url(#rs-cover-clip)">
      <rect x={16} y={16} width={168} height={112} fill="url(#rs-cover-sky)" />
      <circle cx={126} cy={68} r={30} className="rs-cover-sun" mask="url(#rs-sun-cut)" />
      <path d="M16 102c26-16 50-18 78-6s54 10 90-10v42H16Z" className="rs-cover-hill" />
      <path d="M16 116c34-10 62-8 92 0s52 6 76-4v16H16Z" className="rs-cover-hill-front" />
    </g>
    <rect x={16.5} y={16.5} width={167} height={111} rx={8.5} className="rs-cover-edge" />
  </>,
  track: <>
    <text x={16} y={151} className="rs-t-title">Morning Grain</text>
    <text x={16} y={165.5} className="rs-t-caption">Reinhart Julian</text>
    <path d="M178 145.2c-1.6-1.9-4.8-1.2-4.8 1.4 0 2.2 2.6 3.9 4.8 5.6 2.2-1.7 4.8-3.4 4.8-5.6 0-2.6-3.2-3.3-4.8-1.4Z" className="rs-icon" />
  </>,
  progress: <>
    <rect x={16} y={177} width={168} height={3.5} rx={1.75} className="rs-track" />
    <rect x={16} y={177} width={54} height={3.5} rx={1.75} className="rs-ink" />
    <circle cx={70} cy={178.75} r={4.2} className="rs-knob" />
    <text x={16} y={194} className="rs-t-mono rs-t-faint">1:12</text>
    <text x={184} y={194} textAnchor="end" className="rs-t-mono rs-t-faint">3:40</text>
  </>,
  controls: <>
    <path d="M24 214h4l8 10h4M24 224h4l2-2.5M36 214h4M38 212l2 2-2 2M38 222l2 2-2 2" className="rs-icon" />
    <path d="M66 213.5v11M76 213.5l-8 5.5 8 5.5Z" className="rs-icon rs-icon-solid" />
    <g data-press>
      <circle cx={100} cy={219} r={15} className="rs-ink" />
      <path d="M96.5 212.8v12.4l10-6.2Z" className="rs-icon-fill-inverse rs-before" />
      <path d="M95.5 213.5v11M104.5 213.5v11" className="rs-icon-inverse rs-icon-bold rs-after" />
    </g>
    <path d="M134 213.5v11M124 213.5l8 5.5-8 5.5Z" className="rs-icon rs-icon-solid" />
    <path d="M162 216.5h14l-3-3M178 221.5h-14l3 3" className="rs-icon" />
  </>
};

/** Upright label riding a token: its tag until validated, then the bound value. */
function TokenLabel({ line, tokenRef }: { line: StackLine; tokenRef: (node: SVGGElement | null) => void }) {
  const tag = `<${line.text.match(/^<(\w+)/)?.[1] ?? "?"}>`;
  const bound = line.blocked ? "✕ rejected" : line.value ?? tag;
  const width = (text: string) => text.length * TOKEN_ADVANCE + 12;
  return (
    <g ref={tokenRef} className="rs-token" data-state="raw" data-width={Math.max(width(tag), width(bound))} style={{ visibility: "hidden" }}>
      <g className="rs-token-raw">
        <rect x={0} y={-6.5} width={width(tag)} height={13} rx={6.5} />
        <text x={6} y={2.4}>{tag}</text>
      </g>
      <g className="rs-token-bound">
        <rect x={0} y={-6.5} width={width(bound)} height={13} rx={6.5} />
        <text x={6} y={2.4}>{bound}</text>
      </g>
    </g>
  );
}

function PlateLabel({ index, name, labelRef }: { index: string; name: string; labelRef: (node: SVGTextElement | null) => void }) {
  return (
    <text ref={labelRef} x={PLATE_LABEL.x} y={PLATE_LABEL.y} className="rs-plate-label">
      <tspan className="rs-plate-index">{index}</tspan>{"  "}{name}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RenderStackHero() {
  // SVG nodes the frame loop writes to; filled by ref callbacks, never read during render.
  const nodesRef = React.useRef<StackNodes | null>(null);
  const registry = React.useCallback(() => nodesRef.current ??= createNodes(), []);
  const rawId = React.useId();
  const id = `rs${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const timeRef = React.useRef(0);
  const tiltRef = React.useRef<StackTilt>({ x: 0, y: 0, strength: 0 });
  const smoothTiltRef = React.useRef<StackTilt>({ x: 0, y: 0, strength: 0 });
  const [paused, setPaused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [tabVisible, setTabVisible] = React.useState(true);
  const [sceneIndex, setSceneIndex] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState<boolean | null>(null);
  const running = visible && tabVisible && !paused && reducedMotion === false;

  React.useEffect(() => {
    const node = registry().root;
    if (!node) return;
    const observer = typeof IntersectionObserver === "undefined" ? null
      : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (observer) observer.observe(node);
    else setVisible(true);
    const updateVisibility = () => setTabVisible(!document.hidden);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motionPreference.matches);
    updateVisibility();
    updateMotion();
    document.addEventListener("visibilitychange", updateVisibility);
    motionPreference.addEventListener("change", updateMotion);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      motionPreference.removeEventListener("change", updateMotion);
    };
  }, [registry]);

  React.useEffect(() => {
    const frame = createStackFrame();
    const state: PaintState = { scene: -1, clipped: null };
    const clipUrl = `url(#${id}-type)`;
    if (reducedMotion) {
      timeRef.current = STILL_TIME;
      tiltRef.current = { x: 0, y: 0, strength: 0 };
      smoothTiltRef.current = { x: 0, y: 0, strength: 0 };
    }
    let raf = 0, last = 0, label = -1;
    const paint = (time: number) => {
      sampleStack(time, smoothTiltRef.current, frame);
      paintFrame(frame, registry(), state, clipUrl);
      if (label !== frame.scene) { label = frame.scene; setSceneIndex(frame.scene); }
    };
    paint(reducedMotion ? STILL_TIME : timeRef.current);
    if (!running) return;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const delta = last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      timeRef.current += delta;
      const tilt = smoothTiltRef.current;
      const target = tiltRef.current;
      const blend = 1 - Math.exp(-delta * 4);
      tilt.x += (target.x - tilt.x) * blend;
      tilt.y += (target.y - tilt.y) * blend;
      tilt.strength += (target.strength - tilt.strength) * blend;
      paint(timeRef.current);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, reducedMotion, id, registry]);

  const followPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "touch" || paused || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltRef.current = {
      x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)),
      strength: 1
    };
  };

  return (
    <figure ref={node => { registry().root = node; }} className="render-stack" data-running={running}
      aria-label="Exploded view of a widget: the model's template, a validation layer with your app's data, and the rendered card">
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="render-stack-scene" aria-hidden="true"
        onPointerMove={followPointer} onPointerLeave={() => { tiltRef.current.strength = 0; }}>
        <defs>
          <pattern id={`${id}-dots`} width={10} height={10} patternUnits="userSpaceOnUse">
            <circle cx={5} cy={5} r={.75} className="rs-dot" />
          </pattern>
          <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={9} />
          </filter>
          <clipPath id={`${id}-type`}>
            <rect ref={node => { registry().typeClip = node; }} x={0} y={0} width={0} height={CODE.size + 5} />
          </clipPath>
          <clipPath id="rs-cover-clip">
            <rect x={16} y={16} width={168} height={112} rx={9} />
          </clipPath>
          <mask id="rs-sun-cut" maskUnits="userSpaceOnUse" x={90} y={32} width={72} height={72}>
            <rect x={90} y={32} width={72} height={72} fill="#fff" />
            <path d="M90 74.5h72M90 81.5h72M90 88.5h72" stroke="#000" strokeWidth={2.6} />
          </mask>
          <linearGradient id="rs-cover-sky" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#ff9a5a" />
            <stop offset=".55" stopColor="#f0508c" />
            <stop offset="1" stopColor="#6c4bd8" />
          </linearGradient>
          {LINES.map(line => (
            <linearGradient key={line} id={`${id}-beam-${line}`} ref={node => { registry().beams[line].gradient = node; }} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={1}>
              <stop offset="0" className="rs-beam-stop" stopOpacity={0} />
              <stop offset="1" className="rs-beam-stop" stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>

        <g className="rs-guides">
          {[0, 1, 2, 3].map(corner => <line key={corner} ref={node => { registry().guides[corner] = node; }} />)}
        </g>

        <g ref={node => { registry().shadow = node; }} className="rs-shadow">
          <rect x={6} y={10} width={CARD_WIDTH - 12} height={CARD_HEIGHT - 8} rx={16} filter={`url(#${id}-blur)`} />
        </g>

        {/* 03 · Render: the widget card. */}
        <g ref={node => { registry().plates[0] = node; }}>
          <rect ref={node => { registry().placeholder = node; }} x={.5} y={.5} width={CARD_WIDTH - 1} height={CARD_HEIGHT - 1} rx={14} className="rs-card-placeholder" />
          <rect ref={node => { registry().surface = node; }} x={.5} y={.5} width={CARD_WIDTH - 1} height={CARD_HEIGHT - 1} rx={14} className="rs-card" />
          <rect ref={node => { registry().seal = node; }} x={.5} y={.5} width={CARD_WIDTH - 1} height={CARD_HEIGHT - 1} rx={14} className="rs-card-seal" />
          {SCENES.map(sceneIndex => {
            const scene = STACK_SCENES[sceneIndex];
            return (
              <g key={sceneIndex} ref={node => { registry().scenes[sceneIndex].card = node; }} style={{ display: "none" }}>
                {scene.lines.map((line, index) => line.lands && !line.blocked ? (
                  <circle key={`ripple-${index}`} ref={node => { registry().scenes[sceneIndex].ripples[index] = node; }} cx={line.lands[0]} cy={line.lands[1]} r={0} className="rs-ripple" />
                ) : null)}
                {scene.lines.map((line, index) => line.part ? (
                  <g key={index} ref={node => {
                    registry().scenes[sceneIndex].parts[index] = node;
                    const press = node?.querySelector<SVGGElement>("[data-press]");
                    if (press) registry().scenes[sceneIndex].press = press;
                  }} style={{ opacity: 0 }}>
                    {CARD_PARTS[line.part]}
                  </g>
                ) : null)}
                <g ref={node => { registry().scenes[sceneIndex].toast = node; }} style={{ opacity: 0 }}>
                  <rect x={(CARD_WIDTH - TOAST.width) / 2} y={TOAST.top} width={TOAST.width} height={TOAST.height} rx={TOAST.height / 2} className="rs-toast" />
                  <text x={CARD_WIDTH / 2} y={TOAST.top + 14.2} textAnchor="middle" className="rs-toast-text">
                    <tspan className="rs-toast-dim">onAction →</tspan> {scene.action}
                  </text>
                </g>
              </g>
            );
          })}
          <circle ref={node => { registry().click = node; }} r={0} className="rs-click" style={{ opacity: 0 }} />
          <g ref={node => { registry().cursor = node; }} style={{ opacity: 0 }}>
            <path d="M0 0v16.2l4.1-3.8 3 6.7 2.8-1.2-3-6.6h5.7Z" className="rs-cursor" />
          </g>
          <PlateLabel index="03" name="RENDER" labelRef={node => { registry().labels[0] = node; }} />
        </g>

        {/* 02 · Validate: schema gates and the app's data. */}
        <g ref={node => { registry().plates[1] = node; }} style={{ opacity: 0 }}>
          <rect x={.5} y={.5} width={CARD_WIDTH - 1} height={CARD_HEIGHT - 1} rx={14} className="rs-membrane-tint" />
          <rect x={.5} y={.5} width={CARD_WIDTH - 1} height={CARD_HEIGHT - 1} rx={14} className="rs-membrane" fill={`url(#${id}-dots)`} />
          <text x={12} y={20} className="rs-membrane-meta">schema · data</text>
          {SCENES.map(sceneIndex => {
            const scene = STACK_SCENES[sceneIndex];
            return (
              <g key={sceneIndex} ref={node => { registry().scenes[sceneIndex].membrane = node; }} style={{ display: "none" }}>
                {scene.lines.map((line, index) => {
                  if (!line.lands) return null;
                  const gate = LINE_GEOMETRY[sceneIndex][index].gate;
                  return (
                    <g key={index}>
                      <g ref={node => { registry().scenes[sceneIndex].gates[index] = node; }} className="rs-gate" data-state="idle" transform={`translate(${gate[0].toFixed(2)} ${gate[1].toFixed(2)})`}>
                        <circle ref={node => { registry().scenes[sceneIndex].rings[index] = node; }} r={4} className="rs-gate-ring" style={{ opacity: 0 }} />
                        <rect x={-4.5} y={-4.5} width={9} height={9} rx={2.5} className="rs-gate-box" />
                        <path d="M-2.2.2l1.5 1.5 2.9-3.2" className="rs-gate-check" />
                        <path d="M-2-2l4 4M2-2l-4 4" className="rs-gate-cross" />
                      </g>
                      {line.blocked ? (
                        <text x={gate[0] + (gate[0] > CARD_WIDTH - 80 ? -9 : 9)} y={gate[1] + 2.4} textAnchor={gate[0] > CARD_WIDTH - 80 ? "end" : "start"} className="rs-blocked-label">unsafe · rejected</text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <PlateLabel index="02" name="VALIDATE" labelRef={node => { registry().labels[1] = node; }} />
        </g>

        {/* Tokens between the plates. */}
        <g className="rs-beams">
          {LINES.map(line => (
            <g key={line}>
              <line ref={node => { registry().beams[line].thread = node; }} className="rs-thread" style={{ visibility: "hidden" }} />
              <line ref={node => { registry().beams[line].glow = node; }} className="rs-beam-glow" stroke={`url(#${id}-beam-${line})`} style={{ visibility: "hidden" }} />
              <line ref={node => { registry().beams[line].body = node; }} className="rs-beam" stroke={`url(#${id}-beam-${line})`} style={{ visibility: "hidden" }} />
              <g ref={node => { registry().beams[line].head = node; }} className="rs-beam-head" style={{ visibility: "hidden" }}>
                <circle r={6} className="rs-beam-halo" />
                <circle r={2.3} className="rs-beam-core" />
              </g>
            </g>
          ))}
        </g>

        {/* 01 · Write: the model's template. */}
        <g ref={node => { registry().plates[2] = node; }} style={{ opacity: 0 }}>
          <rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} rx={14} className="rs-write" />
          <text x={CODE.left} y={21} className="rs-code-meta">model output</text>
          <g className="rs-live">
            <circle cx={CARD_WIDTH - 16} cy={18.4} r={2.3} />
            <text x={CARD_WIDTH - 22} y={21} textAnchor="end" className="rs-code-meta">streaming</text>
          </g>
          <path d={`M0 30.5h${CARD_WIDTH}`} className="rs-write-rule" />
          {SCENES.map(sceneIndex => {
            const scene = STACK_SCENES[sceneIndex];
            return (
              <g key={sceneIndex} ref={node => { registry().scenes[sceneIndex].code = node; }} style={{ display: "none" }}>
                {scene.lines.map((line, index) => {
                  const baseline = lineBaseline(index);
                  const [emitX, emitY] = LINE_GEOMETRY[sceneIndex][index].emit;
                  return (
                    <g key={index}>
                      <text ref={node => { registry().scenes[sceneIndex].lines[index] = node; }} x={lineStart(line)} y={baseline} className="rs-code" style={{ visibility: "hidden" }}>
                        <CodeTokens text={line.text} />
                      </text>
                      {line.blocked ? (
                        <line ref={node => { registry().scenes[sceneIndex].strikes[index] = node; }} x1={lineStart(line)} x2={lineStart(line)} y1={baseline - 3} y2={baseline - 3} className="rs-strike" style={{ opacity: 0 }} />
                      ) : null}
                      {line.lands ? (
                        <circle ref={node => { registry().scenes[sceneIndex].sparks[index] = node; }} cx={emitX} cy={emitY} r={3.2} className="rs-spark" style={{ opacity: 0 }} />
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <rect ref={node => { registry().caret = node; }} x={0} y={0} width={4.6} height={CODE.size + 1.5} className="rs-caret" />
          <text x={CODE.left} y={CARD_HEIGHT - 16} className="rs-code-meta">strict JSX-like · no scripts</text>
          <PlateLabel index="01" name="WRITE" labelRef={node => { registry().labels[2] = node; }} />
        </g>

        {/* Token labels ride above every plate so they never hide under the template. */}
        <g className="rs-token-layer">
          {SCENES.map(sceneIndex => (
            <g key={sceneIndex} ref={node => { registry().scenes[sceneIndex].labels = node; }} style={{ display: "none" }}>
              {STACK_SCENES[sceneIndex].lines.map((line, index) => line.lands ? (
                <TokenLabel key={index} line={line} tokenRef={node => { registry().scenes[sceneIndex].tokens[index] = node; }} />
              ) : null)}
            </g>
          ))}
        </g>
      </svg>
      <figcaption className="render-stack-caption">
        <span className="render-stack-status" aria-hidden="true">
          <i />{STACK_SCENES[sceneIndex].name}
          <span>{String(sceneIndex + 1).padStart(2, "0")} / {String(STACK_SCENES.length).padStart(2, "0")}</span>
        </span>
        {reducedMotion === false ? (
          <button type="button" className="render-stack-pause" onClick={() => setPaused(value => !value)}
            aria-label={paused ? "Resume hero animation" : "Pause hero animation"}>
            {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
