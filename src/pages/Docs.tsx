import React from "react";

import { componentDocs } from "@/docs/componentDocs";
import { componentExamples } from "@/docs/componentExamples";
import { WidgetRenderer } from "@/widget/WidgetRenderer";

const categories = Array.from(
  componentDocs.reduce((map, item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
    return map;
  }, new Map<string, typeof componentDocs>())
);

export function DocsPage() {
  const [activeId, setActiveId] = React.useState(componentDocs[0]?.id ?? "");

  const active = componentDocs.find((doc) => doc.id === activeId) ?? componentDocs[0];
  const example = active ? componentExamples[active.id] : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-24 h-fit space-y-6 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Components</h2>
          <p className="mt-1 text-xs text-slate-500">
            Widget UI components available in templates.
          </p>
        </div>
        {categories.map(([category, items]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                    activeId === item.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {active ? (
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-900">{active.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{active.description}</p>
          </div>

          {example ? (
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <WidgetRenderer
                  template={example.template}
                  schema={example.schema}
                  data={example.data}
                  theme={example.theme ?? "light"}
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Usage</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">
{active.usage}
            </pre>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Props</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[160px_1fr_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <span>Name</span>
                <span>Description</span>
                <span>Default</span>
              </div>
              {active.props.map((prop) => (
                <div
                  key={prop.name}
                  className="grid grid-cols-[160px_1fr_140px] gap-4 border-b border-slate-100 px-4 py-3 text-xs text-slate-600 last:border-b-0"
                >
                  <div>
                    <span className="rounded-md bg-slate-900/5 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                      {prop.name}
                    </span>
                    <div className="mt-1 text-[11px] text-slate-400">{prop.type}</div>
                  </div>
                  <div className="text-sm text-slate-600">{prop.description}</div>
                  <div className="text-xs text-slate-500">
                    {prop.default ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
