import {
    ArrowRight,
    Code2,
    LayoutGrid,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WidgetRenderer } from "@/widget";
import { z } from "zod";

const HeroSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
  tag: z.string()
});

const heroTemplate = `
<Card size="sm">
  <Col gap={2}>
    <Badge label={tag} color="info" />
    <Title value={title} size="lg" />
    <Text value={subtitle} size="sm" color="secondary" />
    <Button label="Learn more" variant="outline" />
  </Col>
</Card>
`.trim();

const heroData = {
  title: "WidgetRenderer",
  subtitle: "Render compact, schema-driven widgets inside any chat UI.",
  tag: "Schema-first"
};

export function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/55 p-8 shadow-sm backdrop-blur md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_12%_10%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(740px_420px_at_100%_24%,rgba(14,165,233,0.14),transparent_62%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-size-[44px_44px] opacity-[0.55] mask-[radial-gradient(ellipse_at_center,black_55%,transparent_72%)]"
        />

        <div className="relative grid gap-10 md:grid-cols-[1.12fr_0.88fr] md:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Schema-first widgets for conversational UIs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
            >
              A compact widget renderer that feels native to chat.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-[56ch] text-base leading-relaxed text-slate-600 md:text-lg"
            >
              Import <span className="font-semibold text-slate-800">WidgetRenderer</span>,
              pass a template + Zod schema + data, and ship polished widgets with
              predictable behavior and beautiful defaults.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button asChild className="gap-2 cursor-pointer" variant="default" size="lg">
                <Link to="/gallery">
                  View gallery <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="cursor-pointer" variant="outline" size="lg">
                <Link to="/playground">Open playground</Link>
              </Button>
              <Link
                to="/docs"
                className="cursor-pointer text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                Read docs
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
            >
              <span className="rounded-full bg-slate-900/5 px-3 py-1 font-semibold">
                10+ examples
              </span>
              <span className="rounded-full bg-slate-900/5 px-3 py-1 font-semibold">
                Tailwind v4 + shadcn
              </span>
              <span className="rounded-full bg-slate-900/5 px-3 py-1 font-semibold">
                Motion-ready
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-3 rounded-[28px] bg-linear-to-b from-white/70 to-white/0 blur-xl"
              />
              <div className="relative rounded-[28px] border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur">
                <WidgetRenderer template={heroTemplate} schema={HeroSchema} data={heroData} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Schema-driven",
            body: "Validate data with Zod so templates stay predictable and safe to render."
          },
          {
            icon: LayoutGrid,
            title: "Opinionated defaults",
            body: "Tuned spacing, radii, typography, and surfaces that look great in chat."
          },
          {
            icon: Code2,
            title: "Composable primitives",
            body: "Build compact flows using layout, list, content, and form components."
          }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + index * 0.03 }}
          >
            <Card className="h-full rounded-3xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-slate-900 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Quick start
              </h2>
              <p className="text-sm text-slate-600">
                Install the package, import styles, then render with template + schema + data.
              </p>
            </div>
            <span className="hidden rounded-full bg-slate-900/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
              60 seconds
            </span>
          </div>

          <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs leading-relaxed text-slate-100">
{`import "@tugan/widgets/styles.css";
import { WidgetRenderer } from "@tugan/widgets";
import WidgetSchema from "./schema";

export function WidgetMessage() {
  return (
    <WidgetRenderer
      template={templateString}
      schema={WidgetSchema}
      data={widgetData}
      onAction={(action) => console.log(action)}
    />
  );
}`}
          </pre>
        </Card>

        <Card className="rounded-3xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur">
          <h3 className="text-base font-semibold text-slate-900">Next steps</h3>
          <p className="mt-2 text-sm text-slate-600">
            Explore examples, inspect component docs, or iterate live.
          </p>
          <div className="mt-5 grid gap-2">
            <Button asChild className="justify-between cursor-pointer" variant="secondary">
              <Link to="/gallery">
                Gallery <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            </Button>
            <Button asChild className="justify-between cursor-pointer" variant="secondary">
              <Link to="/docs">
                Docs <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            </Button>
            <Button asChild className="justify-between cursor-pointer" variant="secondary">
              <Link to="/playground">
                Playground <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
