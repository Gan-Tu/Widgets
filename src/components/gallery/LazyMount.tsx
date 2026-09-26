import React from "react";
import { measurePreviewFrame, type PreviewFrame } from "./previewFrame";

/** Mounts children only once the container is near the viewport (400px margin). */
export function LazyMount({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (mounted) return;
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted]);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!mounted || !container || !content) return;
    let frame: PreviewFrame | undefined;
    const fit = () => {
      const style = getComputedStyle(container);
      const inset = [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      const next = measurePreviewFrame(frame, content.getBoundingClientRect(), inset, parseFloat(style.minHeight) || 0);
      if (next && next !== frame) {
        frame = next;
        container.style.height = `${next.height}px`;
      }
    };
    fit();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(content);
    return () => {
      observer?.disconnect();
      container.style.height = "";
    };
  }, [mounted]);

  return (
    <div ref={containerRef} className={className}>
      {mounted ? (
        <div ref={contentRef} className="gallery-preview-content">{children}</div>
      ) : (
        <div
          // Reserves space for the live preview while preserving lazy mounting.
          className="h-[300px] w-full animate-pulse rounded-xl bg-black/[0.025]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
