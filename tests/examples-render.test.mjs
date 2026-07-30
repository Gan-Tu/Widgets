import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WidgetRenderer } from "../packages/widgets/dist/widget/index.js";
// Node's type stripping lets us import the demo data straight from source.
import { widgetExamples } from "../src/examples/widgetExamples.ts";

test("built chart implementation is Node-ESM resolvable and renders", async () => {
  // The chart facade lazy-loads chartImpl via a dynamic import; this both
  // proves fix-esm-imports rewrote that specifier (ERR_MODULE_NOT_FOUND
  // otherwise) and exercises the recharts implementation the Suspense
  // fallback hides from the example renders below.
  const impl = await import("../packages/widgets/dist/widget/components/chartImpl.js");
  const html = renderToStaticMarkup(
    React.createElement(impl.BarChartImpl, {
      data: [
        { month: "Jan", value: 10 },
        { month: "Feb", value: 14 }
      ],
      series: [{ dataKey: "value" }],
      xAxis: { dataKey: "month" },
      height: 120
    })
  );
  assert.notEqual(html, "", "chart impl rendered empty output");
  // Malformed model output must degrade, not throw, during render.
  const degraded = renderToStaticMarkup(
    React.createElement(impl.BarChartImpl, { data: [{ month: "Jan", value: 1 }] })
  );
  assert.notEqual(degraded, "", "chart impl with missing series/xAxis should still render");
});

test("every gallery example renders without template or schema errors", () => {
  assert.ok(widgetExamples.length >= 25, "expected a full example set");
  const failures = [];

  for (const example of widgetExamples) {
    let html = "";
    try {
      html = renderToStaticMarkup(
        React.createElement(WidgetRenderer, {
          template: example.template,
          schema: example.schema,
          data: example.data,
          theme: example.theme ?? "light"
        })
      );
    } catch (error) {
      failures.push(`${example.id}: threw ${error.message}`);
      continue;
    }
    if (html.includes("Template error")) {
      failures.push(`${example.id}: template error`);
    }
    if (html.includes("Schema validation failed")) {
      failures.push(`${example.id}: schema validation failed`);
    }
    if (html.trim() === "") {
      failures.push(`${example.id}: rendered empty output`);
    }
  }

  assert.deepEqual(failures, [], `Example render failures:\n${failures.join("\n")}`);
});
