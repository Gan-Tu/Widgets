import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildLensMap, refractionProfile } from "../packages/widgets/dist/widget/liquidGlass/lensMap.js";
import { getLensFilter, supportsBackdropRefraction, retainLensFilter, pruneUnusedLensFilters } from "../packages/widgets/dist/widget/liquidGlass/lensFilter.js";
import { setLiquidGlassRefraction, WidgetRenderer } from "../packages/widgets/dist/widget/index.js";

const pixel = (map, x, y) => [...map.data.slice((y * map.width + x) * 4, (y * map.width + x) * 4 + 4)];

test("lens maps leave the flat interior and outside corners neutral", () => {
  const map = buildLensMap(120, 80, 20, 16);
  assert.deepEqual(pixel(map, 60, 40), [128, 128, 128, 255]);
  assert.deepEqual(pixel(map, 0, 0), [128, 128, 128, 255]);
  assert.deepEqual(pixel(map, 30, 30), [128, 128, 128, 255]);
});

test("straight bevels displace outward and corners displace diagonally", () => {
  const map = buildLensMap(120, 80, 20, 16);
  assert.ok(pixel(map, 118, 40)[0] > 128);
  assert.equal(pixel(map, 118, 40)[1], 128);
  assert.ok(pixel(map, 1, 40)[0] < 128);
  assert.equal(pixel(map, 1, 40)[1], 128);
  assert.ok(pixel(map, 60, 78)[1] > 128);
  assert.equal(pixel(map, 60, 78)[0], 128);
  assert.ok(pixel(map, 60, 1)[1] < 128);
  assert.equal(pixel(map, 60, 1)[0], 128);
  assert.ok(pixel(map, 6, 6)[0] < 128 && pixel(map, 6, 6)[1] < 128);
  assert.ok(pixel(map, 113, 73)[0] > 128 && pixel(map, 113, 73)[1] > 128);
});

test("quarter mirroring is symmetric at odd, even and reduced resolutions", () => {
  for (const [w, h, resolution] of [[120, 80, 1], [121, 81, 1], [1000, 120, 0.5]]) {
    const map = buildLensMap(w, h, 20, 16, 20, resolution);
    assert.equal(map.width, Math.round(w * resolution));
    assert.equal(map.height, Math.round(h * resolution));
    for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
      const p = pixel(map, x, y), horizontal = pixel(map, map.width - 1 - x, y), vertical = pixel(map, x, map.height - 1 - y);
      assert.equal(p[0] + horizontal[0], 256);
      assert.equal(p[1], horizontal[1]);
      assert.equal(p[1] + vertical[1], 256);
      assert.equal(p[0], vertical[0]);
      assert.equal(p[2], 128);
      assert.equal(p[3], 255);
    }
  }
});

test("ring-only evaluation agrees with the prototype full-frame SDF", () => {
  for (const [w, h, radius, bezel] of [[120, 80, 20, 16], [41, 17, 100, 12], [55, 33, 0, 4], [17, 17, 4, 12]]) {
    const map = buildLensMap(w, h, radius, bezel);
    const profile = refractionProfile(bezel, 20), max = Math.max(...profile);
    const r = Math.min(radius, w / 2, h / 2), hx = w / 2 - r, hy = h / 2 - r;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2, py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - hx, qy = Math.abs(py) - hy;
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), length = Math.hypot(ox, oy);
      const depth = r - length - Math.min(Math.max(qx, qy), 0);
      let nx = 0, ny = 0;
      if (depth > 0 && depth < bezel) {
        const m = profile[Math.min(127, Math.floor(depth / bezel * 128))] / max;
        nx = (qx > 0 && qy > 0 ? ox / length : qx > qy ? 1 : 0) * Math.sign(px) * m;
        ny = (qx > 0 && qy > 0 ? oy / length : qx > qy ? 0 : 1) * Math.sign(py) * m;
      }
      const actual = pixel(map, x, y);
      assert.ok(Math.abs(actual[0] - (128 + nx * 127)) <= 0.501, `R at ${x},${y} (${w}x${h})`);
      assert.ok(Math.abs(actual[1] - (128 + ny * 127)) <= 0.501, `G at ${x},${y} (${w}x${h})`);
    }
  }
});

test("exact rounded edge is neutral and the bevel profile peaks inside", () => {
  // At (0.5, 0.5), r=1+sqrt(0.5) puts this pixel exactly on the circle.
  const r = 1 + Math.sqrt(0.5);
  const map = buildLensMap(20, 20, r, 4);
  assert.deepEqual(pixel(map, 0, 0), [128, 128, 128, 255]);
  const profile = refractionProfile(24, 20);
  const peak = Math.max(...profile);
  const index = profile.indexOf(peak);
  assert.ok(index > 0 && index < profile.length - 1);
  assert.ok(profile.at(-1) < peak * 0.001);
  assert.deepEqual(buildLensMap(20, 20, 100, 4).data, buildLensMap(20, 20, 10, 4).data);
});

test("refraction sampling never folds beyond the outermost pixel of the bevel", () => {
  // The squircle's vertical tangent makes the first sub-pixel of the rim fold at
  // strength 0.8; that band is < 0.5px wide (invisible) and reads as the lit edge.
  for (const bezel of [8, 16, 24]) {
    const strength = 0.8, profile = refractionProfile(bezel, 20);
    const max = Math.max(...profile);
    let previous = -Infinity;
    for (let i = 0; i < profile.length; i++) {
      const depth = (i + 0.5) / profile.length * bezel;
      if (depth < 1) continue;
      const sampledDepth = depth - bezel * strength * profile[i] / max;
      assert.ok(sampledDepth >= previous, `bezel ${bezel}: sampling folds at depth ${depth}`);
      previous = sampledDepth;
    }
  }
});

function globals(values) {
  const originals = new Map(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  return () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    setLiquidGlassRefraction("auto");
  };
}

test("refraction detects Chromium engines, excludes iOS, and respects preferences and opt-out", () => {
  let reduced = false;
  const navigator = { userAgent: "" };
  const restore = globals({ navigator, window: { matchMedia: query => { assert.match(query, /prefers-reduced-transparency.*prefers-contrast/); return { matches: reduced }; } } });
  try {
    for (const [ua, expected] of [
      ["Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36", true],
      ["Mozilla/5.0 (Windows NT 10.0) Chrome/140.0.0.0 Safari/537.36 Edg/140.0", true],
      ["Mozilla/5.0 (Linux; Android 15) Chrome/140.0.0.0 Mobile Safari/537.36", true],
      ["Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/18.5 Safari/605.1.15", false],
      ["Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/140.0.0.0 Mobile Safari/604.1", false],
      ["Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/140.0", false]
    ]) { navigator.userAgent = ua; assert.equal(supportsBackdropRefraction(), expected, ua); }
    navigator.userAgent = "Chrome/140.0";
    for (const brand of ["Chromium", "Google Chrome", "Microsoft Edge", "Opera", "Brave"]) {
      navigator.userAgentData = { brands: [{ brand: "Not/A Brand" }, { brand }] };
      assert.equal(supportsBackdropRefraction(), true);
    }
    navigator.userAgent = "iPad CriOS/140";
    assert.equal(supportsBackdropRefraction(), false, "brands cannot override iOS exclusion");
    navigator.userAgent = "Chrome/140.0";
    reduced = true;
    setLiquidGlassRefraction(true);
    assert.equal(supportsBackdropRefraction(), false);
    reduced = false;
    setLiquidGlassRefraction(false);
    assert.equal(supportsBackdropRefraction(), false);
    setLiquidGlassRefraction("auto");
    assert.equal(supportsBackdropRefraction(), true);
  } finally { restore(); }
});

test("SSR renders glass roots without a lens or a wrapper", async () => {
  const restore = globals({ window: undefined, document: undefined });
  try {
    assert.equal(supportsBackdropRefraction(), false);
    assert.equal(await getLensFilter({ width: 120, height: 80, radius: 20, bezel: 16, strength: 0.8 }), null);
    for (const root of ["Card", "ListView", "Basic", "Response"]) {
      const html = renderToStaticMarkup(React.createElement(WidgetRenderer, { template: `<${root}><Text value="Glass" /></${root}>`, data: {}, appearance: "glass" }));
      assert.match(html, /^<div[^>]*class="widget-root/);
      assert.match(html, /data-appearance="glass"/);
      assert.doesNotMatch(html, /data-lens|--wg-lens|Template error/);
    }
  } finally { restore(); }
});


test("the requested Basic and Card control compositions render in both glass themes", () => {
  const templates = [
    '<Basic><SidebarNav workspace="Guide" sections={[{items: [{id: "start", label: "Start", active: true}]}]} /><Button label="About this guide" variant="outline" block /><Row><Button label="Home" variant="ghost" /><Button label="Guide" variant="ghost" /></Row></Basic>',
    '<Card asForm><ChipGroup name="topics" options={[{value: "a", label: "First"}, {value: "b", label: "Second"}]} /><Select name="choice" options={[{value: "a", label: "First"}]} /><Button label="Cancel" variant="outline" /><Button label="Save" color="primary" variant="solid" /></Card>'
  ];
  for (const theme of ["light", "dark"]) for (const template of templates) {
    const html = renderToStaticMarkup(React.createElement(WidgetRenderer, { template, theme, data: {}, appearance: "glass" }));
    assert.match(html, new RegExp(`data-theme="${theme}"`));
    assert.match(html, /data-variant="outline"/);
    assert.doesNotMatch(html, /Template error|data-lens/);
    if (template.startsWith("<Basic>")) {
      assert.match(html, /wg-sidebar-nav/);
      assert.match(html, /data-variant="ghost"/);
      assert.doesNotMatch(html, /data-widget-surface/);
    } else {
      assert.match(html, /data-widget-surface="panel"/);
      assert.match(html, /role="combobox"/);
      assert.match(html, /wg-choice/);
    }
  }
});

test("filters cache all parameters, encode channels, evict by LRU, and release on cleanup", async () => {
  class Element {
    children = []; attributes = {}; style = {}; parent = null;
    constructor(name) { this.name = name; }
    get isConnected() { return this.name === "body" || !!this.parent?.isConnected; }
    setAttribute(key, value) { this.attributes[key] = value; }
    appendChild(child) { child.parent = this; this.children.push(child); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; }
  }
  const body = new Element("body");
  let raster;
  const restore = globals({
    navigator: { userAgent: "Chrome/140" }, window: { matchMedia: () => ({ matches: false }) },
    ImageData: class { constructor(data, width, height) { this.data = data; this.width = width; this.height = height; } },
    OffscreenCanvas: undefined, FileReader: undefined,
    document: { body, createElementNS: (_, name) => new Element(name), createElement: () => ({ getContext: () => ({ putImageData: image => { raster = image; } }), toDataURL: () => "data:image/png;base64,test" }) }
  });
  try {
    const options = { width: 120.2, height: 80.2, radius: 20, bezel: 16, strength: 0.8 };
    const first = await getLensFilter(options);
    assert.equal(await getLensFilter({ ...options, width: 120.4 }), first);
    const svg = body.children[0], filter = svg.children[0];
    assert.equal(svg.attributes["aria-hidden"], "true");
    assert.equal(filter.attributes.filterUnits, "userSpaceOnUse");
    assert.equal(filter.attributes.width, "120");
    assert.equal(filter.attributes["color-interpolation-filters"], "sRGB");
    assert.deepEqual(filter.children.filter(child => child.name === "feDisplacementMap").map(child => Number(child.attributes.scale)), [25.6, 25.6 * 1.08, 25.6 * 1.16]);
    assert.equal(filter.children.filter(child => child.name === "feColorMatrix").length, 3);
    assert.equal(filter.children.filter(child => child.name === "feBlend").length, 2);
    const plain = await getLensFilter({ ...options, chroma: false });
    assert.notEqual(first, plain);
    assert.equal(svg.children[1].children.filter(child => child.name === "feDisplacementMap").length, 1);
    let assigned;
    const release = retainLensFilter(first, id => { assigned = id; });
    for (let i = 0; i < 46; i++) await getLensFilter({ ...options, width: 200 + i });
    assert.equal(svg.children.length, 48);
    await getLensFilter(options); // Touch first; plain becomes the LRU.
    await getLensFilter({ ...options, radius: 19 });
    assert.equal(assigned, first);
    assert.ok(!svg.children.some(child => child.attributes.id === plain));
    for (let i = 0; i < 48; i++) await getLensFilter({ ...options, width: 400 + i });
    assert.equal(assigned, null, "eviction clears consumers instead of dangling URLs");
    assert.equal(svg.children.length, 48);
    await getLensFilter({ ...options, width: 1000 });
    assert.equal(raster.width, 500);
    assert.equal(await getLensFilter({ ...options, width: 1601 }), null);
    release();
    pruneUnusedLensFilters();
    assert.equal(body.children.length, 0);
    let encodes = 0;
    globalThis.OffscreenCanvas = class {
      getContext() { return { putImageData: () => {} }; }
      async convertToBlob() { encodes++; return {}; }
    };
    globalThis.FileReader = class {
      readAsDataURL() { this.result = "data:image/png;base64,offscreen"; queueMicrotask(() => this.onload()); }
    };
    const ids = await Promise.all([getLensFilter(options), getLensFilter(options)]);
    assert.equal(ids[0], ids[1]);
    assert.equal(encodes, 1, "concurrent identical requests share PNG encoding");
    assert.equal(body.children[0].children[0].children[0].attributes.href, "data:image/png;base64,offscreen");
    const inFlight = getLensFilter({ ...options, strength: 0.7 });
    setLiquidGlassRefraction(false);
    assert.equal(await inFlight, null, "preference changes during encoding cancel the lens");
  } finally { pruneUnusedLensFilters(); restore(); }
});
