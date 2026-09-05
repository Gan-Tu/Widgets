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

  const sidebarSearch = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search components"
        aria-label="Search components"
        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-sm text-[var(--ink)] placeholder:text-stone-500 focus:border-stone-400 focus:outline-none"
      />
    </div>
  );

  const sidebarContent = (
    <nav aria-label="Component documentation" className="flex flex-col gap-6">
      {filteredCategories.length === 0 ? (
        <p className="text-sm text-stone-500">No components match “{query.trim()}”.</p>
      ) : null}

      {filteredCategories.map(([category, items]) => (
        <div key={category} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            {category}
          </p>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectComponent(item.id)}
                aria-current={activeId === item.id ? "page" : undefined}
                className={`docs-component-link w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                  activeId === item.id
                    ? "bg-[#eeeef0] text-[var(--ink)]"
                    : "text-[var(--mid)] hover:bg-slate-100"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="docs-page grid gap-8 lg:h-[calc(100svh-9rem)] lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:overflow-hidden">
      {/* Mobile navigation: avoids sticky/transparent overlap on small screens */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] pb-4 lg:hidden">
        <div>
          <div className="text-sm font-semibold text-[var(--ink)]">Docs</div>
          <div className="text-xs text-stone-500">{active?.name ?? "Components"}</div>
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
          <SheetContent side="left" className="flex flex-col overflow-hidden p-0">
            <SheetHeader className="border-b border-slate-200 p-5">
              <SheetTitle>Components</SheetTitle>
              <SheetDescription>
                Choose a component to view its example, usage, and props.
              </SheetDescription>
            </SheetHeader>
            <div className="shrink-0 px-5 py-4">{sidebarSearch}</div>
            <div className="docs-scroll-area min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop navigation */}
      <aside className="hidden min-h-0 min-w-0 border-r border-[var(--hairline)] pr-4 lg:flex lg:h-full lg:flex-col">
        <div className="shrink-0 px-1 pb-5">
          <h2 className="text-sm font-semibold text-slate-700">Components</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">Widget UI components available in templates.</p>
          <div className="mt-3">{sidebarSearch}</div>
        </div>
        <div className="docs-scroll-area min-h-0 flex-1 overflow-y-auto p-1">
          {sidebarContent}
        </div>
      </aside>

      {active ? (
        <section ref={contentRef} className="docs-scroll-area min-w-0 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-3">
          <div className="border-b border-[var(--hairline)] pb-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[40px] font-medium tracking-[-0.045em] text-[var(--ink)]">{active.name}</h1>
                <p className="mt-2 text-sm text-[var(--mid)]">{active.description}</p>
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
                  className="cursor-pointer gap-2 border-[var(--hairline)] bg-white text-[var(--ink)] hover:bg-[var(--plinth)]"
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
              <div className="docs-preview flex flex-wrap justify-center gap-4">
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

              <details key={active.id} className="rounded-lg border border-[var(--hairline)] bg-white">
                <summary className="cursor-pointer select-none rounded-lg px-4 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-slate-50">
                  View template
                </summary>
                <div className="px-4 pb-4">
                  <pre className="overflow-x-auto rounded-xl bg-[#111114] p-4 text-xs leading-relaxed text-slate-100">
{example.template}
                  </pre>
                </div>
              </details>
            </>
          ) : null}

          {showUsage ? (
            <div className="border-b border-[var(--hairline)] pb-7">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Usage</h2>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-[#111114] p-4 text-xs leading-relaxed text-slate-100">
{active.usage}
              </pre>
            </div>
          ) : null}

          <div className="border-b border-[var(--hairline)] pb-7">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Props</h2>
            <div className="mt-4 overflow-x-auto border-y border-[var(--hairline)]">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[160px_1fr_140px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-stone-500">
                  <span>Name</span>
                  <span>Description</span>
                  <span>Default</span>
                </div>
                {active.props.map((prop) => {
                  const allowed = getAllowedVariants(prop.type);
                  return (
                    <div
                      key={prop.name}
                      className="grid grid-cols-[160px_1fr_140px] gap-4 border-b border-slate-100 px-4 py-3 text-xs text-[var(--mid)] last:border-b-0"
                    >
                      <div>
                        <span className="rounded-md bg-[#111114]/5 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                          {prop.name}
                        </span>
                        <div className="mt-1 text-[11px] text-stone-500">
                          {prop.type}
                        </div>
                      </div>
                      <div className="text-sm text-[var(--mid)]">
                        <div>{prop.description}</div>
                        {allowed ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {allowed.map((value) => (
                              <span
                                key={value}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-[var(--mid)]"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-xs text-stone-500">
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
              <div className="text-sm font-semibold text-[var(--ink)]">
                Icon library
              </div>
              <p className="mt-1 text-xs text-stone-500">
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
