import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
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
      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Compact widgets for conversational UIs
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-semibold text-slate-900 md:text-5xl"
          >
            Build expressive, schema-first widgets in minutes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Drop the WidgetRenderer into any React app, pass a schema + template,
            and get production-ready widgets that feel at home in chat.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild className="gap-2" variant="default">
              <Link to="/examples">
                Browse examples <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/playground">Open playground</Link>
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <WidgetRenderer
            template={heroTemplate}
            schema={HeroSchema}
            data={heroData}
          />
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Opinionated defaults",
            body: "Spacing, radii, typography, and colors are tuned to look great inside chat."
          },
          {
            title: "Schema-driven",
            body: "Validate data with Zod so templates stay predictable and safe."
          },
          {
            title: "Composable",
            body: "Use layout primitives, list views, and controls to build compact flows."
          }
        ].map((item) => (
          <Card key={item.title} className="border-none bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.body}</p>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl bg-white/80 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Quick start</h2>
        <p className="mt-2 text-sm text-slate-600">
          Import the WidgetRenderer, pass a template + schema + data, and you are live.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
{`import { WidgetRenderer } from "@/widget";
import WidgetSchema from "./schema";

<WidgetRenderer
  template={templateString}
  schema={WidgetSchema}
  data={widgetData}
  onAction={(action) => console.log(action)}
/>`}
        </pre>
      </section>
    </div>
  );
}
