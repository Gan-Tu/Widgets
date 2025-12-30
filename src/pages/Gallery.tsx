import { motion } from "motion/react";
import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

import { WidgetRenderer } from "@/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ZodTypeAny } from "zod";

type WidgetExample = {
  id: string;
  title: string;
  description: string;
  template: string;
  schema: ZodTypeAny;
  data: Record<string, unknown>;
  theme?: "light" | "dark";
};

export function GalleryPage() {
  const [examples, setExamples] = React.useState<WidgetExample[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    import("@/examples/widgetExamples")
      .then((mod) => {
        if (!cancelled) setExamples(mod.widgetExamples as WidgetExample[]);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load examples";
        if (!cancelled) setLoadError(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Widget gallery</h1>
        <p className="text-sm text-slate-600">
          Browse real widget templates rendered by the WidgetRenderer. Each example
          is driven by schema-validated data.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        {examples
          ? examples.map((example, index) => (
              <motion.section
                key={example.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {example.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {example.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase text-slate-600"
                    >
                      {example.id}
                    </Badge>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-2 border-slate-200 bg-white/80 text-slate-800 hover:bg-white"
                    >
                      <Link
                        className="cursor-pointer"
                        to={`/playground?example=${encodeURIComponent(example.id)}`}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Try it
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-5 flex justify-center">
                  <WidgetRenderer
                    template={example.template}
                    schema={example.schema}
                    data={example.data}
                    theme={example.theme ?? "light"}
                    onAction={(action) => {
                      console.info("Widget action", action);
                    }}
                  />
                </div>
              </motion.section>
            ))
          : Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`gallery-skeleton-${index}`}
                className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm"
              >
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-900/10" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-900/10" />
                <div className="mt-5 h-56 animate-pulse rounded-2xl bg-slate-900/5" />
              </div>
            ))}
      </div>
    </div>
  );
}
