import { ArrowUpRight, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";

import { CategoryRail, type CategoryFilter } from "@/components/gallery/CategoryRail";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { MasonryItem, masonryContainerClass, masonryContainerStyle, resetMasonryLayout } from "@/components/gallery/Masonry";
import { compareFeaturedWidgetExamples, isFeaturedWidgetExample } from "@/examples/featuredExamples";
import type { WidgetCategory, WidgetExample } from "@/examples/widgetExamples";
import type { ActionConfig } from "@/widget";
import "./gallery.css";

type ExamplesCatalog = { examples: WidgetExample[]; categories: WidgetCategory[] };
type ToastState = { id: number; type: string; payload: string | null };
const DEFAULT_CATEGORY: CategoryFilter = "Featured";

function formatPayload(payload: Record<string, unknown> | undefined) {
  if (!payload || Object.keys(payload).length === 0) return null;
  try {
    const text = JSON.stringify(payload);
    return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  } catch { return null; }
}

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = React.useState<ExamplesCatalog | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const toastIdRef = React.useRef(0);
  const reducedMotion = useReducedMotion();
  const requestedCategory = searchParams.get("category") ?? DEFAULT_CATEGORY;
  const activeCategory: CategoryFilter = requestedCategory === "All"
    ? "All"
    : catalog?.categories.includes(requestedCategory as WidgetCategory)
      ? requestedCategory as WidgetCategory : DEFAULT_CATEGORY;
  const query = searchParams.get("q") ?? "";
  const deferredQuery = React.useDeferredValue(query);

  React.useEffect(() => {
    let cancelled = false;
    import("@/examples/widgetExamples").then((module) => {
      if (!cancelled) setCatalog({ examples: module.widgetExamples, categories: module.widgetCategories });
    }).catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : "Failed to load widget examples");
    });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAction = React.useCallback((action: ActionConfig) => {
    setToast({ id: ++toastIdRef.current, type: action.type || "Action received", payload: formatPayload(action.payload) });
  }, []);

  const updateFilter = (key: string, value: string, replace = false) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      if (!value || (key === "category" && value === DEFAULT_CATEGORY)) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace });
  };

  const counts = React.useMemo(() => {
    const result: Record<string, number> = { All: catalog?.examples.length ?? 0, Featured: 0 };
    for (const example of catalog?.examples ?? []) {
      if (example.category !== "Featured") result[example.category] = (result[example.category] ?? 0) + 1;
      if (isFeaturedWidgetExample(example)) result.Featured += 1;
    }
    return result;
  }, [catalog]);

  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const matches = (catalog?.examples ?? []).filter((example) => {
      const categoryMatches = activeCategory === "All" || (activeCategory === "Featured"
        ? isFeaturedWidgetExample(example) : example.category === activeCategory);
      return categoryMatches && (!q || `${example.title} ${example.description} ${example.category}`.toLowerCase().includes(q));
    });
    return activeCategory === "Featured" ? matches.sort(compareFeaturedWidgetExamples) : matches;
  }, [catalog, activeCategory, deferredQuery]);

  const gridRef = React.useRef<HTMLDivElement | null>(null);
  React.useLayoutEffect(() => resetMasonryLayout(gridRef.current), [filtered]);

  return (
    <div className="gallery-page">
      <header className="gallery-heading">
        <div>
          <h1>The gallery.</h1>
          <p>Small interfaces. Endless possibilities.</p>
        </div>
        <Link to="/playground" className="studio-button studio-button--primary">
          Open playground <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden />
        </Link>
      </header>
      <div className="gallery-layout">
        <CategoryRail
          categories={["All", ...(catalog?.categories ?? [])]}
          active={activeCategory}
          counts={counts}
          onSelect={(category) => updateFilter("category", category)}
        />
        <section className="gallery-collection" aria-label="Widget collection" aria-busy={!catalog || query !== deferredQuery}>
          <div className="gallery-toolbar">
            <div className="gallery-search">
              <Search size={16} strokeWidth={1.5} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => updateFilter("q", event.target.value, true)}
                placeholder="Search widgets…"
                aria-label="Search widgets by title or description"
              />
              {query ? <button type="button" onClick={() => updateFilter("q", "", true)} aria-label="Clear search"><X size={14} /></button> : null}
            </div>
            <p role="status" aria-live="polite">{catalog ? `${filtered.length} widget${filtered.length === 1 ? "" : "s"}` : "Loading…"}</p>
          </div>
          {loadError ? (
            <div className="gallery-empty" role="alert"><h2>Unable to load the gallery</h2><p>{loadError}</p></div>
          ) : !catalog ? (
            <div className="gallery-grid gallery-skeletons" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="gallery-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="gallery-empty">
              <Search size={28} strokeWidth={1} aria-hidden />
              <h2>No widgets found</h2>
              <p>Try another search or explore a different category.</p>
              <button type="button" className="studio-button" onClick={() => setSearchParams({})}>Clear filters</button>
            </div>
          ) : (
            <div ref={gridRef} className={masonryContainerClass} style={masonryContainerStyle}>
              {filtered.map((example, index) => (
                <MasonryItem key={example.id} wide={example.size === "lg"}>
                  <GalleryCard example={example} index={index} onAction={handleAction} />
                </MasonryItem>
              ))}
            </div>
          )}
        </section>
      </div>
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            role="status"
            className="gallery-toast"
          >
            <div><p>{toast.type}</p>{toast.payload ? <code>{toast.payload}</code> : null}</div>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
