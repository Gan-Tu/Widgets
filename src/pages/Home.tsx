import { useState } from "react";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  Copy,
  PackageOpen,
  Palette,
  Sparkles
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

import { WidgetRenderer } from "@/widget";

const cardClass =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,20,28,0.04),0_8px_24px_-12px_rgba(16,20,28,0.08)]";

const heroTemplate = `
<Card size="md">
  <Row justify="between" align="center">
    <Col gap={0}>
      <Title value="Revenue" size="sm" />
      <Caption value="Last 30 days" />
    </Col>
    <Badge label="+12.4%" color="success" icon="trending-up" />
  </Row>
  <Row gap={6}>
    <Stat label="MRR" value="$48.2K" delta="+8.1%" size="md" />
    <Stat label="Active users" value="12,480" delta="+3.2%" size="md" />
  </Row>
  <Sparkline data={trend} height={44} />
  <Divider />
  <ChipGroup name="range" defaultValue="30d" options={ranges} />
</Card>
`.trim();

const heroData = {
  trend: [8, 10, 9, 12, 14, 13, 16, 18, 17, 21, 24, 23, 27, 30],
  ranges: [
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" }
  ]
};

const heroChips = ["142 components", "200+ icons", "Zero-config theming"];

const features = [
  {
    icon: Braces,
    title: "LLM-friendly by design",
    body: "A constrained, JSX-like template DSL with schema-validated data. Models compose from a fixed component registry — predictable output, never arbitrary code."
  },
  {
    icon: Palette,
    title: "Premium out of the box",
    body: "Design tokens, light and dark themes, and motion presets tuned for chat-scale UI. Every component ships polished, so there is no restyling pass."
  },
  {
    icon: PackageOpen,
    title: "Embed anywhere",
    body: "Install @tugan/widgets, drop the renderer into any React app, and route taps, submits, and selections back through the actions bridge."
  }
];

const nextSteps = [
  {
    to: "/gallery",
    title: "Browse the gallery",
    description: "52 ready-made examples to copy and adapt"
  },
  {
    to: "/docs",
    title: "Read the docs",
    description: "Component APIs and the template DSL"
  },
  {
    to: "/playground",
    title: "Open the playground",
    description: "Edit templates and data with live output"
  }
];

const quickStartCode = `npm install @tugan/widgets

import "@tugan/widgets/styles.css";
import { WidgetRenderer } from "@tugan/widgets";

<WidgetRenderer
  template={template} // model-written template string
  data={data} // your app's JSON
  onAction={(action) => handleAction(action)}
/>`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

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
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

export function HomePage() {
  const reduceMotion = useReducedMotion();

  // Entrance animation for above-the-fold content. Delays are staggered and
  // capped at 0.2s total; disabled entirely under prefers-reduced-motion.
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            ease: "easeOut" as const,
            delay: Math.min(delay, 0.2)
          }
        };

  // Scroll-in animation for below-the-fold sections.
  const fadeIn = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          // Inset only the bottom edge: elements already scrolled past the
          // top (deep links, scroll restoration) must still trigger.
          viewport: { once: true, margin: "0px 0px -48px 0px" },
          transition: {
            duration: 0.45,
            ease: "easeOut" as const,
            delay: Math.min(delay, 0.2)
          }
        };

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="grid items-center gap-12 pt-2 md:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="max-w-xl space-y-6">
          <motion.p
            {...fadeUp(0)}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Open-source generative UI
          </motion.p>

          <motion.h1
            {...fadeUp(0.05)}
            className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl md:leading-[1.08]"
          >
            Composable widgets for AI-generated UIs
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="text-base leading-relaxed text-slate-600 md:text-lg"
          >
            Your model writes a compact, JSX-like template; your app supplies
            the data. WidgetRenderer validates both and renders a polished,
            interactive widget — cards, charts, forms, and timelines that feel
            native to your product.
          </motion.p>

          <motion.div
            {...fadeUp(0.15)}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              to="/playground"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Open playground
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/docs"
              className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Read the docs
            </Link>
          </motion.div>

          <motion.ul
            {...fadeUp(0.2)}
            className="flex flex-wrap items-center gap-2"
          >
            {heroChips.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                  aria-hidden
                />
                {chip}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          {...fadeUp(0.12)}
          className="mx-auto w-full max-w-[470px] lg:mx-0 lg:justify-self-end"
        >
          <div className={`${cardClass} p-2`}>
            <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                &lt;WidgetRenderer /&gt;
              </span>
            </div>
            <div className="rounded-xl bg-slate-50/70 p-3">
              <WidgetRenderer template={heroTemplate} data={heroData} />
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Live render — one template string, one data object.
          </p>
        </motion.div>
      </section>

      <section className="space-y-6">
        <motion.div {...fadeIn(0)} className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Why widgets
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
            A renderer built for the messy reality of model output — strict
            enough to trust, expressive enough to ship.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              {...fadeIn(index * 0.07)}
              className={`${cardClass} p-6`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {feature.body}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <motion.div {...fadeIn(0)} className={`${cardClass} p-6 md:p-8`}>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Quick start
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Install the package, import the stylesheet, and render a template
            with your data.
          </p>
          <div className="relative mt-5">
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 pr-14 font-mono text-[13px] leading-relaxed text-slate-100">
              <code>{quickStartCode}</code>
            </pre>
            <CopyButton text={quickStartCode} />
          </div>
        </motion.div>

        <motion.div {...fadeIn(0.07)} className={`${cardClass} p-4 md:p-5`}>
          <h3 className="px-3 pt-1 text-base font-semibold text-slate-900">
            Next steps
          </h3>
          <nav className="mt-2 flex flex-col" aria-label="Next steps">
            {nextSteps.map((step) => (
              <Link
                key={step.to}
                to={step.to}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {step.description}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
        </motion.div>
      </section>
    </div>
  );
}
