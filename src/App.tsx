import { NavLink, Route, Routes } from "react-router-dom";

import { HomePage } from "@/pages/Home";
import { ExamplesPage } from "@/pages/Examples";
import { PlaygroundPage } from "@/pages/Playground";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1 text-xs font-semibold transition ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-white/80"
  }`;

export default function App() {
  return (
    <div className="app-shell">
      <header className="border-b border-white/50 bg-white/60 py-4 backdrop-blur">
        <div className="app-container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              W
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Widget Renderer</p>
              <p className="text-xs text-slate-500">Chat-ready UI primitives</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 rounded-full bg-white/70 p-1 shadow-sm">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/examples" className={navLinkClass}>
              Examples
            </NavLink>
            <NavLink to="/playground" className={navLinkClass}>
              Playground
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
          </Routes>
        </div>
      </main>

      <footer className="border-t border-white/60 bg-white/70 py-6 text-center text-xs text-slate-500">
        Built with React, Tailwind v4, shadcn, and Motion.
      </footer>
    </div>
  );
}
