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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              W
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Widget Renderer
              </p>
              <p className="text-xs text-slate-500">
                LLM compatible UI primitives by Gan
              </p>
            </div>
          </div>
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

      <footer className="border-t border-white/60 bg-white/70 py-6 text-center text-xs text-slate-500">
        Built with React, Tailwind v4, shadcn, and Motion.
      </footer>
    </div>
  );
}
