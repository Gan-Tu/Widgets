import { Suspense, lazy, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

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
  `cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white/80"
  }`;

export default function App() {
  useEffect(() => {
    document.title = "Widgets Kit";
  }, []);

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/60 py-4 backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-2xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Go to home"
          >
            <img
              src="/logo.png"
              alt="Widget Renderer Logo"
              className="h-10 w-10 rounded-2xl"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Widget Renderer
              </p>
              <p className="text-xs text-slate-500">
                LLM compatible UI primitives by Gan
              </p>
            </div>
          </NavLink>
          <nav className="flex items-center gap-2 rounded-full bg-white/70 p-1 shadow-sm">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/docs" className={navLinkClass}>
              Docs
            </NavLink>
            <NavLink to="/gallery" className={navLinkClass}>
              Gallery
            </NavLink>
            <NavLink to="/playground" className={navLinkClass}>
              Playground
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="app-container">
          <Suspense
            fallback={
              <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-900/10" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-900/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-900/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-900/10" />
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      <footer className="border-t border-white/60 bg-white/70 py-6 text-xs text-slate-500">
        <div className="app-container flex flex-wrap items-center justify-center gap-2 text-center">
          <span>Built with React, Tailwind v4, shadcn, and Framer Motion.</span>
          <span aria-hidden>·</span>
          <a
            className="inline-flex items-center gap-1 font-normal text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-400 cursor-pointer"
            href="https://github.com/Gan-Tu/Widgets"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub (Gan-Tu/Widgets)"
          >
            <img
              src="https://github.githubassets.com/favicons/favicon.svg"
              alt=""
              className="h-3.5 w-3.5"
              loading="lazy"
              decoding="async"
            />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
