import { Suspense, lazy } from "react";
import { Github } from "lucide-react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `ff-mono flex min-h-10 cursor-pointer items-center justify-center border-b px-1 pb-1 pt-2 text-center text-[11px] uppercase tracking-[0.1em] transition-colors sm:min-h-0 sm:px-0 ${
    isActive
      ? "border-[var(--ink)] text-[var(--ink)]"
      : "border-transparent text-[var(--mid)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
  }`;

const metaLinkClass =
  "ff-mono inline-flex min-h-10 cursor-pointer items-center text-[11px] uppercase tracking-[0.1em] text-[var(--mid)] transition-colors hover:text-[var(--ink)] sm:min-h-0";

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
  const { pathname } = useLocation();
  // Browsing-heavy pages get the wider container. Exact-segment match so
  // unknown routes like /gallery-foo (404) keep the standard width.
  const isWideRoute = pathname === "/gallery" || pathname.startsWith("/gallery/");
  // Header/main/footer share the width so band edges align within a page.
  const containerClass = isWideRoute
    ? "app-container app-container--wide"
    : "app-container";

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 w-full border-b border-[var(--hairline)] bg-[var(--paper)]/85 backdrop-blur">
        <div
          className={`${containerClass} flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5 sm:gap-x-8`}
        >
          <NavLink
            to="/"
            className="flex min-h-10 cursor-pointer flex-col justify-center transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] sm:min-h-0"
            aria-label="Widgets — go to home"
          >
            <span className="ff-display text-[16px] font-bold leading-none tracking-[0.04em] text-[var(--ink)] [font-stretch:125%]">
              Widgets
            </span>
            <span className="ff-mono mt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--mid)]">
              Generative UI kit
            </span>
          </NavLink>

          <nav
            aria-label="Primary"
            className="order-3 w-full sm:order-none sm:w-auto"
          >
            <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-7">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/gallery" className={navLinkClass}>
                Gallery
              </NavLink>
              <NavLink to="/docs" className={navLinkClass}>
                Docs
              </NavLink>
              <NavLink to="/playground" className={navLinkClass}>
                Playground
              </NavLink>
            </div>
          </nav>

          <div className="flex items-center gap-5">
            <a
              href="/AGENTS.md"
              download="AGENTS.md"
              className={metaLinkClass}
              title="Download AGENTS.md — the widget spec for coding agents"
            >
              Agents.md&nbsp;↓
            </a>
            <a
              href="/WIDGET_EXAMPLES.md"
              download
              className={metaLinkClass}
              title="Download every gallery widget as template + data — a companion corpus to AGENTS.md for LLM context"
            >
              Examples.md&nbsp;↓
            </a>
            <a
              href="https://github.com/Gan-Tu/Widgets"
              target="_blank"
              rel="noreferrer"
              className={`${metaLinkClass} gap-1.5`}
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              GitHub&nbsp;↗
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-10">
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

      <footer className="mt-6 border-t border-[var(--ink)] py-8">
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
  );
}
