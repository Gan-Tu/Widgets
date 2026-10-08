import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";
import type { GlassSceneController } from "@glass-sdk/liquid-glass/dom";
import "@glass-sdk/liquid-glass/styles.css";
import "./glass-preview.css";

type GlassStatus = "loading" | "ready" | "fallback" | "paused";
type GlassPreviewProps = {
  children: ReactNode;
  theme?: "light" | "dark";
  enabled?: boolean;
  material?: "regular" | "clear";
  refraction?: number;
  backdrop?: "neutral" | "aurora" | "sunset";
  className?: string;
  backgroundImage?: string;
  backgroundScroll?: number;
  onBackgroundScrollChange?: (value: number) => void;
  onBackgroundImageError?: () => void;
  onStatusChange?: (status: GlassStatus) => void;
};

const surfaces = '[data-widget-surface], .wg-sidebar-nav, .wg-context-card, .wg-agent-input, .wg-prompt-bar, .wg-search, .wg-insight-cards, .wg-fine-tune, .wg-selection-toolbar, .wg-comparison-table, .wg-workspace-table-wrap, .wg-filter-table';
const accessibilityQuery = "(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)";

/** Website enhancement only: refracts an explicit backdrop without replacing widget DOM. */
export function GlassPreview({ children, theme = "light", enabled = true, material = "regular", refraction = 35, backdrop = "neutral", className = "", backgroundImage, backgroundScroll = 0, onBackgroundScrollChange, onBackgroundImageError, onStatusChange }: GlassPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<HTMLDivElement>(null);
  const report = useEffectEvent((status: GlassStatus) => onStatusChange?.(status));

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    const position = Math.max(0, Math.min(100, backgroundScroll)) / 100 * (viewport.scrollHeight - viewport.clientHeight);
    if (Math.abs(viewport.scrollTop - position) > 1) viewport.scrollTop = position;
  }, [backgroundScroll, backgroundImage]);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = scrollRef.current;
    if (!backgroundImage || !root || !viewport) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [role="slider"]')) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      const next = Math.max(0, Math.min(viewport.scrollHeight - viewport.clientHeight, viewport.scrollTop + delta));
      if (next === viewport.scrollTop) return; // At the edges, continue scrolling the page.
      event.preventDefault();
      viewport.scrollTop = next;
    };
    root.addEventListener("wheel", wheel, { passive: false });
    return () => root.removeEventListener("wheel", wheel);
  }, [backgroundImage]);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    const widgets = widgetsRef.current;
    if (!root || !content || !widgets) return;
    let disposed = false;
    let visible = false;
    let generation = 0;
    let scene: GlassSceneController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let mutation: MutationObserver | undefined;
    let resize: ResizeObserver | undefined;
    const registrations = new Map<HTMLElement, { proxy: HTMLDivElement; key: string; remove: () => void }>();
    const preferences = matchMedia(accessibilityQuery);
    const status = (value: GlassStatus) => {
      root.dataset.glassStatus = value;
      report(value);
    };
    const stop = () => {
      generation++;
      clearTimeout(timer);
      mutation?.disconnect();
      mutation = undefined;
      resize?.disconnect();
      resize = undefined;
      for (const [element, { remove, proxy }] of registrations) {
        remove();
        proxy.remove();
        delete element.dataset.sdkGlass;
      }
      registrations.clear();
      scene?.dispose();
      scene = undefined;
      delete root.dataset.glassReady;
    };
    const start = async () => {
      stop();
      // Safari's upstream rendering is still unreliable. Preserve the working CSS material.
      const safari = /Safari\//.test(navigator.userAgent) && !/Chrome\/|Chromium\//.test(navigator.userAgent);
      if (!enabled || preferences.matches || safari || !window.isSecureContext || !("gpu" in navigator)) {
        status("fallback");
        return;
      }
      if (!visible || document.hidden) { status("paused"); return; }
      status("loading");
      const current = generation;
      try {
        const { createGlassScene } = await import("@glass-sdk/liquid-glass/dom");
        if (disposed || generation !== current) return;
        scene = createGlassScene(root, {
          maxSurfaces: 12,
          onDiagnostic: ({ surfaces: count, maps, error }) => {
            if (disposed || generation !== current) return;
            if (error) {
              // Dispose outside the library's render callback.
              queueMicrotask(() => {
                if (disposed || generation !== current) return;
                stop();
                status("fallback");
              });
            } else if (count > 0 && maps === count) status("ready");
          }
        });
        scene.setContent(content);
        const scan = () => {
          if (!scene) return;
          const candidates = [...widgets.querySelectorAll<HTMLElement>(surfaces)].filter(element => {
            if (element.closest('.widget-root')?.getAttribute('data-appearance') !== 'glass') return false;
            // A single material per stack; keep nested controls and custom image fills intact.
            const ancestor = element.parentElement?.closest(surfaces);
            return !ancestor || !widgets.contains(ancestor);
          }).slice(0, 12);
          for (const [element, { remove, proxy }] of registrations) {
            if (!candidates.includes(element)) {
              remove();
              proxy.remove();
              resize?.unobserve(element);
              delete element.dataset.sdkGlass;
              registrations.delete(element);
            }
          }
          const origin = root.getBoundingClientRect();
          for (const element of candidates) {
            const box = element.getBoundingClientRect();
            const radiusText = getComputedStyle(element).borderTopLeftRadius;
            const parsed = parseFloat(radiusText);
            const radius = Number.isFinite(parsed) ? parsed * (radiusText.endsWith("%") ? Math.min(box.width, box.height) / 100 : 1) : 22;
            const appearance = element.closest('.widget-root')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const key = `${radius}:${appearance}`;
            let registration = registrations.get(element);
            if (registration && registration.key !== key) {
              registration.remove();
              registration.proxy.remove();
              registration = undefined;
            }
            if (!registration) {
              // SDK geometry belongs to an inert proxy: real panes keep their corners,
              // overflow, focus rings, and any dropdowns extending outside the pane.
              const proxy = document.createElement("div");
              proxy.className = "glass-preview-lens";
              proxy.setAttribute("aria-hidden", "true");
              root.append(proxy);
              registration = { proxy, key, remove: scene.addSurface(proxy, { radius, material, refraction, appearance, interactive: false, motion: "none" }) };
              registrations.set(element, registration);
              element.dataset.sdkGlass = "";
              resize?.observe(element);
            }
            const geometry = { left: `${box.left - origin.left}px`, top: `${box.top - origin.top}px`, width: `${box.width}px`, height: `${box.height}px` };
            for (const property of ["left", "top", "width", "height"] as const) {
              if (registration.proxy.style[property] !== geometry[property]) registration.proxy.style[property] = geometry[property];
            }
          }
          if (!candidates.length) status("fallback");
        };
        resize = new ResizeObserver(scan);
        resize.observe(widgets);
        scan();
        mutation = new MutationObserver(scan);
        mutation.observe(widgets, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-widget-surface", "data-appearance", "data-theme", "style", "class"] });
      } catch {
        if (disposed || generation !== current) return;
        stop();
        status("fallback");
      }
    };
    const schedule = () => {
      stop();
      // Let entrance transforms settle before measuring the scene.
      timer = setTimeout(() => void start(), 400);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { stop(); status("paused"); }
    });
    observer.observe(root);
    preferences.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      preferences.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [enabled, theme, material, refraction]);

  return (
    <div ref={rootRef} className={`glass-preview ${className}`} data-theme={theme} data-backdrop={backdrop} data-enabled={enabled}>
      <div ref={scrollRef} className="glass-preview-scroll" data-photo={!!backgroundImage} tabIndex={backgroundImage ? 0 : undefined} role={backgroundImage ? "region" : undefined} aria-label={backgroundImage ? "Scrollable background image" : undefined}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          const range = viewport.scrollHeight - viewport.clientHeight;
          onBackgroundScrollChange?.(range > 0 ? viewport.scrollTop / range * 100 : 0);
        }}>
        <div ref={contentRef} className="glass-preview-backdrop" aria-hidden="true">
          {backgroundImage ? <img key={backgroundImage} src={backgroundImage} alt="" crossOrigin={backgroundImage.startsWith("blob:") ? undefined : "anonymous"} onError={onBackgroundImageError} /> : <><i /><i /><i /></>}
        </div>
      </div>
      <div ref={widgetsRef} className="glass-preview-widgets">{children}</div>
    </div>
  );
}
