import React from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

import { WidgetRenderer } from "@/widget";
import { widgetRegistry } from "@/widget/registry";
import type { ActionConfig } from "@/widget/types";

import {
  balanceTemplatePrefix,
  heroData,
  heroTemplate,
  sourceScrollDelta
} from "./heroExhibit";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const mcpEndpoint = "https://genui.tugan.app/mcp";
const developerModeGuideUrl =
  "https://developers.openai.com/api/docs/guides/developer-mode";

const pipeline = [
  {
    num: "01",
    title: "Write",
    body: "The model composes from a fixed registry. Bindings, conditions, loops — a declarative grammar, never open-ended code."
  },
  {
    num: "02",
    title: "Validate",
    body: "Zod schemas gate the data. Unknown components and unsafe values are rejected at parse, before anything paints."
  },
  {
    num: "03",
    title: "Render",
    body: "Design tokens, light and dark themes, chat-scale motion. Every component ships finished — there is no restyling pass."
  },
  {
    num: "04",
    title: "Act",
    body: "Taps, submits, and selections route back through one onAction bridge. Client actions like copy run locally."
  }
];

// Curated index of the gallery. Counts are pinned to the data by
// tests/doc-counts.test.mjs — when it fails, update the numbers here.
// "Featured" is the flag-driven showcase wall; the rest are data categories.
const collection = [
  { name: "Featured", note: "the sixteen signature demos", count: 16 },
  { name: "Agent UI", note: "thinking · streaming · approvals · orbs", count: 13 },
  { name: "Commerce", note: "carts · checkout · receipts", count: 6 },
  { name: "Analytics", note: "charts · stats · sparklines", count: 5 },
  { name: "Communication", note: "chat · citations · profiles", count: 5 },
  { name: "Engine", note: "control flow · state · expressions", count: 5 },
  { name: "Productivity", note: "tasks · steps · smart home", count: 5 },
  { name: "Travel", note: "itineraries · bookings · weather", count: 5 },
  { name: "Forms", note: "inputs · pickers · validation", count: 4 },
  { name: "Media", note: "audio · video · image grids", count: 4 }
];

const quickStartCode = `npm install @tugan/widgets

import "@tugan/widgets/styles.css";
import { WidgetRenderer } from "@tugan/widgets";

<WidgetRenderer
  template={template} // model-written template string
  data={data} // your app's JSON
  onAction={(action) => handleAction(action)}
/>`;

/* ------------------------------------------------------------------ */
/* Shared class recipes                                                */
/* ------------------------------------------------------------------ */

const btnBase =
  "ff-mono inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-[var(--ink)] px-3 text-[10px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] sm:w-auto sm:px-6 sm:text-xs sm:tracking-[0.12em]";
const btnPrimary = `${btnBase} bg-[var(--ink)] text-[var(--paper)] hover:bg-transparent hover:text-[var(--ink)]`;
const btnGhost = `${btnBase} bg-transparent text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]`;

/* ------------------------------------------------------------------ */
/* Template syntax tinting                                             */
/* ------------------------------------------------------------------ */

const TEMPLATE_LINES = heroTemplate.split("\n");

// Tint one complete template line: strings/expressions in muted indigo,
// attribute names dimmed, tag structure in the panel's base bone.
function highlightLine(line: string, lineKey: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const parts = line.split(/("[^"]*"|\{\{?[^}]*\}?\})/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith('"') || part.startsWith("{")) {
      out.push(
        <span key={`${lineKey}-${i}`} className="text-[var(--panel-string)]">
          {part}
        </span>
      );
      return;
    }
    part.split(/([A-Za-z][\w-]*=)/g).forEach((piece, j) => {
      if (!piece) return;
      out.push(
        piece.endsWith("=") ? (
          <span key={`${lineKey}-${i}-${j}`} className="text-[var(--panel-dim)]">
            {piece}
          </span>
        ) : (
          <React.Fragment key={`${lineKey}-${i}-${j}`}>{piece}</React.Fragment>
        )
      );
    });
  });
  return out;
}

const HIGHLIGHTED_LINES = TEMPLATE_LINES.map((line, i) => highlightLine(line, i));

function scrollSourceHorizontally(event: React.KeyboardEvent<HTMLDivElement>) {
  const delta = sourceScrollDelta(event.key);
  if (delta === 0) return;
  event.preventDefault();
  event.currentTarget.scrollLeft += delta;
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

// A print-style registration mark: two counter-rotating crosshair rings.
// Rendered at glyph scale in section eyebrows, where finer detail would smear.
function DraftingMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
    >
      <g
        className="sr-spin"
        style={{ transformOrigin: "50% 50%", animationDuration: "44s" }}
      >
        <circle cx="100" cy="100" r="95" strokeWidth="2" strokeDasharray="4 10" />
        <path d="M100 5 v26 M100 169 v26 M5 100 h26 M169 100 h26" strokeWidth="2" />
      </g>
      <g
        className="sr-spin"
        style={{
          transformOrigin: "50% 50%",
          animationDuration: "30s",
          animationDirection: "reverse"
        }}
      >
        <circle cx="100" cy="100" r="62" strokeWidth="2" />
        <path d="M100 38 v16 M100 146 v16 M38 100 h16 M146 100 h16" strokeWidth="2" />
      </g>
      <circle cx="100" cy="100" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// One stroke of a plotted wireframe, in plotting order.
type PlotStroke = {
  d?: string;
  rect?: [x: number, y: number, w: number, h: number, rx: number];
  circle?: [cx: number, cy: number, r: number];
  width?: number;
  opacity?: number;
};

// Three widget layouts the plotter cycles through, each drawn frame-first,
// then header, content, footer — the order a person would sketch it.
const PLOT_LAYOUTS: { label: string; strokes: PlotStroke[] }[] = [
  {
    label: "FIG. A — STAT CARD",
    strokes: [
      { rect: [36, 28, 208, 248, 14], width: 2 },
      { d: "M56 62 h84", width: 2.5, opacity: 0.85 },
      { d: "M56 80 h56", width: 1.5, opacity: 0.55 },
      { rect: [188, 54, 40, 18, 9], width: 1.5, opacity: 0.7 },
      { d: "M56 122 h72", width: 4, opacity: 0.9 },
      { d: "M140 122 h28", width: 1.5, opacity: 0.6 },
      { d: "M56 168 L80 156 L100 172 L124 148 L150 160 L178 140 L204 150", width: 2 },
      { d: "M56 204 h168", width: 1, opacity: 0.4 },
      { rect: [56, 224, 54, 22, 11], width: 1.5, opacity: 0.7 },
      { rect: [120, 224, 54, 22, 11], width: 1.5, opacity: 0.7 },
      { rect: [184, 224, 40, 22, 11], width: 1.5, opacity: 0.45 }
    ]
  },
  {
    label: "FIG. B — THREAD",
    strokes: [
      { rect: [36, 28, 208, 248, 14], width: 2 },
      { circle: [64, 68, 14], width: 1.5, opacity: 0.75 },
      { rect: [90, 50, 130, 36, 11], width: 1.5, opacity: 0.75 },
      { d: "M102 68 h96", width: 1.5, opacity: 0.5 },
      { rect: [56, 102, 150, 48, 11], width: 1.5, opacity: 0.75 },
      { d: "M68 121 h118", width: 1.5, opacity: 0.5 },
      { d: "M68 137 h84", width: 1.5, opacity: 0.5 },
      {
        d: "M62 182 a3 3 0 1 0 0.1 0 M78 182 a3 3 0 1 0 0.1 0 M94 182 a3 3 0 1 0 0.1 0",
        width: 1.5,
        opacity: 0.6
      },
      { rect: [56, 210, 168, 36, 18], width: 2, opacity: 0.85 },
      { d: "M192 238 l20 -10 l-20 -10", width: 2, opacity: 0.85 }
    ]
  },
  {
    label: "FIG. C — FORM",
    strokes: [
      { rect: [36, 28, 208, 248, 14], width: 2 },
      { d: "M56 60 h96", width: 2.5, opacity: 0.85 },
      { rect: [56, 84, 168, 30, 8], width: 1.5, opacity: 0.7 },
      { d: "M68 99 h60", width: 1.5, opacity: 0.45 },
      { rect: [56, 128, 168, 30, 8], width: 1.5, opacity: 0.7 },
      { d: "M68 143 h44", width: 1.5, opacity: 0.45 },
      { rect: [56, 178, 44, 22, 11], width: 1.5, opacity: 0.75 },
      { circle: [89, 189, 7], width: 1.5, opacity: 0.85 },
      { d: "M112 189 h64", width: 1.5, opacity: 0.55 },
      { rect: [56, 224, 168, 34, 17], width: 2.5, opacity: 0.9 },
      { d: "M116 241 h48", width: 2, opacity: 0.85 }
    ]
  }
];

const PLOT_SLOT_S = 12; // seconds each layout owns of the 36s cycle
const PLOT_STAGGER_S = 0.3; // gap between successive pen strokes

// The hero mark: a plotter endlessly drafting widget wireframes. Each stroke
// draws itself in sequence (dash-offset on a shared timeline), the finished
// figure holds, wipes, and the pen starts the next layout.
function BlueprintMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 340"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
    >
      {/* static sheet chrome: corner brackets */}
      <path d="M24 34 v-14 h14 M242 20 h14 v14 M256 274 v14 h-14 M38 288 h-14 v-14"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {PLOT_LAYOUTS.map((layout, slot) => (
        <g key={layout.label} className={slot > 0 ? "sr-plot-alt" : undefined}>
          {layout.strokes.map((stroke, i) => {
            const style: React.CSSProperties = {
              animationDelay: `${slot * PLOT_SLOT_S + i * PLOT_STAGGER_S}s`
            };
            const common = {
              className: "sr-plot",
              style,
              pathLength: 1,
              strokeWidth: stroke.width ?? 1.5,
              opacity: stroke.opacity ?? 0.8,
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const
            };
            if (stroke.rect) {
              const [x, y, w, h, rx] = stroke.rect;
              return <rect key={i} x={x} y={y} width={w} height={h} rx={rx} {...common} />;
            }
            if (stroke.circle) {
              const [cx, cy, r] = stroke.circle;
              return <circle key={i} cx={cx} cy={cy} r={r} {...common} />;
            }
            return <path key={i} d={stroke.d} {...common} />;
          })}
          <text
            x="36"
            y="322"
            className={`ff-mono sr-plot-label${slot > 0 ? " sr-plot-alt" : ""}`}
            style={{ animationDelay: `${slot * PLOT_SLOT_S}s` }}
            fill="currentColor"
            stroke="none"
            fontSize="10"
            letterSpacing="2"
          >
            {layout.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SectionEyebrow({ route, meta }: { route: string; meta: string }) {
  return (
    <p className="ff-mono flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--ink)] pt-3 text-[11px] tracking-[0.14em]">
      <span className="flex items-center gap-2.5 text-[var(--ink)]">
        <DraftingMark className="h-3.5 w-3.5 text-[var(--faint)]" />
        {route}
      </span>
      <span className="uppercase text-[var(--mid)]">{meta}</span>
    </p>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="ff-display mt-5 text-balance text-[clamp(26px,4vw,44px)] font-semibold leading-[1.02] text-[var(--ink)] md:mt-7"
    >
      {children}
    </h2>
  );
}

function CopyAction({
  text,
  label = "Copy",
  className = ""
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions / insecure context) — fail quietly.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`ff-mono cursor-pointer text-[11.5px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${className}`}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function RegistryTicker() {
  const names = React.useMemo(() => Object.keys(widgetRegistry), []);
  return (
    <aside
      aria-label="Component registry"
      className="sr-ticker mt-16 overflow-hidden border-y border-t-[var(--ink)] border-b-[var(--hairline)] md:mt-24"
    >
      <p className="ff-mono pt-2.5 text-[10.5px] uppercase tracking-[0.16em] text-[var(--faint)]">
        Registry — {names.length} names, validated at parse
      </p>
      <div className="flex whitespace-nowrap py-3">
        <div className="sr-ticker-track flex shrink-0">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex">
              {names.map((name) => (
                <span
                  key={name}
                  className="ff-mono pr-7 text-[12.5px] text-[var(--mid)] after:ml-7 after:text-[var(--faint)] after:content-['·']"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* The exhibit: template types itself, then the real renderer mounts   */
/* ------------------------------------------------------------------ */

const TYPE_DURATION_MS = 5600;
const TYPE_TICK_MS = 16;

type ExhibitPhase = "typing" | "validating" | "done";

function Exhibit() {
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = React.useState(false);
  const [runId, setRunId] = React.useState(0);
  const [pointer, setPointer] = React.useState(0);
  const [phase, setPhase] = React.useState<ExhibitPhase>("typing");
  const [inspector, setInspector] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);
  const actionTimerRef = React.useRef<number | null>(null);

  // Start the sequence once the exhibit scrolls into view.
  React.useEffect(() => {
    if (started) return;
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  // Advance the character pointer; reduced motion skips straight to the end.
  React.useEffect(() => {
    if (!started) return;
    if (reduceMotion) {
      setPointer(heroTemplate.length);
      setPhase("done");
      return;
    }
    setPointer(0);
    setPhase("typing");
    // Progress is a function of elapsed time, not tick count, so a throttled
    // background tab still finishes on schedule instead of crawling.
    const start = performance.now();
    const interval = window.setInterval(() => {
      const progress = Math.min((performance.now() - start) / TYPE_DURATION_MS, 1);
      setPointer(Math.round(progress * heroTemplate.length));
      if (progress >= 1) window.clearInterval(interval);
    }, TYPE_TICK_MS);
    return () => window.clearInterval(interval);
  }, [started, runId, reduceMotion]);

  // Typing finished → brief validation beat → mount the renderer. The
  // transition and the timer live in separate effects: setting phase inside
  // the watcher re-runs it, and a combined effect would clear its own timer.
  React.useEffect(() => {
    if (!started || phase !== "typing" || pointer < heroTemplate.length) return;
    setPhase("validating");
  }, [pointer, phase, started]);

  React.useEffect(() => {
    if (phase !== "validating") return;
    const timer = window.setTimeout(() => setPhase("done"), 380);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Devtools-style inspector flash once the widget is on the plinth.
  React.useEffect(() => {
    if (phase !== "done" || reduceMotion) return;
    const measure = window.setTimeout(() => {
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setInspector(`${Math.round(rect.width)} × ${Math.round(rect.height)} · schema ✓`);
      }
    }, 420);
    const clear = window.setTimeout(() => setInspector(null), 2800);
    return () => {
      window.clearTimeout(measure);
      window.clearTimeout(clear);
    };
  }, [phase, runId, reduceMotion]);

  // Keep the source panel pinned to the freshly typed line.
  React.useEffect(() => {
    if (phase !== "typing") return;
    const node = panelRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [pointer, phase]);

  React.useEffect(() => {
    return () => {
      if (actionTimerRef.current) window.clearTimeout(actionTimerRef.current);
    };
  }, []);

  const handleAction = React.useCallback((action: ActionConfig) => {
    setLastAction(action?.type ?? "action");
    if (actionTimerRef.current) window.clearTimeout(actionTimerRef.current);
    actionTimerRef.current = window.setTimeout(() => setLastAction(null), 2600);
  }, []);

  const replay = React.useCallback(() => {
    setInspector(null);
    setLastAction(null);
    setPointer(0);
    setPhase("typing");
    setStarted(true);
    setRunId((id) => id + 1);
  }, []);

  const typed = heroTemplate.slice(0, pointer);
  const typedLines = typed.split("\n");
  const isTyping = phase === "typing" && pointer < heroTemplate.length;
  const completeCount = isTyping ? typedLines.length - 1 : TEMPLATE_LINES.length;
  const partial = isTyping ? typedLines[typedLines.length - 1] : null;

  // The widget streams in alongside the typing: each completed line re-renders
  // the balanced prefix, exactly how a host paints a model's partial output.
  const previewTemplate = React.useMemo(
    () =>
      completeCount >= TEMPLATE_LINES.length
        ? heroTemplate
        : balanceTemplatePrefix(TEMPLATE_LINES.slice(0, completeCount)),
    [completeCount]
  );
  const showWidget = completeCount >= 2;

  const statusLeft =
    phase === "typing"
      ? "Streaming render…"
      : phase === "validating"
        ? "Validating schema…"
        : "Render complete";
  const statusRight = lastAction
    ? `action → ${lastAction}`
    : phase === "done"
      ? "schema ✓"
      : "";

  return (
    <section ref={sectionRef} aria-label="Live render demonstration" className="mt-10 sm:mt-14 md:mt-24">
      <div className="ff-mono grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-t border-[var(--ink)] pb-3.5 pt-3 text-[10px] uppercase tracking-[0.12em] text-[var(--mid)] sm:flex sm:flex-wrap sm:justify-between sm:text-[11px] sm:tracking-[0.14em]">
        <span className="text-[var(--ink)]">Fig. 01 — Checkout</span>
        <span className="col-span-2 row-start-2 sm:order-none">One template string · one data object</span>
        <button
          type="button"
          onClick={replay}
          className="col-start-2 row-start-1 inline-flex min-h-11 cursor-pointer items-center justify-center border-b border-[var(--ink)] px-3 uppercase text-[var(--ink)] transition-colors hover:border-[var(--mid)] hover:text-[var(--mid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] sm:order-none"
        >
          ↻ Replay
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden border border-[var(--hairline)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex min-h-[280px] min-w-0 flex-col bg-[var(--panel)] p-4 sm:min-h-[360px] sm:p-5 md:min-h-[420px] md:p-7">
          <div
            id="hero-source-panel"
            ref={panelRef}
            role="region"
            tabIndex={0}
            aria-label="Widget template source"
            onKeyDown={scrollSourceHorizontally}
            className="ff-mono sr-no-scrollbar max-h-[300px] min-w-0 flex-1 overflow-auto whitespace-pre text-[10.5px] leading-[1.7] text-[var(--panel-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--panel-string)] sm:max-h-[440px] sm:text-[11px] md:max-h-[560px] md:text-[12px] md:leading-[1.75]"
          >
            {HIGHLIGHTED_LINES.slice(0, completeCount).map((nodes, i) => (
              <div key={i}>{TEMPLATE_LINES[i] ? nodes : " "}</div>
            ))}
            {partial !== null && (
              <div>
                {partial}
                <span className="sr-caret" aria-hidden />
              </div>
            )}
          </div>
          <div className="ff-mono mt-4 flex min-w-0 flex-wrap justify-between gap-x-3 gap-y-1 border-t border-[var(--panel-text)]/15 pt-3.5 text-[9.5px] uppercase tracking-[0.12em] text-[var(--panel-dim)] sm:text-[10.5px] sm:tracking-[0.14em]">
            <span>{statusLeft}</span>
            <span className={statusRight ? "text-[var(--panel-string)]" : ""}>
              {statusRight}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center border-t border-[var(--hairline)] bg-[var(--plinth)] p-5 sm:p-7 md:p-10 lg:border-l lg:border-t-0">
          <div className="relative w-full max-w-[360px]">
            {/* Viewfinder corners frame the stage until the render lands. */}
            <span
              aria-hidden
              className={`transition-opacity duration-700 ${
                phase === "done" ? "opacity-0" : "sr-corner-pulse"
              }`}
            >
              <span className="pointer-events-none absolute -left-4 -top-4 h-4 w-4 border-l border-t border-[var(--mid)]" />
              <span className="pointer-events-none absolute -right-4 -top-4 h-4 w-4 border-r border-t border-[var(--mid)]" />
              <span className="pointer-events-none absolute -bottom-4 -left-4 h-4 w-4 border-b border-l border-[var(--mid)]" />
              <span className="pointer-events-none absolute -bottom-4 -right-4 h-4 w-4 border-b border-r border-[var(--mid)]" />
            </span>
            {showWidget ? (
              <div ref={widgetRef} key={runId} className="sr-render-in w-full">
                <WidgetRenderer
                  template={previewTemplate}
                  data={heroData}
                  onAction={handleAction}
                />
              </div>
            ) : (
              <div
                className="w-full rounded-2xl border border-[var(--hairline)] bg-[var(--paper)]/45 py-20 sm:py-24"
                aria-hidden
              />
            )}
            {inspector && (
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-2xl border border-dashed border-[#6366f1]"
              >
                <span className="ff-mono absolute -top-6 left-0 whitespace-nowrap rounded-[3px] bg-[#6366f1] px-2 py-0.5 text-[9.5px] tracking-[0.08em] text-white">
                  {inspector}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function HomePage() {
  const componentCount = Object.keys(widgetRegistry).length;

  return (
    <div className="pb-6">
      {/* Hero */}
      <section aria-label="Introduction" className="relative pt-4 sm:pt-8 md:pt-16">
        <BlueprintMark className="pointer-events-none absolute right-4 top-1/2 hidden h-80 w-64 -translate-y-1/2 text-[var(--ink)] opacity-[0.45] lg:block xl:right-12 xl:h-[24rem] xl:w-80" />
        <p className="ff-mono flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[var(--ink)] pt-3.5 text-[11px] tracking-[0.16em] text-[var(--mid)]">
          <span className="uppercase">Open source — Apache-2.0</span>
          <span>@tugan/widgets</span>
        </p>
        <h1 className="ff-display relative mt-6 text-balance text-[clamp(38px,11vw,52px)] font-semibold leading-[0.98] tracking-[-0.015em] text-[var(--ink)] sm:mt-8 sm:text-[clamp(44px,8.5vw,104px)] md:mt-11">
          The model writes{" "}
          <span className="sr-outline">the interface.</span>
        </h1>
        <p className="mt-7 max-w-[58ch] text-[15.5px] leading-relaxed text-[var(--mid)] md:mt-9 md:text-[17px]">
          Widgets is a renderer for AI-generated UI. A model writes a strict,
          JSX-like template; your app supplies the data.{" "}
          <strong className="font-semibold text-[var(--ink)]">WidgetRenderer</strong>{" "}
          validates both and paints polished, interactive components — no
          arbitrary code, ever.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 md:mt-9">
          <Link to="/playground" className={btnPrimary}>
            Open playground →
          </Link>
          <Link to="/gallery" className={btnGhost}>
            Browse the gallery
          </Link>
        </div>
        <p className="ff-mono mt-8 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[var(--hairline)] pt-3.5 text-[10px] uppercase tracking-[0.1em] text-[var(--faint)] sm:flex sm:flex-wrap sm:gap-x-7 sm:text-[11px] sm:tracking-[0.14em] md:mt-11">
          <span>{componentCount} components</span>
          <span>200+ icons</span>
          <span>Light &amp; dark</span>
          <span>Zero-config theming</span>
        </p>
      </section>

      <Exhibit />

      <RegistryTicker />

      {/* ChatGPT / MCP */}
      <section aria-labelledby="chatgpt-title" className="mt-20 md:mt-32">
        <SectionEyebrow route="/mcp" meta="No auth required" />
        <SectionTitle id="chatgpt-title">Runs in ChatGPT</SectionTitle>
        <div className="mt-7 grid border border-[var(--hairline)] md:mt-10 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 p-6 md:p-8">
            <p className="ff-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--faint)]">
              MCP endpoint
            </p>
            <code className="ff-mono mt-2.5 block overflow-x-auto whitespace-nowrap pb-1 text-[clamp(15px,2.2vw,20px)] text-[var(--ink)]">
              {mcpEndpoint}
            </code>
            <p className="mt-3.5 max-w-[52ch] text-[13.5px] leading-relaxed text-[var(--mid)]">
              Create a custom connector in ChatGPT developer mode and point it
              at the endpoint — no authentication required. The model starts
              answering with widgets.{" "}
              <a
                href={developerModeGuideUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--ink)] underline underline-offset-3 transition-colors hover:text-[var(--mid)]"
              >
                Setup guide ↗
              </a>
            </p>
          </div>
          <div className="flex items-stretch border-t border-[var(--hairline)] md:border-l md:border-t-0">
            <CopyAction
              text={mcpEndpoint}
              label="Copy endpoint"
              className="flex min-h-14 w-full items-center justify-center px-7 text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] md:px-9"
            />
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section aria-labelledby="pipeline-title" className="mt-20 md:mt-32">
        <SectionEyebrow route="template → render" meta="Four stages, one pass" />
        <SectionTitle id="pipeline-title">Strict by construction</SectionTitle>
        <div className="mt-8 grid gap-y-7 sm:grid-cols-2 md:mt-11 lg:grid-cols-4 lg:gap-y-0">
          {pipeline.map((stage, index) => (
            <div
              key={stage.num}
              className={`border-l py-1 pl-4 pr-6 ${
                index === 0 ? "border-[var(--ink)]" : "border-[var(--hairline)]"
              }`}
            >
              <span className="ff-mono text-[11px] tracking-[0.1em] text-[var(--faint)]">
                {stage.num}
              </span>
              <h3 className="mt-2.5 text-[15px] font-bold uppercase tracking-[0.05em] text-[var(--ink)]">
                {stage.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--mid)]">
                {stage.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick start */}
      <section aria-labelledby="quickstart-title" className="mt-20 md:mt-32">
        <SectionEyebrow route="npm i @tugan/widgets" meta="Three lines to first render" />
        <SectionTitle id="quickstart-title">In your app</SectionTitle>
        <div className="relative mt-7 bg-[var(--panel)] md:mt-10">
          <CopyAction
            text={quickStartCode}
            className="absolute right-0 top-0 border-b border-l border-[var(--panel-text)]/15 px-6 py-3.5 text-[var(--panel-dim)] hover:bg-[var(--panel-text)] hover:text-[var(--panel)]"
          />
          <pre className="ff-mono overflow-x-auto p-6 pr-28 text-[12.5px] leading-[1.75] text-[var(--panel-text)] md:p-8">
            <code>{quickStartCode}</code>
          </pre>
        </div>
      </section>

      {/* Collection */}
      <section aria-labelledby="collection-title" className="mt-20 md:mt-32">
        <SectionEyebrow route="/gallery" meta="52 widgets · 10 categories" />
        <SectionTitle id="collection-title">The collection</SectionTitle>
        <div className="mt-7 border-t border-[var(--ink)] md:mt-10">
          {collection.map((row) => {
            // The showcase row stands out in type alone: the reserved signal
            // indigo on the ✳ marker, name, count, and arrow — same paper
            // ground and hover behavior as every other row.
            const isFeatured = row.name === "Featured";
            return (
              <Link
                key={row.name}
                to={`/gallery?category=${encodeURIComponent(row.name)}`}
                className="group flex cursor-pointer items-baseline gap-4 border-b border-[var(--hairline)] px-0.5 py-3.5 transition-all hover:bg-[var(--plinth)] hover:px-3"
              >
                {isFeatured ? (
                  <span
                    aria-hidden
                    className="ff-mono self-center text-sm leading-none text-[var(--signal)]"
                  >
                    ✳
                  </span>
                ) : null}
                <span
                  className={`ff-display text-[clamp(17px,2.2vw,23px)] font-semibold ${
                    isFeatured ? "text-[var(--signal)]" : "text-[var(--ink)]"
                  }`}
                >
                  {row.name}
                </span>
                <span
                  className={`ff-mono hidden min-w-0 flex-1 truncate text-xs sm:block ${
                    isFeatured ? "text-[var(--mid)]" : "text-[var(--faint)]"
                  }`}
                >
                  {row.note}
                </span>
                <span
                  className={`ff-mono ml-auto text-[12.5px] tabular-nums sm:ml-0 ${
                    isFeatured ? "font-semibold text-[var(--signal)]" : "text-[var(--mid)]"
                  }`}
                >
                  {String(row.count).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm transition-transform group-hover:translate-x-1 ${
                    isFeatured
                      ? "text-[var(--signal)]"
                      : "text-[var(--faint)] group-hover:text-[var(--ink)]"
                  }`}
                  aria-hidden
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
