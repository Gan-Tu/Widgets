import React from "react";

/** Mounts children only once the container is near the viewport (400px margin). */
export function LazyMount({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
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

  return (
    <div ref={containerRef} className={className}>
      {mounted ? (
        children
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
