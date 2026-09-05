import { Download } from "lucide-react";
import type { WidgetCategory } from "@/examples/widgetExamples";

export type CategoryFilter = WidgetCategory | "All";

export function CategoryRail({ categories, active, counts, onSelect }: {
  categories: CategoryFilter[];
  active: CategoryFilter;
  counts: Record<string, number>;
  onSelect: (category: CategoryFilter) => void;
}) {
  return (
    <aside className="gallery-rail">
      <nav className="gallery-categories" aria-label="Widget categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-label={category === "All" ? "All widgets" : category}
            aria-pressed={active === category}
            onClick={() => onSelect(category)}
            className="gallery-category"
          >
            <span>{category === "All" ? "All widgets" : category}</span>
            <span className="gallery-category-count" aria-hidden>{counts[category] ?? 0}</span>
          </button>
        ))}
      </nav>
      <a className="gallery-download" href="/WIDGET_EXAMPLES.md" download>
        <Download size={14} strokeWidth={1.5} aria-hidden />
        Download examples
      </a>
    </aside>
  );
}
