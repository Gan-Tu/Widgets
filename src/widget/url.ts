/**
 * URL guards for untrusted template input.
 *
 * Widget templates and data are authored by a model, so every URL that reaches
 * a navigable attribute (`href`, download links) is untrusted. React blocks
 * `javascript:` on `href`/`src`, but nothing stops `data:`/`blob:` — and a
 * `data:text/html` link, or a `data:` download rendered under the host's
 * origin, is a phishing primitive. Restrict these to real http(s) URLs.
 */

export function safeHttpUrl(value: unknown): URL | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

// A root-relative path can't carry a scheme, so it's safe by construction, and
// self-hosted consumers legitimately serve widget assets from their own origin.
// Matched textually rather than resolved against a base URL so server and
// client render identically (no base exists during SSR, and a mismatch would
// break hydration). `//host/path` is excluded — that's protocol-relative and
// points off-origin, so it goes through the URL parse above instead.
function isRootRelativePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function safeHttpHref(value: unknown): string | undefined {
  if (typeof value === "string" && isRootRelativePath(value)) return value;
  return safeHttpUrl(value)?.toString();
}
