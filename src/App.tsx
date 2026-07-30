import { Suspense, lazy } from "react";
import { Compass, Download, Github } from "lucide-react";
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
  `cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

function RouteFallback() {
  return (
    <div
      className="mx-auto flex max-w-sm flex-col gap-3 py-24"
      role="status"
      aria-label="Loading page"
    >
      <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-200" />
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Compass className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Back to Home
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div
          className={`${containerClass} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}
        >
          <NavLink
            to="/"
            className="flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Widgets — go to home"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-8 rounded-lg"
              width={32}
              height={32}
            />
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-slate-900">
                Widgets
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Generative UI kit
              </span>
            </span>
          </NavLink>

          <nav
            aria-label="Primary"
            className="order-3 w-full sm:order-none sm:w-auto"
          >
            <div className="flex flex-wrap items-center justify-center gap-1">
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

          <div className="flex items-center gap-1">
            <a
              href="/AGENTS.md"
              download="AGENTS.md"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Download AGENTS.md — the widget spec for coding agents"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              AGENTS.md
            </a>
            <a
              href="https://github.com/Gan-Tu/Widgets"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Github className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 md:py-12">
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

      <footer className="border-t border-slate-200/60 py-8">
        <div
          className={`${containerClass} flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500`}
        >
          <p>
            Built by{" "}
            <a
              href="https://github.com/Gan-Tu"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              Gan Tu
            </a>{" "}
            with React, Tailwind CSS v4, shadcn/ui, and Motion.
          </p>
          <a
            href="https://github.com/Gan-Tu/Widgets"
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
