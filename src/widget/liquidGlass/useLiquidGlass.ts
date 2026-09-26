import { useEffect, type RefObject } from "react";
import { useWidgetAppearance } from "../theme";
import { getLensFilter, pruneUnusedLensFilters, retainLensFilter, subscribeRefractionSupport, supportsBackdropRefraction, transparencyPreference } from "./lensFilter";

const panels = ".wg-sidebar-nav, .wg-task-row, .wg-context-card, .wg-agent-input, .wg-prompt-bar, .wg-search, .wg-insight-cards, .wg-fine-tune, .wg-selection-toolbar, .wg-comparison-table, .wg-workspace-table-wrap, .wg-filter-table";
const thumbs = '.wg-segmented-control > button[aria-checked="true"], .wg-tabs-tab[aria-selected="true"], .wg-slider-thumb, .wg-switch > span';
const surfaces = `[data-widget-surface], ${panels}`;
const paneAncestors = `.wg-card, [data-widget-surface], ${panels}`;
const rootScans = new Map<HTMLElement, () => void>();

/** Registers the existing root; never adds a DOM wrapper or changes SSR markup. */
export function useLiquidGlassRoot(ref: RefObject<HTMLElement | null>) {
  const appearance = useWidgetAppearance();
  useEffect(() => {
    const root = ref.current;
    if (appearance !== "glass" || !root || typeof window === "undefined" || typeof ResizeObserver === "undefined" || typeof MutationObserver === "undefined") return;
    let disposed = false;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    type Target = { width: number; height: number; version: number; key?: string; release?: () => void };
    const targets = new Map<HTMLElement, Target>();
    const paint = (node: HTMLElement, id: string | null) => {
      if (id) {
        node.style.setProperty("--wg-lens", `url(#${id})`);
        node.setAttribute("data-lens", "");
      } else {
        node.style.removeProperty("--wg-lens");
        node.removeAttribute("data-lens");
      }
    };
    const resize = new ResizeObserver(entries => {
      for (const entry of entries) {
        const state = targets.get(entry.target as HTMLElement);
        if (!state) continue;
        const size = entry.borderBoxSize[0];
        // Border box sizes are logical; swap them for vertical writing modes.
        const vertical = getComputedStyle(entry.target).writingMode.startsWith("vertical");
        state.width = size ? (vertical ? size.blockSize : size.inlineSize) : (entry.target as HTMLElement).offsetWidth;
        state.height = size ? (vertical ? size.inlineSize : size.blockSize) : (entry.target as HTMLElement).offsetHeight;
      }
      schedule();
    });
    const remove = (node: HTMLElement, state: Target) => {
      state.version++;
      state.release?.();
      paint(node, null);
      resize.unobserve(node);
      targets.delete(node);
    };
    const rebuild = () => {
      if (disposed || !supportsBackdropRefraction()) return;
      for (const [node, state] of targets) {
        if (!node.isConnected) { remove(node, state); continue; }
        const { width, height } = state;
        const radiusText = getComputedStyle(node).borderTopLeftRadius;
        const radius = Math.min(parseFloat(radiusText) * (radiusText.endsWith("%") ? Math.min(width, height) / 100 : 1) || 0, width / 2, height / 2);
        const bezel = Math.min(radius * 0.9 + 4, 24);
        const key = JSON.stringify([Math.round(width), Math.round(height), radius, bezel]);
        if (state.key === key) continue;
        state.key = key;
        const version = ++state.version;
        void getLensFilter({ width, height, radius, bezel, strength: 0.8, chroma: true }).then(id => {
          if (disposed || targets.get(node) !== state || state.version !== version || !node.isConnected || !supportsBackdropRefraction()) {
            if (!node.isConnected && targets.get(node) === state) remove(node, state);
            pruneUnusedLensFilters();
            return;
          }
          state.release?.();
          state.release = undefined;
          paint(node, null);
          if (id) state.release = retainLensFilter(id, value => paint(node, value));
        });
      }
    };
    function schedule() {
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      frame = requestAnimationFrame(() => {
        frame = 0;
        timer = setTimeout(rebuild, 120);
      });
    }
    let observing = false;
    const scan = () => {
      const supported = supportsBackdropRefraction();
      if (supported && !observing) {
        mutation.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-checked", "aria-selected", "data-state", "class", "data-widget-surface", "data-appearance", "data-theme"] });
        observing = true;
      } else if (!supported && observing) {
        mutation.disconnect();
        observing = false;
      }
      const next = new Set<HTMLElement>();
      if (root.isConnected && supported) {
        const candidates = [root, ...root.querySelectorAll<HTMLElement>(`${surfaces}, ${thumbs}`)];
        for (const node of candidates) {
          if (node.closest(".widget-root") !== root) continue; // Nested roots own their controls.
          if (node.matches(thumbs)) { next.add(node); continue; }
          if (!node.matches(surfaces)) continue;
          const parentPane = node.parentElement?.closest(paneAncestors);
          if (!parentPane?.closest('.widget-root[data-appearance="glass"]')) next.add(node);
        }
      }
      for (const [node, state] of targets) if (!next.has(node)) remove(node, state);
      for (const node of next) if (!targets.has(node)) {
        targets.set(node, { width: node.offsetWidth, height: node.offsetHeight, version: 0 });
        resize.observe(node, { box: "border-box" });
      }
      if (next.size) schedule();
      else pruneUnusedLensFilters();
    };
    const mutation = new MutationObserver(() => {
      scan();
      // An ancestor becoming a pane also changes nested roots' optical stack.
      for (const [nested, rescan] of rootScans) if (nested !== root && root.contains(nested)) rescan();
    });
    const media = window.matchMedia?.(transparencyPreference);
    media?.addEventListener("change", scan);
    const unsubscribe = subscribeRefractionSupport(scan);
    rootScans.set(root, scan);
    scan();
    return () => {
      disposed = true;
      rootScans.delete(root);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      mutation.disconnect();
      for (const [node, state] of targets) remove(node, state);
      resize.disconnect();
      media?.removeEventListener("change", scan);
      unsubscribe();
      pruneUnusedLensFilters();
    };
  }, [appearance, ref]);
}
