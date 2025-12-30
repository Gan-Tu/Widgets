import { Menu, Play } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { componentDocs } from "@/docs/componentDocs";
import { componentExamples, iconGalleryExample } from "@/docs/componentExamples";
import { getAllowedVariants } from "@/docs/typeVariants";
import { WidgetRenderer } from "@/widget/WidgetRenderer";

const categories = Array.from(
  componentDocs.reduce((map, item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
    return map;
  }, new Map<string, typeof componentDocs>())
);

const rechartsDocsById: Record<string, string> = {
  Chart: "https://recharts.org/en-US/api/ComposedChart",
  BarChart: "https://recharts.org/en-US/api/BarChart",
  LineChart: "https://recharts.org/en-US/api/LineChart",
  AreaChart: "https://recharts.org/en-US/api/AreaChart",
  PieChart: "https://recharts.org/en-US/api/PieChart"
};

export function DocsPage() {
  const [activeId, setActiveId] = React.useState(componentDocs[0]?.id ?? "");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const active = componentDocs.find((doc) => doc.id === activeId) ?? componentDocs[0];
  const example = active ? componentExamples[active.id] : undefined;
  const rechartsDocs = active ? rechartsDocsById[active.id] : undefined;

  const sidebarContent = (
    <div className="space-y-6">
      <div className="space-y-1">
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
                onClick={() => {
                  setActiveId(item.id);
                  setMobileNavOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition cursor-pointer ${
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
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Mobile navigation: avoids sticky/transparent overlap on small screens */}
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm lg:hidden">
        <div>
          <div className="text-sm font-semibold text-slate-900">Docs</div>
          <div className="text-xs text-slate-500">{active?.name ?? "Components"}</div>
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-2 border-slate-200 bg-white/80 text-slate-800 hover:bg-white"
              aria-label="Open components menu"
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="border-b border-slate-200 p-5">
              <SheetTitle>Components</SheetTitle>
            </SheetHeader>
            <div className="max-h-[calc(100vh-72px)] overflow-y-auto p-5">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop navigation */}
      <aside className="sticky top-24 hidden h-fit rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm lg:block">
        {sidebarContent}
      </aside>

      {active ? (
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">{active.name}</h1>
                <p className="mt-2 text-sm text-slate-600">{active.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {rechartsDocs ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-2 border-slate-200 bg-white/80 text-slate-800 hover:bg-white"
                  >
                    <a
                      className="cursor-pointer"
                      href={rechartsDocs}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open Recharts documentation"
                    >
                      Open Recharts docs
                    </a>
                  </Button>
                ) : null}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-2 border-slate-200 bg-white/80 text-slate-800 hover:bg-white"
                >
                  <Link
                    className="cursor-pointer"
                    to={`/playground?component=${encodeURIComponent(active.id)}`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Try it
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {example ? (
            <div className="flex flex-wrap justify-center gap-4">
              <WidgetRenderer
                template={example.template}
                schema={example.schema}
                data={example.data}
                theme={example.theme ?? "light"}
              />
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
              {active.props.map((prop) => {
                const allowed = getAllowedVariants(prop.type);
                return (
                  <div
                    key={prop.name}
                    className="grid grid-cols-[160px_1fr_140px] gap-4 border-b border-slate-100 px-4 py-3 text-xs text-slate-600 last:border-b-0"
                  >
                    <div>
                      <span className="rounded-md bg-slate-900/5 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                        {prop.name}
                      </span>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {prop.type}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div>{prop.description}</div>
                      {allowed ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {allowed.map((value) => (
                            <span
                              key={value}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500">
                      {prop.default ?? "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {active.id === "Icon" ? (
            <div className="mt-2">
              <div className="text-sm font-semibold text-slate-900">
                Icon library
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Browse all available icon names.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <WidgetRenderer
                  template={iconGalleryExample.template}
                  schema={iconGalleryExample.schema}
                  data={iconGalleryExample.data}
                  theme={iconGalleryExample.theme ?? "light"}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
