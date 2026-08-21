import React from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

import { WidgetRenderer } from "@/widget";
import { widgetRegistry } from "@/widget/registry";
import type { ActionConfig } from "@/widget/types";

import { balanceTemplatePrefix, heroData, heroTemplate } from "./heroExhibit";

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
  "ff-mono inline-flex h-11 cursor-pointer items-center gap-2 rounded-[2px] border border-[var(--ink)] px-6 text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";
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

// The hero's orbital instrument: rings drifting at different speeds and
// directions, a bold arc sweeping the rim, station nodes riding the orbits,
// and a fast radar arm — an astrolabe for the machine that drafts interfaces.
function OrbitalMark({ className }: { className?: string }) {
  const spin = (duration: string, reverse = false): React.CSSProperties => ({
    transformOrigin: "50% 50%",
    animationDuration: duration,
    animationDirection: reverse ? "reverse" : "normal"
  });
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
    >
      {/* static compass ticks frame the moving parts */}
      <path
        d="M120 2 v14 M120 224 v14 M2 120 h14 M224 120 h14"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* outer dashed ring, drifting */}
      <g className="sr-spin" style={spin("70s")}>
        <circle cx="120" cy="120" r="112" strokeWidth="1.5" strokeDasharray="2 9" opacity="0.5" />
      </g>
      {/* bold arc sweeping the rim (one long dash on the ring's circumference) */}
      <g className="sr-spin" style={spin("16s")}>
        <circle
          cx="120"
          cy="120"
          r="112"
          strokeWidth="5"
          strokeDasharray="150 554"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
      {/* middle ring with station nodes, counter-rotating */}
      <g className="sr-spin" style={spin("44s", true)}>
        <circle cx="120" cy="120" r="84" strokeWidth="1.5" opacity="0.35" />
        <circle cx="204" cy="120" r="5" fill="currentColor" stroke="none" opacity="0.7" />
        <rect x="116" y="32" width="8" height="8" strokeWidth="1.5" opacity="0.7" />
        <path d="M120 196 v8 M36 120 h-8" strokeWidth="2" opacity="0.6" />
      </g>
      {/* inner dashed ring with a satellite */}
      <g className="sr-spin" style={spin("26s")}>
        <circle cx="120" cy="120" r="56" strokeWidth="1.5" strokeDasharray="1 7" opacity="0.6" />
        <circle cx="120" cy="64" r="3.5" fill="currentColor" stroke="none" opacity="0.85" />
      </g>
      {/* radar arm, the fastest motion */}
      <g className="sr-spin" style={spin("10s")}>
        <path d="M120 120 L188 68" strokeWidth="1.5" opacity="0.8" />
        <circle cx="188" cy="68" r="6" strokeWidth="1.5" opacity="0.9" />
        <circle cx="188" cy="68" r="2" fill="currentColor" stroke="none" />
      </g>
      {/* hub */}
      <circle cx="120" cy="120" r="12" strokeWidth="1.5" opacity="0.6" />
      <circle cx="120" cy="120" r="3" fill="currentColor" stroke="none" opacity="0.9" />
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
    <section ref={sectionRef} aria-label="Live render demonstration" className="mt-14 md:mt-24">
      <div className="ff-mono flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[var(--ink)] pb-3.5 pt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--mid)]">
        <span className="text-[var(--ink)]">Fig. 01 — Checkout</span>
        <span>One template string · one data object</span>
        <button
          type="button"
          onClick={replay}
          className="cursor-pointer border-b border-[var(--ink)] pb-px uppercase text-[var(--ink)] transition-colors hover:border-[var(--mid)] hover:text-[var(--mid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
        >
          ↻ Replay
        </button>
      </div>

      <div className="grid border border-[var(--hairline)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex min-h-[420px] flex-col bg-[var(--panel)] p-5 md:p-7">
          <div
            ref={panelRef}
            aria-label="Widget template source"
            className="ff-mono sr-no-scrollbar max-h-[560px] flex-1 overflow-auto whitespace-pre text-[12px] leading-[1.75] text-[var(--panel-text)]"
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
          <div className="ff-mono mt-4 flex justify-between gap-3 border-t border-[var(--panel-text)]/15 pt-3.5 text-[10.5px] uppercase tracking-[0.14em] text-[var(--panel-dim)]">
            <span>{statusLeft}</span>
            <span className={statusRight ? "text-[var(--panel-string)]" : ""}>
              {statusRight}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-[var(--hairline)] bg-[var(--plinth)] p-7 md:p-10 lg:border-l lg:border-t-0">
          <div className="relative">
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
              <div ref={widgetRef} key={runId} className="sr-render-in w-[min(360px,80vw)]">
                <WidgetRenderer
                  template={previewTemplate}
                  data={heroData}
                  onAction={handleAction}
                />
              </div>
            ) : (
              <div
                className="w-[min(360px,80vw)] rounded-2xl border border-[var(--hairline)] bg-[var(--paper)]/45 py-24"
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
      <section aria-label="Introduction" className="relative pt-8 md:pt-16">
        <OrbitalMark className="pointer-events-none absolute right-2 top-24 hidden h-64 w-64 text-[var(--ink)] opacity-[0.22] lg:block xl:right-10 xl:h-80 xl:w-80" />
        <p className="ff-mono flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[var(--ink)] pt-3.5 text-[11px] tracking-[0.16em] text-[var(--mid)]">
          <span className="uppercase">Open source — Apache-2.0</span>
          <span>@tugan/widgets</span>
        </p>
        <h1 className="ff-display relative mt-8 text-balance text-[clamp(44px,8.5vw,104px)] font-semibold leading-[0.97] tracking-[-0.015em] text-[var(--ink)] md:mt-11">
          The model writes{" "}
          <span className="sr-outline">
            the{" "}
            <span className="relative inline-block">
              interface.
              <svg
                className="absolute -bottom-[0.1em] left-0 h-[0.11em] w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M1.5 5.4 C 18 3.2, 42 6.4, 62 4.4 S 92 4.6, 98.5 3.6"
                  pathLength="1"
                  className="sr-draw-stroke"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
          </span>
        </h1>
        <p className="mt-7 max-w-[58ch] text-[15.5px] leading-relaxed text-[var(--mid)] md:mt-9 md:text-[17px]">
          Widgets is a renderer for AI-generated UI. A model writes a strict,
          JSX-like template; your app supplies the data.{" "}
          <strong className="font-semibold text-[var(--ink)]">WidgetRenderer</strong>{" "}
          validates both and paints polished, interactive components — no
          arbitrary code, ever.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 md:mt-9">
          <Link to="/playground" className={btnPrimary}>
            Open playground →
          </Link>
          <Link to="/gallery" className={btnGhost}>
            Browse the gallery
          </Link>
        </div>
        <p className="ff-mono mt-8 flex flex-wrap gap-x-7 gap-y-1.5 border-t border-[var(--hairline)] pt-3.5 text-[11px] uppercase tracking-[0.14em] text-[var(--faint)] md:mt-11">
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
          {collection.map((row) => (
            <Link
              key={row.name}
              to={`/gallery?category=${encodeURIComponent(row.name)}`}
              className="group flex cursor-pointer items-baseline gap-4 border-b border-[var(--hairline)] px-0.5 py-3.5 transition-all hover:bg-[var(--plinth)] hover:px-3"
            >
              <span className="ff-display text-[clamp(17px,2.2vw,23px)] font-semibold text-[var(--ink)]">
                {row.name}
              </span>
              <span className="ff-mono hidden min-w-0 flex-1 truncate text-xs text-[var(--faint)] sm:block">
                {row.note}
              </span>
              <span className="ff-mono ml-auto text-[12.5px] tabular-nums text-[var(--mid)] sm:ml-0">
                {String(row.count).padStart(2, "0")}
              </span>
              <span
                className="text-sm text-[var(--faint)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--ink)]"
                aria-hidden
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
