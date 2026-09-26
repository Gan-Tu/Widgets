export type PreviewFrame = { width: number; height: number };

/** Keep a gallery preview's slot from shrinking while its content changes, and grow it
    whenever content outgrows it so a preview never scrolls. Refit on resize. */
export function measurePreviewFrame(
  previous: PreviewFrame | undefined,
  content: { width: number; height: number },
  inset: number,
  minimumHeight: number
): PreviewFrame | undefined {
  if (!Number.isFinite(content.width) || !Number.isFinite(content.height) || content.width <= 0 || content.height <= 0) return previous;
  const height = Math.max(minimumHeight, Math.ceil(content.height + inset));
  if (previous && Math.abs(previous.width - content.width) < 0.5) {
    return height > previous.height ? { width: previous.width, height } : previous;
  }
  return { width: content.width, height };
}
