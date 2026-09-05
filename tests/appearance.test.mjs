import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { z } from "zod";
import { WidgetAppearanceProvider, WidgetRenderer } from "../packages/widgets/dist/widget/index.js";
import { widgetExamples } from "../src/examples/widgetExamples.ts";

const sample = { template: '<Card><Text value="Example" /></Card>', data: {} };
const render = (props) => renderToStaticMarkup(React.createElement(WidgetRenderer, props));

test("renderer appearance is opt-in and independent of light/dark theme", () => {
  assert.match(render(sample), /data-appearance="default"/);
  for (const root of ["Card", "Basic", "ListView", "Response"]) {
    const html = render({ ...sample, template: `<${root}><Text value="Example" /></${root}>`, appearance: "glass", theme: "dark" });
    assert.match(html, /data-appearance="glass"/);
    assert.match(html, /data-theme="dark"/);
    assert.doesNotMatch(html, /Template error/);
  }
});

test("per-renderer appearance overrides a shared host preference", () => {
  const html = renderToStaticMarkup(
    React.createElement(WidgetAppearanceProvider, { appearance: "glass" },
      React.createElement(WidgetRenderer, { ...sample, appearance: "default" }),
      React.createElement(WidgetRenderer, sample)
    )
  );
  assert.deepEqual([...html.matchAll(/data-appearance="([^"]+)"/g)].map(match => match[1]), ["default", "glass"]);
});

test("error panels retain the requested theme and appearance", () => {
  for (const props of [
    { ...sample, template: "<Card>" },
    { ...sample, schema: z.object({ count: z.number() }), data: { count: "invalid" } }
  ]) {
    const html = render({ ...props, theme: "dark", appearance: "glass" });
    assert.match(html, /data-theme="dark"/);
    assert.match(html, /data-appearance="glass"/);
    assert.match(html, /Template error|Schema validation failed/);
  }
});

test("material surfaces recognize themed tokens and preserve custom or absent backgrounds", () => {
  const props = { data: {}, appearance: "glass", template: '<Basic><Box background={{ light: "surface", dark: "#192a40" }}><Text value="Panel" /></Box><Box background={null}><Text value="Unpainted" /></Box></Basic>' };
  const light = render({ ...props, theme: "light" });
  const dark = render({ ...props, theme: "dark" });
  assert.equal([...light.matchAll(/data-widget-surface="panel"/g)].length, 1);
  assert.doesNotMatch(dark, /data-widget-surface=/);
  assert.match(dark, /background:#192a40/);
  assert.doesNotMatch(light + dark, /Template error/);
});

test("nested surfaces retain their semantic emphasis and shadow choices", () => {
  const html = render({ data: {}, appearance: "glass", template: '<Card shadow={false}><Box background="surface" border={{ size: 2, color: "emphasis" }}><Card background="surface-secondary"><Text value="Nested" /></Card></Box></Card>' });
  assert.equal([...html.matchAll(/data-widget-surface="panel"/g)].length, 3);
  assert.match(html, /data-surface-emphasis="true"/);
  assert.match(html, /data-surface-shadow="false"/);
  assert.doesNotMatch(html, /Template error/);
});

test("all gallery templates render in glass without syntax or data changes", () => {
  for (const example of widgetExamples) {
    for (const theme of ["light", "dark"]) {
      const html = render({ template: example.template, data: example.data, schema: example.schema, theme, appearance: "glass" });
      assert.doesNotMatch(html, /Template error|Schema validation failed/, `${example.id} (${theme})`);
      assert.match(html, /data-appearance="glass"/, `${example.id} (${theme})`);
    }
  }
});

test("glass ships as a separate optional stylesheet", async () => {
  const manifest = JSON.parse(await readFile(new URL("../packages/widgets/package.json", import.meta.url), "utf8"));
  assert.equal(manifest.exports["./liquid-glass.css"], "./dist/liquid-glass.css");
  const source = await readFile(new URL("../src/widget/liquid-glass.css", import.meta.url), "utf8");
  const built = await readFile(new URL("../packages/widgets/dist/liquid-glass.css", import.meta.url), "utf8");
  const base = await readFile(new URL("../packages/widgets/dist/styles.css", import.meta.url), "utf8");
  assert.equal(built, source);
  assert.doesNotMatch(base, /--widget-glass-blur/);
});
