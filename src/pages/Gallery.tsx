import { Download, Search, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import React from "react";
import { Link } from "react-router-dom";

import { WidgetRenderer } from "@/widget";

import type { WidgetCategory, WidgetExample } from "@/examples/widgetExamples";
import type { ActionConfig } from "@/widget";

type CategoryFilter = WidgetCategory | "All";

type ExamplesCatalog = {
  examples: WidgetExample[];
  categories: WidgetCategory[];
};

type ToastState = {
  id: number;
  type: string;
  payload: string | null;
};

const MODULE_SKELETON_COUNT = 9;
const MAX_PAYLOAD_LENGTH = 140;
const TOAST_DURATION_MS = 4000;

/**
 * Masonry via measured grid row spans: the container uses tiny fixed rows
 * (4px) and each card spans exactly its own height, so grid auto-placement
 * drops every card into the shortest column — no tall neighbor can strand a
 * short card above a column of empty space. Source order and column widths
 * are preserved, and wide entries can still span two columns.
 */
const MASONRY_ROW_PX = 4;
const MASONRY_GAP_PX = 20;

const masonryContainerClass =
  "grid grid-cols-1 gap-x-5 md:grid-cols-2 xl:grid-cols-3";
const masonryContainerStyle: React.CSSProperties = {
  gridAutoRows: `${MASONRY_ROW_PX}px`,
  // Dense packing backfills the holes that 2-column cards create: a wide card
  // has to start below BOTH columns it spans, and without dense placement the
  // cards that follow it can never move up into the space that leaves behind.
  gridAutoFlow: "dense"
};

// Matches the pre-mount card box (header + LazyMount placeholder) so the
// initial span is already correct and mounting doesn't reshuffle the grid.
const MASONRY_ESTIMATED_HEIGHT = 290;
const MASONRY_INITIAL_SPAN = Math.ceil(
  (MASONRY_ESTIMATED_HEIGHT + MASONRY_GAP_PX) / MASONRY_ROW_PX
);

// Span updates write styles directly (no React state): one shared observer,
// zero re-renders, and the dense grid re-packs only when a height truly changes.
function applyMasonrySpan(node: HTMLElement) {
  const height = node.getBoundingClientRect().height;
  if (height <= 0) return;
  const span = Math.max(1, Math.ceil((height + MASONRY_GAP_PX) / MASONRY_ROW_PX));
  const wrapper = node.parentElement;
  if (wrapper && wrapper.style.gridRowEnd !== `span ${span}`) {
    wrapper.style.gridRowEnd = `span ${span}`;
  }
}

const masonryObserver =
  typeof ResizeObserver === "undefined"
    ? null
    : new ResizeObserver((entries) => {
        for (const entry of entries) applyMasonrySpan(entry.target as HTMLElement);
      });

function MasonryItem({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    applyMasonrySpan(node);
    masonryObserver?.observe(node);
    return () => masonryObserver?.unobserve(node);
  }, []);

  return (
    <div
      className={wide ? "min-w-0 md:col-span-2" : "min-w-0"}
      style={{ gridRowEnd: `span ${MASONRY_INITIAL_SPAN}` }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

function formatPayload(payload: Record<string, unknown> | undefined): string | null {
  if (!payload || Object.keys(payload).length === 0) return null;
  let text: string;
  try {
    text = JSON.stringify(payload);
  } catch {
    return null;
  }
  if (typeof text !== "string") return null;
  return text.length > MAX_PAYLOAD_LENGTH
    ? `${text.slice(0, MAX_PAYLOAD_LENGTH)}…`
    : text;
}

/** Mounts children only once the container is near the viewport (400px margin). */
function LazyMount({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (mounted) return;
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div ref={containerRef} className={className}>
      {mounted ? (
        children
      ) : (
        <div
          // Sized so header + placeholder ≈ MASONRY_ESTIMATED_HEIGHT and the
          // pre-mount card doesn't move when the skeleton appears.
          className="h-[194px] w-full animate-pulse rounded-xl bg-slate-100"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
      <div className="mt-5 h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

export function GalleryPage() {
  const [catalog, setCatalog] = React.useState<ExamplesCatalog | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>("All");
  const [query, setQuery] = React.useState("");
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const toastIdRef = React.useRef(0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const module = await import("@/examples/widgetExamples");
        if (!cancelled) {
          setCatalog({
            examples: module.widgetExamples,
            categories: module.widgetCategories
          });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load widget examples"
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAction = React.useCallback((action: ActionConfig) => {
    toastIdRef.current += 1;
    setToast({
      id: toastIdRef.current,
      type: action.type || "action",
      payload: formatPayload(action.payload)
    });
  }, []);

  const filters = React.useMemo<CategoryFilter[]>(
    () => ["All", ...(catalog?.categories ?? [])],
    [catalog]
  );

  const filtered = React.useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.examples.filter((example) => {
      const matchesCategory =
        activeCategory === "All"
          ? true
          : activeCategory === "Featured"
            ? example.category === "Featured" || example.featured === true
            : example.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        example.title.toLowerCase().includes(q) ||
        example.description.toLowerCase().includes(q)
      );
    });
  }, [catalog, activeCategory, query]);

  const hasActiveFilters = activeCategory !== "All" || query.trim().length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Gallery
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {catalog
                ? `${catalog.examples.length} widgets, all rendered from templates`
                : "Loading widget examples…"}
            </p>
          </div>
          <a
            href="/WIDGET_EXAMPLES.md"
            download
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            title="Every gallery widget as template + data — a companion corpus to AGENTS.md for LLM context"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            All examples for LLMs (.md)
          </a>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {catalog
              ? filters.map((filter) => {
                  const active = filter === activeCategory;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveCategory(filter)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })
              : Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={`chip-skeleton-${index}`}
                    className="h-9 w-20 animate-pulse rounded-full bg-slate-100"
                  />
                ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search widgets…"
              aria-label="Search widgets by title or description"
              className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {loadError}
        </div>
      ) : !catalog ? (
        <div className={masonryContainerClass} style={masonryContainerStyle}>
          {Array.from({ length: MODULE_SKELETON_COUNT }, (_, index) => (
            <MasonryItem key={`card-skeleton-${index}`}>
              <CardSkeleton />
            </MasonryItem>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-900">No widgets match</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search or category.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("All");
                setQuery("");
              }}
              className="mt-4 cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className={masonryContainerClass} style={masonryContainerStyle}>
          {filtered.map((example, index) => {
            const delay =
              reducedMotion || index >= 12 ? 0 : Math.min(index * 0.02, 0.2);
            return (
              <MasonryItem key={example.id} wide={example.size === "lg"}>
                <motion.article
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay }}
                  className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
                >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {example.featured ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
                          title="Featured"
                        />
                      ) : null}
                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {example.title}
                      </h2>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {example.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {example.category}
                    </span>
                    <Link
                      to={`/playground?example=${encodeURIComponent(example.id)}`}
                      className="whitespace-nowrap text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                      Try it →
                    </Link>
                  </div>
                </div>

                <LazyMount className="flex min-w-0 justify-center overflow-x-auto p-5">
                  {example.theme === "dark" ? (
                    <div className="flex w-full min-w-0 justify-center rounded-xl bg-[#0c101a] p-5">
                      <WidgetRenderer
                        template={example.template}
                        schema={example.schema}
                        data={example.data}
                        theme="dark"
                        onAction={handleAction}
                      />
                    </div>
                  ) : (
                    <WidgetRenderer
                      template={example.template}
                      schema={example.schema}
                      data={example.data}
                      theme="light"
                      onAction={handleAction}
                    />
                  )}
                </LazyMount>
                </motion.article>
              </MasonryItem>
            );
          })}
        </div>
      )}

      {toast ? (
        <motion.div
          key={toast.id}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-white shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{toast.type}</p>
              {toast.payload ? (
                <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-slate-300">
                  {toast.payload}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="shrink-0 cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
