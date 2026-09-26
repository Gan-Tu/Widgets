export type PreviewFrame = { width: number; height: number };

/** Keep a gallery preview's slot stable while its content changes. Refit on resize. */
export function measurePreviewFrame(
  previous: PreviewFrame | undefined,
  content: { width: number; height: number },
  inset: number,
  minimumHeight: number
): PreviewFrame | undefined {
  if (!Number.isFinite(content.width) || !Number.isFinite(content.height) || content.width <= 0 || content.height <= 0) return previous;
  if (previous && Math.abs(previous.width - content.width) < 0.5) return previous;
  return { width: content.width, height: Math.max(minimumHeight, Math.ceil(content.height + inset)) };
}
