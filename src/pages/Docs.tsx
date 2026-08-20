import { Menu, Play, Search } from "lucide-react";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { componentDocs } from "@/docs/componentDocs";
import { componentExamples, iconGalleryExample } from "@/docs/componentExamples";
import { getAllowedVariants } from "@/docs/typeVariants";
import { WidgetRenderer } from "@/widget/WidgetRenderer";

const CATEGORY_ORDER = [
  "Containers",
  "Layout",
  "Typography",
  "Content",
  "Agent status & reasoning",
  "Agent responses",
  "Agent tasks & tools",
  "Agent interfaces",
  "Agent workspaces",
  "Data display",
  "Charts",
  "Forms & controls",
  "Feedback",
  "Disclosure & overlays",
  "Media",
  "Control flow & state"
];

const categories = Array.from(
  componentDocs.reduce((map, item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
    return map;
  }, new Map<string, typeof componentDocs>())
).sort(([categoryA], [categoryB]) => {
  const indexA = CATEGORY_ORDER.indexOf(categoryA);
  const indexB = CATEGORY_ORDER.indexOf(categoryB);
  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  return indexA - indexB;
});

const rechartsDocsById: Record<string, string> = {
  Chart: "https://recharts.org/en-US/api/ComposedChart",
  BarChart: "https://recharts.org/en-US/api/BarChart",
  LineChart: "https://recharts.org/en-US/api/LineChart",
  AreaChart: "https://recharts.org/en-US/api/AreaChart",
  PieChart: "https://recharts.org/en-US/api/PieChart"
};

/** Whitespace-insensitive comparison so indentation differences don't count as drift. */
function stripWhitespace(value: string) {
  return value.replace(/\s+/g, "");
}

export function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const contentRef = React.useRef<HTMLElement | null>(null);

  const componentParam = searchParams.get("component");
  const activeId =
    componentParam && componentDocs.some((doc) => doc.id === componentParam)
      ? componentParam
      : componentDocs[0]?.id ?? "";

  const active = componentDocs.find((doc) => doc.id === activeId) ?? componentDocs[0];
  const example = active ? componentExamples[active.id] : undefined;
  const rechartsDocs = active ? rechartsDocsById[active.id] : undefined;

  // The live example template is the canonical snippet. Only show the
  // hand-written usage block when it demonstrates something the example
  // template doesn't already contain.
  const showUsage = Boolean(
    active?.usage &&
      (!example || !stripWhitespace(example.template).includes(stripWhitespace(active.usage)))
  );

  const selectComponent = React.useCallback(
    (id: string) => {
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        next.set("component", id);
        return next;
      });
      setMobileNavOpen(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
    },
    [setSearchParams]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categories
        .map(
          ([category, items]) =>
            [
              category,
              items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
            ] as const
        )
        .filter(([, items]) => items.length > 0)
    : categories;

  const sidebarContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Components</h2>
          <p className="mt-1 text-xs text-slate-500">
            Widget UI components available in templates.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <p className="text-sm text-slate-500">No components match “{query.trim()}”.</p>
      ) : null}

      {filteredCategories.map(([category, items]) => (
        <div key={category} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {category}
          </p>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectComponent(item.id)}
                className={`w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  activeId === item.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
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
    <div className="grid gap-8 lg:h-[calc(100svh-9rem)] lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:overflow-hidden">
      {/* Mobile navigation: avoids sticky/transparent overlap on small screens */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm lg:hidden">
        <div>
          <div className="text-sm font-semibold text-slate-900">Docs</div>
          <div className="text-xs text-slate-500">{active?.name ?? "Components"}</div>
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              aria-label="Open components menu"
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="border-b border-slate-200 p-5">
              <SheetTitle>Components</SheetTitle>
              <SheetDescription>
                Choose a component to view its example, usage, and props.
              </SheetDescription>
            </SheetHeader>
            <div className="max-h-[calc(100vh-72px)] overflow-y-auto p-5">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop navigation */}
      <aside className="hidden min-h-0 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:flex lg:h-full lg:flex-col">
        <div className="min-h-0 overflow-y-auto pr-1">
          {sidebarContent}
        </div>
      </aside>

      {active ? (
        <section ref={contentRef} className="min-w-0 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
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
                    className="cursor-pointer gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
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
                  className="cursor-pointer gap-2 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
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
            <>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Keyed so switching components remounts the whole widget tree —
                    otherwise component-local state (toggles, tabs, collapsed
                    cards) leaks between structurally similar examples. */}
                <WidgetRenderer
                  key={active.id}
                  template={example.template}
                  schema={example.schema}
                  data={example.data}
                  theme={example.theme ?? "light"}
                />
              </div>

              <details key={active.id} className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                <summary className="cursor-pointer select-none rounded-2xl px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  View template
                </summary>
                <div className="px-6 pb-6">
                  <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{example.template}
                  </pre>
                </div>
              </details>
            </>
          ) : null}

          {showUsage ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Usage</h2>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{active.usage}
              </pre>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Props</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <div className="min-w-[560px]">
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
