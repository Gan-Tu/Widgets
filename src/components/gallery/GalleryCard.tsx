import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

import type { WidgetExample } from "@/examples/widgetExamples";
import { WidgetRenderer, type ActionConfig } from "@/widget";
import { LazyMount } from "./LazyMount";

export function GalleryCard({ example, index, onAction }: {
  example: WidgetExample;
  index: number;
  onAction: (action: ActionConfig) => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className="gallery-card"
      aria-labelledby={`example-${example.id}`}
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index < 9 ? index * 0.035 : 0 }}
    >
      <LazyMount className={`gallery-canvas${example.theme === "dark" ? " gallery-canvas--dark" : ""}`}>
        <WidgetRenderer
          template={example.template}
          schema={example.schema}
          data={example.data}
          theme={example.theme ?? "light"}
          onAction={onAction}
        />
      </LazyMount>
      <div className="gallery-caption">
        <div className="min-w-0">
          <h2 id={`example-${example.id}`}>{example.title}</h2>
          <p>{example.description}</p>
        </div>
        <Link
          className="gallery-open"
          to={`/playground?example=${encodeURIComponent(example.id)}`}
          aria-label={`Open ${example.title} in playground`}
          title="Open in playground"
        >
          <ArrowUpRight size={19} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
