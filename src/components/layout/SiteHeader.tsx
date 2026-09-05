import { Download, Github } from "lucide-react";
import { NavLink } from "react-router-dom";

export function SiteHeader({ containerClass }: { containerClass: string }) {
  return (
    <header className="studio-header sticky top-0 z-50">
      <div className={`${containerClass} grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-3 sm:flex sm:justify-between sm:gap-8 sm:py-3.5`}>
        <NavLink to="/" className="studio-brand" aria-label="Widgets — go to home">
          <span className="studio-brand-mark" aria-hidden><i /><i /><i /><i /></span>
          <span>Widgets</span>
        </NavLink>
        <nav aria-label="Primary" className="order-3 col-span-2 w-full sm:order-none sm:w-auto">
          <div className="grid grid-cols-4 gap-1 sm:flex sm:gap-7">
            <NavLink to="/" end className="studio-nav-link">Home</NavLink>
            <NavLink to="/gallery" className="studio-nav-link">Gallery</NavLink>
            <NavLink to="/docs" className="studio-nav-link">Docs</NavLink>
            <NavLink to="/playground" className="studio-nav-link">Playground</NavLink>
          </div>
        </nav>
        <div className="flex min-w-0 items-center justify-end gap-3 md:gap-6">
          <a href="/AGENTS.md" download className="studio-meta-link" title="Download the widget authoring specification">
            <Download size={14} strokeWidth={1.5} aria-hidden /><span>Spec</span>
          </a>
          <a href="/FEATURED_WIDGET_EXAMPLES.md" download className="studio-meta-link" title="Download featured widget templates and data">
            <Download size={14} strokeWidth={1.5} aria-hidden /><span className="hidden md:inline">Examples</span><span className="sr-only md:hidden">Examples</span>
          </a>
          <a href="https://github.com/Gan-Tu/Widgets" target="_blank" rel="noreferrer" className="studio-meta-link" aria-label="GitHub repository">
            <Github size={19} strokeWidth={1.6} aria-hidden />
          </a>
        </div>
      </div>
    </header>
  );
}
