import { buildLensMap } from "./lensMap";

export const transparencyPreference = "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
let enabled: boolean | "auto" = "auto";
const supportListeners = new Set<() => void>();

/** Preferences and engine safety always take precedence, even when explicitly enabled. */
export function supportsBackdropRefraction() {
  if (enabled === false || typeof navigator === "undefined" || typeof window === "undefined") return false;
  if (window.matchMedia?.(transparencyPreference).matches) return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS|Firefox/i.test(ua)) return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return brands
    ? brands.some(({ brand }) => /^(Chromium|Google Chrome|Microsoft Edge|Opera|Brave)$/i.test(brand))
    : /Chrome\/|Chromium\//.test(ua);
}

export function setLiquidGlassRefraction(value: boolean | "auto") {
  enabled = value;
  supportListeners.forEach(listener => listener());
}

export function subscribeRefractionSupport(listener: () => void) {
  supportListeners.add(listener);
  return () => { supportListeners.delete(listener); };
}

type LensOptions = { width: number; height: number; radius: number; bezel: number; strength: number; chroma?: boolean };
type Entry = { id: string; element: SVGFilterElement; listeners: Set<(id: string | null) => void> };
const cache = new Map<string, Entry>();
const pending = new Map<string, Promise<string | null>>();
let svg: SVGSVGElement | undefined;
let sequence = 0;
const ns = "http://www.w3.org/2000/svg";

function remove(key: string, entry: Entry) {
  cache.delete(key);
  entry.element.remove();
  entry.listeners.forEach(listener => listener(null));
}

/** Subscribe before assigning the URL: a concurrent request may have evicted it. */
export function retainLensFilter(id: string, listener: (id: string | null) => void) {
  const entry = [...cache.values()].find(value => value.id === id);
  if (!entry) { listener(null); return () => {}; }
  entry.listeners.add(listener);
  listener(id);
  return () => { entry.listeners.delete(listener); };
}

export function pruneUnusedLensFilters() {
  for (const [key, entry] of cache) if (!entry.listeners.size) remove(key, entry);
  if (!cache.size) { svg?.remove(); svg = undefined; }
}

async function png(map: ReturnType<typeof buildLensMap>): Promise<string> {
  const pixels = new ImageData(new Uint8ClampedArray(map.data), map.width, map.height);
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(map.width, map.height);
    const context = canvas.getContext("2d");
    if (context) {
      context.putImageData(pixels, 0, 0);
      const blob = await canvas.convertToBlob({ type: "image/png" });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = map.width; canvas.height = map.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Async because OffscreenCanvas encodes PNGs asynchronously. Fail closed to plain glass. */
export async function getLensFilter(options: LensOptions): Promise<string | null> {
  if (typeof document === "undefined" || !document.body || !supportsBackdropRefraction()) return null;
  const { radius, bezel, strength, chroma = true } = options;
  const width = Math.round(options.width), height = Math.round(options.height);
  if (![width, height, radius, bezel, strength].every(Number.isFinite) || width < 12 || height < 12 || width > 1600 || height > 1600 || bezel <= 0) return null;
  const key = JSON.stringify([width, height, radius, bezel, strength, chroma]);
  const hit = cache.get(key);
  if (hit) { cache.delete(key); cache.set(key, hit); return hit.id; }
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;
  const task = (async () => {
    try {
      const map = buildLensMap(width, height, radius, bezel, 20, Math.max(width, height) > 900 ? 0.5 : 1);
      const url = await png(map);
      if (!supportsBackdropRefraction()) return null;
      if (!svg?.isConnected) {
        svg = document.createElementNS(ns, "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
        svg.style.position = "absolute";
        document.body.appendChild(svg);
      }
      const id = `wg-lens-${++sequence}`;
      const filter = document.createElementNS(ns, "filter");
      const attributes = { id, filterUnits: "userSpaceOnUse", x: "0", y: "0", width: String(width), height: String(height), "color-interpolation-filters": "sRGB" };
      for (const [name, value] of Object.entries(attributes)) filter.setAttribute(name, value);
      const add = (name: string, attributes: Record<string, string | number>) => {
        const element = document.createElementNS(ns, name);
        for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
        filter.appendChild(element);
      };
      add("feImage", { href: url, x: 0, y: 0, width, height, preserveAspectRatio: "none", result: "map" });
      const scale = 2 * bezel * strength;
      const displace = (scale: number, result: string) => add("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale, xChannelSelector: "R", yChannelSelector: "G", result });
      if (chroma) {
        [1, 1.08, 1.16].forEach((factor, i) => {
          displace(scale * factor, `channel${i}`);
          const matrix = Array<number>(20).fill(0);
          matrix[i * 6] = 1; matrix[18] = 1;
          add("feColorMatrix", { in: `channel${i}`, type: "matrix", values: matrix.join(" "), result: `isolated${i}` });
        });
        add("feBlend", { in: "isolated0", in2: "isolated1", mode: "screen", result: "rg" });
        add("feBlend", { in: "rg", in2: "isolated2", mode: "screen" });
      } else displace(scale, "lens");
      svg.appendChild(filter);
      cache.set(key, { id, element: filter, listeners: new Set() });
      while (cache.size > 48) {
        const oldest = cache.entries().next().value!;
        remove(...oldest);
      }
      return id;
    } catch { return null; }
    finally { pending.delete(key); }
  })();
  pending.set(key, task);
  return task;
}
