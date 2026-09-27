import assert from "node:assert/strict";
import test from "node:test";
import { highlightCode } from "../src/components/playground/highlight.ts";
import { widgetComponentNames } from "../api/widget-component-names.js";
import { widgetExamples } from "../src/examples/widgetExamples.ts";

function tokensFor(source, language = "widget") {
  const tokens = highlightCode(source, language);
  assert.equal(tokens.map((token) => token.text).join(""), source, "Highlighting must preserve the exact source");
  assert.ok(tokens.every((token) => token.text.length > 0));
  return tokens;
}

function includes(tokens, text, kind) {
  assert.ok(tokens.some((token) => token.text === text && token.kind === kind), `Expected ${JSON.stringify(text)} as ${kind}`);
}

test("every registered component and dotted alias highlights in paired and self-closing tags", () => {
  for (const name of widgetComponentNames) {
    const tokens = tokensFor(`<${name} id="example" disabled><${name} /></${name}>`);
    assert.deepEqual(tokens.filter((token) => token.kind === "tag").map((token) => token.text), [name, name, name]);
    includes(tokens, "disabled", "attribute");
    includes(tokens, '"example"', "string");
  }
});

test("DIL bindings highlight their expressions and component-valued props retain nested JSX", () => {
  const tokens = tokensFor(`<State initial={{ count: 0 }}>
    <Each $of="items.filter(item => item.active)" item="item">
      <BaseCarousel.MediaItem *media={<Image src={item.url} />} />
      <Button bind="selected" $onClickAction='{ patchState: set("count", count + 1) }' />
    </Each>
  </State>`);
  for (const binding of ["$of", "*media", "$onClickAction"]) includes(tokens, binding, "binding");
  for (const name of ["State", "Each", "BaseCarousel.MediaItem", "Image", "Button"]) includes(tokens, name, "tag");
  for (const name of ["filter", "set"]) includes(tokens, name, "function");
  includes(tokens, "patchState", "property");
  includes(tokens, "1", "number");
  includes(tokens, "bind", "attribute");
});

test("fragments, callbacks, comparisons, objects, arrays, comments and template interpolation", () => {
  const tokens = tokensFor('<>{/* <NotATag /> */}{items.map((item, index) => item.price<limit ? <Text value={`${index + 1}: ${item.name}`} /> : <Caption value="Hidden" />)}<Button disabled={true} onClickAction={{ type: "save", payload: [1, -2.5e3, null, false] }} />{// note\n}</>');
  assert.deepEqual(tokens.filter((token) => token.kind === "tag").map((token) => token.text), ["Text", "Caption", "Button"]);
  includes(tokens, "<", "operator");
  includes(tokens, "=>", "operator");
  includes(tokens, "/* <NotATag /> */", "comment");
  includes(tokens, "// note", "comment");
  includes(tokens, "${", "punctuation");
  includes(tokens, "2.5e3", "number");
  for (const value of ["true", "false", "null"]) includes(tokens, value, "keyword");
});

test("JSON keys and values are distinct and embedded widget-looking strings stay strings", () => {
  const tokens = tokensFor('{"title": "<Card />", "escaped": "a\\\"b", "nested": {"items": [0, -2.5, 1e3, true, false, null]}}', "json");
  includes(tokens, '"title"', "property");
  includes(tokens, '"<Card />"', "string");
  includes(tokens, '"a\\\"b"', "string");
  assert.equal(tokens.filter((token) => token.kind === "tag").length, 0);
});

test("ternary branches stay values rather than being mistaken for object properties", () => {
  const tokens = tokensFor('<Text value={ready ? "Ready" : label} color={ready ? primary : secondary} meta={ready ? { label: "Ready" } : null} />');
  includes(tokens, '"Ready"', "string");
  includes(tokens, "primary", "plain");
  includes(tokens, "label", "property");
  assert.equal(tokens.some((token) => token.text === '"Ready"' && token.kind === "property"), false);
});

test("all gallery templates and JSON data retain their source and highlight their component tags", () => {
  for (const example of widgetExamples) {
    const tokens = tokensFor(example.template);
    for (const [, name] of example.template.matchAll(/<([A-Z][\w.]*)\b/g)) includes(tokens, name, "tag");
    tokensFor(JSON.stringify(example.data, null, 2), "json");
  }
});

test("unfinished edits, Unicode, escapes, trailing lines and deep nesting never lose source", () => {
  const sources = [
    '', '<', '<Card', '<Tabs.Panel id="work"', '<Text value={user?.name ?? "你好 👋"} />\n\n',
    '<Text value={`Hi ${user.name}`} />', '<Text $value="items.filter(item => item.active)" />',
    '<Card>\n  {/* comment */}\n  <Text value="a > b & c" />\n</Card>',
    '<Image *media={<Image src="photo.jpg" />} />', '<Text value="unterminated',
    '<Text value={/* unfinished', '<Text value={"escaped\\\" string"} />',
    '<Card>'.repeat(2000) + '</Card>'.repeat(2000),
  ];
  for (const source of sources) {
    tokensFor(source);
    // Simulate incremental typing and deletion without requiring a valid AST.
    if (source.length < 1000) for (let end = 0; end < source.length; end++) tokensFor(source.slice(0, end));
  }
});
