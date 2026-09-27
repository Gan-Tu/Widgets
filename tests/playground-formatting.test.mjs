import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatWidgetTemplate } from "../src/components/playground/formatTemplate.ts";
import { widgetExamples } from "../src/examples/widgetExamples.ts";
import { parseTemplate } from "../packages/widgets/dist/widget/renderer/templateEngine.js";
import { WidgetRenderer } from "../packages/widgets/dist/widget/index.js";

test("formats nested widget JSX into readable two-space indentation", async () => {
  const source = '<Card gap={2}><Title value="Hello"/><Text value={count+1}/></Card>';
  assert.equal(await formatWidgetTemplate(source), `<Card gap={2}>
  <Title value="Hello" />
  <Text value={count + 1} />
</Card>`);
});

test("preserves DIL component props, quoted expressions and literal lookalikes", async () => {
  const source = `<Card><Caption $value="String(count) + ' items'"/><Button $onClickAction='{ patchState: set("count", count + 1) }'/><BaseCarousel.MediaItem *media={<Image src={photo.url}/>} /><Text value="__widgetFormat_ *media=literal"/></Card>`;
  const formatted = await formatWidgetTemplate(source);
  assert.ok(formatted.includes('*media={<Image src={photo.url} />}'));
  assert.ok(formatted.includes('value="__widgetFormat_ *media=literal"'));
  const ast = parseTemplate(formatted);
  assert.equal(ast.children.find((node) => node.type === "JSXElement").openingElement.attributes[0].value.value, "String(count) + ' items'");
  assert.equal(await formatWidgetTemplate(formatted), formatted);
});

test("retains fragments, callbacks, template strings, comments and root expressions", async () => {
  for (const source of [
    '<>{items.map((item)=> <Text key={item.id} value={`${item.name}: ${item.count+1}`} />)}</>',
    'visible?<Card><Text value="Visible"/></Card>:null',
    '// A leading comment\n<Card><Text value="Content"/></Card>',
    '<Card>{/* A JSX comment */}<Text value="Content"/></Card>',
    '<Each of={items.filter(item=>{return item.active})} item="item"><Text value={item.label}/></Each>'
  ]) {
    const formatted = await formatWidgetTemplate(source);
    assert.doesNotThrow(() => parseTemplate(formatted));
    assert.equal(await formatWidgetTemplate(formatted), formatted);
  }
});

test("preserves the rendered text around inline elements and HTML entities", async () => {
  for (const source of [
    '<Text>Hello                          <Bold>world</Bold>!</Text>',
    '<Text><Bold>Hello</Bold> <Italic>world</Italic></Text>',
    '<Text>Fish &amp; chips <Bold>today</Bold> only</Text>',
    '<Text value="A &quot;quoted&quot; title" />',
    '<Text>First line\nSecond line</Text>'
  ]) {
    const render = (template) => renderToStaticMarkup(React.createElement(WidgetRenderer, { template, data: {} }));
    assert.equal(render(await formatWidgetTemplate(source)), render(source));
  }
});

test("formats all gallery templates idempotently while keeping them renderer-compatible", async () => {
  for (const example of widgetExamples) {
    const formatted = await formatWidgetTemplate(example.template);
    assert.doesNotThrow(() => parseTemplate(formatted), example.id);
    assert.equal(await formatWidgetTemplate(formatted), formatted, example.id);
    const html = renderToStaticMarkup(React.createElement(WidgetRenderer, {
      template: formatted, data: example.data, schema: example.schema, theme: example.theme ?? "light"
    }));
    assert.ok(html && !html.includes("Template error") && !html.includes("Schema validation failed"), example.id);
  }
});

test("rejects incomplete syntax and multiple statements instead of returning altered content", async () => {
  for (const source of ['<Card>', '<Text value={count +} />', '<Text value="unfinished', '<Card />; <Card />', 'const x = 1']) {
    await assert.rejects(formatWidgetTemplate(source));
  }
  for (const source of ['', ' \n\t']) assert.equal(await formatWidgetTemplate(source), source);
});
