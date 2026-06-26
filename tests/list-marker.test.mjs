import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WidgetRenderer } from "../packages/widgets/dist/widget/index.js";

function visibleText(markup) {
  return markup
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

test("List.Item marker style tokens are not rendered as visible text", () => {
  const template = `
<Card size="sm" gap={3}>
  <Title value="Lead cast" size="sm" />
  <List marker="disc" gap={2}>
    {cast.map((member) => (
      <List.Item key={member.name} marker="disc">
        <Text value={member.name + " as " + member.role} />
      </List.Item>
    ))}
  </List>
</Card>
  `;
  const data = {
    cast: [
      { name: "Matt Damon", role: "Odysseus" },
      { name: "Tom Holland", role: "Telemachus" }
    ]
  };

  const markup = renderToStaticMarkup(
    React.createElement(WidgetRenderer, { template, data })
  );
  const text = visibleText(markup);

  assert.match(text, /Matt Damon as Odysseus/);
  assert.match(text, /Tom Holland as Telemachus/);
  assert.doesNotMatch(text, /(?:^|\s)disc(?:\s|$)/i);
});
