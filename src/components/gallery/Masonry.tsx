import React from "react";

/**
 * Masonry via measured grid row spans: the container uses tiny fixed rows
 * (4px) and each card spans exactly its own height, so grid auto-placement
 * drops every card into the shortest column — no tall neighbor can strand a
 * short card above a column of empty space. Source order and column widths
 * are preserved, and wide entries can still span two columns.
 *
 * Dense packing re-places every card whenever one changes height, so a card
 * that grows after its preview mounts (a tab, a replay) could land in another
 * column far down the page. When that happens the grid freezes: every mounted
 * card keeps the cell it occupies, and only the cards the grown one now
 * overlaps move down. A new column count or card set releases the freeze.
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

const grids = new WeakSet<HTMLElement>();
/** Column count each frozen grid was frozen at. */
const frozenGrids = new WeakMap<HTMLElement, number>();
/** Last span written for each card. */
const spans = new WeakMap<HTMLElement, number>();
/** Cards whose mounted preview has been sized once; later changes freeze the grid. */
const settled = new WeakSet<HTMLElement>();

const hasPreview = (item: Element) => item.querySelector(".gallery-preview-content") !== null;

function spanOf(item: HTMLElement) {
  const height = item.firstElementChild?.getBoundingClientRect().height ?? 0;
  return height > 0 ? Math.max(1, Math.ceil((height + MASONRY_GAP_PX) / MASONRY_ROW_PX)) : MASONRY_INITIAL_SPAN;
}

function columnTracks(grid: HTMLElement) {
  return getComputedStyle(grid).gridTemplateColumns.split(" ").map(parseFloat).filter(Number.isFinite);
}

// Pin every mounted card to the cell it occupies, then push down whatever the
// cards above it now overlap. Unmounted placeholders stay auto-placed.
function freezeMasonry(grid: HTMLElement) {
  const style = getComputedStyle(grid);
  const tracks = columnTracks(grid);
  const columns = Math.max(1, tracks.length);
  const gap = parseFloat(style.columnGap) || 0;
  const box = grid.getBoundingClientRect();
  const originX = box.left + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.borderLeftWidth) || 0);
  const originY = box.top + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.borderTopWidth) || 0);
  const lefts = tracks.map((_, index) => tracks.slice(0, index).reduce((sum, width) => sum + width + gap, 0));

  const cards = (Array.from(grid.children) as HTMLElement[]).filter(hasPreview).map((item) => {
    const rect = item.getBoundingClientRect();
    const width = item.classList.contains("gallery-item--wide") ? Math.min(2, columns) : 1;
    let column = 0;
    lefts.forEach((left, index) => {
      if (Math.abs(rect.left - originX - left) < Math.abs(rect.left - originX - lefts[column])) column = index;
    });
    return { item, width, column: Math.min(column, columns - width), row: Math.max(0, Math.round((rect.top - originY) / MASONRY_ROW_PX)), span: spanOf(item) };
  });
  cards.sort((a, b) => a.row - b.row || a.column - b.column);

  const bottoms = new Array<number>(columns).fill(0);
  for (const card of cards) {
    const start = Math.max(card.row, ...bottoms.slice(card.column, card.column + card.width));
    bottoms.fill(start + card.span, card.column, card.column + card.width);
    spans.set(card.item, card.span);
    card.item.style.gridColumn = `${card.column + 1} / span ${card.width}`;
    card.item.style.gridRow = `${start + 1} / span ${card.span}`;
  }
  frozenGrids.set(grid, columns);
}

function unfreezeMasonry(grid: HTMLElement) {
  frozenGrids.delete(grid);
  for (const item of Array.from(grid.children) as HTMLElement[]) {
    item.style.gridColumn = "";
    item.style.gridRow = "";
    item.style.gridRowEnd = `span ${spans.get(item) ?? MASONRY_INITIAL_SPAN}`;
  }
}

/** Release the freeze after the set of cards changes so dense packing re-balances. */
export function resetMasonryLayout(grid: HTMLElement | null) {
  if (grid && frozenGrids.has(grid)) unfreezeMasonry(grid);
}

// Span updates write styles directly (no React state): one shared observer,
// zero re-renders, and the grid moves only when a height truly changes.
function resizeCard(item: HTMLElement, grid: HTMLElement) {
  const span = spanOf(item);
  if (spans.get(item) === span) return;
  if (settled.has(item)) {
    freezeMasonry(grid);
    return;
  }
  spans.set(item, span);
  item.style.gridRowEnd = `span ${span}`;
  if (hasPreview(item)) settled.add(item);
}

const masonryObserver =
  typeof ResizeObserver === "undefined"
    ? null
    : new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (grids.has(target)) {
            const frozenAt = frozenGrids.get(target);
            if (frozenAt !== undefined && frozenAt !== Math.max(1, columnTracks(target).length)) unfreezeMasonry(target);
            continue;
          }
          const item = target.parentElement;
          const grid = item?.parentElement;
          if (item && grid) resizeCard(item, grid);
        }
      });

export function MasonryItem({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const node = innerRef.current;
    const item = node?.parentElement;
    const grid = item?.parentElement;
    if (!node || !item || !grid) return;
    if (!grids.has(grid)) {
      grids.add(grid);
      masonryObserver?.observe(grid);
    }
    resizeCard(item, grid);
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
