import React from "react";

/**
 * Masonry via measured grid row spans: the container uses tiny fixed rows
 * (4px) and each card spans exactly its own height, so grid auto-placement
 * drops every card into the shortest column — no tall neighbor can strand a
 * short card above a column of empty space. Source order and column widths
 * are preserved, and wide entries can still span two columns.
 */
const MASONRY_ROW_PX = 4;
const MASONRY_GAP_PX = 28;

export const masonryContainerClass =
  "gallery-grid";
export const masonryContainerStyle: React.CSSProperties = {
  gridAutoRows: `${MASONRY_ROW_PX}px`,
  // Dense packing backfills the holes that 2-column cards create: a wide card
  // has to start below BOTH columns it spans, and without dense placement the
  // cards that follow it can never move up into the space that leaves behind.
  gridAutoFlow: "dense"
};

// Matches the pre-mount canvas and caption so the
// initial span is already correct and mounting doesn't reshuffle the grid.
const MASONRY_ESTIMATED_HEIGHT = 420;
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

export function MasonryItem({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
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
      className={wide ? "gallery-item gallery-item--wide" : "gallery-item"}
      style={{ gridRowEnd: `span ${MASONRY_INITIAL_SPAN}` }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
