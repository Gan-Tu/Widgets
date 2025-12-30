import { motion } from "motion/react";
import React from "react";

import { WidgetRenderer } from "@/widget";

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
                  <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500">
                    {example.id}
                  </span>
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

                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-500">
                    View template + data
                  </summary>
                  <div className="mt-3 space-y-3">
                    <pre className="max-h-56 overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100">
{example.template}
                    </pre>
                    <pre className="max-h-56 overflow-auto rounded-xl bg-slate-100 p-3 text-[11px] text-slate-700">
{JSON.stringify(example.data, null, 2)}
                    </pre>
                  </div>
                </details>
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
