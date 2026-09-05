import { Suspense, lazy, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { WidgetAppearanceProvider } from "@/widget/theme";
import type { WidgetAppearance } from "@/widget/types";

const APPEARANCE_STORAGE_KEY = "widgets:appearance";

function readAppearance(): WidgetAppearance {
  try {
    return window.localStorage.getItem(APPEARANCE_STORAGE_KEY) === "glass" ? "glass" : "default";
  } catch {
    return "default";
  }
}

const HomePage = lazy(() =>
  import("@/pages/Home").then((mod) => ({ default: mod.HomePage }))
);
const DocsPage = lazy(() =>
  import("@/pages/Docs").then((mod) => ({ default: mod.DocsPage }))
);
const GalleryPage = lazy(() =>
  import("@/pages/Gallery").then((mod) => ({ default: mod.GalleryPage }))
);
const PlaygroundPage = lazy(() =>
  import("@/pages/Playground").then((mod) => ({ default: mod.PlaygroundPage }))
);

function RouteFallback() {
  return (
    <div
      className="mx-auto flex max-w-sm flex-col gap-3 py-24"
      role="status"
      aria-label="Loading page"
    >
      <div className="h-3 w-2/3 animate-pulse bg-[var(--hairline)]" />
      <div className="h-3 w-full animate-pulse bg-[var(--hairline)]" />
      <div className="h-3 w-4/5 animate-pulse bg-[var(--hairline)]" />
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md py-24 text-center">
      <p className="ff-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
        404
      </p>
      <h1 className="ff-display mt-4 text-3xl font-semibold text-[var(--ink)]">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--mid)]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        to="/"
        className="ff-mono mt-8 inline-flex h-11 cursor-pointer items-center rounded-[2px] border border-[var(--ink)] px-6 text-xs uppercase tracking-[0.12em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
      >
        Back to home
      </Link>
    </section>
  );
}

export default function App() {
  const [appearance, setAppearance] = useState<WidgetAppearance>(readAppearance);
  const changeAppearance = (next: WidgetAppearance) => {
    setAppearance(next);
    try { window.localStorage.setItem(APPEARANCE_STORAGE_KEY, next); } catch { /* Session-only when storage is unavailable. */ }
  };
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  // Browsing-heavy pages get the wider container. Exact-segment match so
  // unknown routes like /gallery-foo (404) keep the standard width.
  const isWideRoute = pathname === "/gallery" || pathname.startsWith("/gallery/");
  // Header/main/footer share the width so band edges align within a page.
  const containerClass = isWideRoute
    ? "app-container app-container--wide"
    : "app-container";

  return (
    <WidgetAppearanceProvider appearance={appearance}>
    <div className="app-shell" data-appearance={appearance}>
      <a className="studio-skip-link" href="#main-content">Skip to content</a>
      <SiteHeader containerClass={containerClass} appearance={appearance} onAppearanceChange={changeAppearance} />

      <main id="main-content" className="flex-1 py-5 sm:py-8 md:py-10">
        <div className={containerClass}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <footer className="mt-12 border-t border-[var(--hairline)] py-8">
        <div
          className={`${containerClass} ff-mono flex flex-wrap justify-between gap-x-14 gap-y-5 text-[10.5px] uppercase leading-[2] tracking-[0.12em] text-[var(--mid)]`}
        >
          <p>
            <span className="font-semibold text-[var(--ink)]">
              Widgets — generative UI kit
            </span>
            <br />
            Built by{" "}
            <a
              href="https://github.com/Gan-Tu"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--ink)] transition-colors hover:text-[var(--mid)]"
            >
              Gan Tu
            </a>{" "}
            · Apache-2.0
          </p>
          <p>
            React · Tailwind v4 · Motion
            <br />
            Set in Archivo &amp; Fragment Mono
          </p>
          <p>
            <a
              href="https://github.com/Gan-Tu/Widgets"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[var(--ink)]"
            >
              GitHub ↗
            </a>
            <br />
            <a
              href="/AGENTS.md"
              download="AGENTS.md"
              className="transition-colors hover:text-[var(--ink)]"
            >
              Agents.md ↓
            </a>
            <br />
            <a
              href="/WIDGET_EXAMPLES.md"
              download
              className="transition-colors hover:text-[var(--ink)]"
            >
              Examples.md ↓
            </a>
          </p>
        </div>
      </footer>
    </div>
    </WidgetAppearanceProvider>
  );
}
