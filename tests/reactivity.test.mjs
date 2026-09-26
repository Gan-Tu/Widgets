import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { evaluateTemplateExpression as evaluate, renderTemplate, resolveDeferredActionExpression } from '../packages/widgets/dist/widget/renderer/templateEngine.js';
import { WidgetRenderer } from '../packages/widgets/dist/widget/WidgetRenderer.js';
import { WidgetActionProvider, buildChangePayload, useWidgetAction } from '../packages/widgets/dist/widget/context.js';
import { State, useWidgetStateBinding, seedStateDefaults, seedBindingDefault, writeBinding, normalizeSliderBinding } from '../packages/widgets/dist/widget/binding.js';
import { widgetRegistry } from '../packages/widgets/dist/widget/registry.js';
import { read } from '../packages/widgets/dist/widget/state.js';

const render = (template, data = {}, theme = 'light') => {
  const html = renderToStaticMarkup(React.createElement(WidgetRenderer, { template, data, theme }));
  assert.doesNotMatch(html, /Template error|Schema validation failed/);
  return html;
};

test('nullish coalescing and optional member, computed member, and method calls', () => {
  assert.equal(evaluate('missing ?? "fallback"', {}), 'fallback');
  for (const value of [false, 0, '']) assert.equal(evaluate('value ?? 10', { value }), value);
  assert.equal(evaluate('user?.name', { user: null }), undefined);
  assert.equal(evaluate('user?.[key]', { user: { name: 'Gan' }, key: 'name' }), 'Gan');
  assert.equal(evaluate('user?.[unknown()]', { user: null }), undefined);
  assert.equal(evaluate('items?.filter(x => x > 1)', { items: null }), undefined);
  assert.deepEqual(evaluate('items?.filter(x => x > 1)', { items: [1, 2, 3] }), [2, 3]);
  assert.equal(evaluate('user?.profile?.name ?? "none"', {}), 'none');
});

test('all array methods run through the whitelist and preserve input', () => {
  const scope = { items: [1, 2, 3] };
  const cases = [
    ['items.map((item, index) => { return item + index; })', [1, 3, 5]],
    ['items.filter(item => item > 1)', [2, 3]],
    ['items.find(item => item > 1)', 2],
    ['items.findIndex(item => item > 1)', 1],
    ['items.some(item => item === 2)', true],
    ['items.every(item => item > 0)', true],
    ['items.reduce((acc, item, index) => acc + item + index, 0)', 9],
    ['items.slice(1, 3)', [2, 3]],
    ['items.join("-")', '1-2-3'],
    ['items.includes(2)', true],
    ['items.indexOf(3)', 2],
    ['items.concat([4], 5)', [1, 2, 3, 4, 5]],
    ['items.at(-1)', 3],
    ['[1, [2, [3]]].flat(2)', [1, 2, 3]],
  ];
  for (const [expression, expected] of cases) assert.deepEqual(evaluate(expression, scope), expected, expression);
  assert.deepEqual(scope.items, [1, 2, 3]);
  assert.throws(() => evaluate('items.reduce((a, b) => a + b)', scope), /initial value/);
  assert.throws(() => evaluate('items.sort()', scope), /Unsupported method: sort/);
  assert.throws(() => evaluate('items.filter(predicate)', { ...scope, predicate: () => true }), /Only arrow functions/);
  assert.throws(() => evaluate('items.flat(3)', scope), /depth/);
  assert.throws(() => evaluate('items.map(x => { x = 2; return x; })', scope), /return statement/);
});

test('all string and number methods validate their arguments', () => {
  const cases = [
    ['"abcdef".slice(1, 3)', 'bc'], ['"abcdef".substring(1, 3)', 'bc'],
    ['"Hi".toUpperCase()', 'HI'], ['"Hi".toLowerCase()', 'hi'], ['" x ".trim()', 'x'],
    ['"abc".includes("b")', true], ['"abc".startsWith("a")', true], ['"abc".endsWith("c")', true],
    ['"a,b".split(",")', ['a', 'b']], ['"5".padStart(3, "0")', '005'], ['"5".padEnd(3, "0")', '500'],
    ['"a-a".replaceAll("a", "b")', 'b-b'], ['"abc".at(-1)', 'c'], ['(1.25).toFixed(1)', '1.3'],
  ];
  for (const [expression, expected] of cases) assert.deepEqual(evaluate(expression, {}), expected, expression);
  assert.throws(() => evaluate('(1).toFixed(21)', {}), /digits/);
  assert.throws(() => evaluate('"x".replaceAll("x", 1)', {}), /string arguments/);
  assert.throws(() => evaluate('"x".slice({})', {}), /numeric arguments/);
  assert.throws(() => evaluate('"x".filter(x => x)', {}), /Unsupported method: filter/);
  assert.throws(() => evaluate('x.toUpperCase()', { x: {} }), /Unsupported method: toUpperCase/);
});

test('lookups hide prototype properties, inherited scope values, accessors and functions', () => {
  const scope = { x: {}, items: [1], constructor: 'blocked', fn: () => 'unsafe', nested: { fn: () => 'unsafe' } };
  for (const expression of ['x.constructor', 'x.__proto__', '({}).constructor', 'items.filter', 'constructor', 'fn', 'nested.fn']) {
    assert.equal(evaluate(expression, scope), undefined, expression);
  }
  for (const key of ['prototype', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__']) {
    assert.equal(evaluate(`x["${key}"]`, { x: { [key]: 'blocked' } }), undefined);
  }
  assert.equal(evaluate('inherited', Object.create({ inherited: 1 })), undefined);
  const withGetter = Object.defineProperty({}, 'secret', { get() { throw new Error('getter invoked'); } });
  assert.equal(evaluate('x.secret', { x: withGetter }), undefined);
  const malicious = [1, 2];
  malicious.filter = () => { throw new Error('host function invoked'); };
  assert.deepEqual(evaluate('items.filter(x => x > 1)', { items: malicious }), [2]);
  const element = renderTemplate('<Probe direct={fn} method={items.filter} object={nested} />', scope, { Probe: () => null });
  assert.equal(element.props.direct, undefined);
  assert.equal(element.props.method, undefined);
  assert.strictEqual(element.props.object, scope.nested);
  assert.equal(read({ x: {} }, 'x.constructor'), undefined);
  assert.deepEqual(writeBinding({}, '__proto__.polluted', true), {});
  assert.equal({}.polluted, undefined);
  for (const expression of ['({...x})', 'new Date()', '/x/', 'fn()', 'items.map(x => x.constructor())']) {
    assert.throws(() => evaluate(expression, scope));
  }
});

test('template props preserve data identity, including through State', () => {
  const series = [{ day: 'Mon', count: 3 }];
  const scope = { series, state: { series } };
  const registry = { Probe: () => null };
  assert.strictEqual(evaluate('series', scope), series);
  const element = renderTemplate('<Probe data={series} $other="series" />', scope, registry);
  assert.strictEqual(element.props.data, series);
  assert.strictEqual(element.props.other, series);
  let received;
  const Probe = props => { received = props; return null; };
  const tree = renderTemplate('<State initial={{ query: "" }}><Probe data={state.series} other={series} /></State>', scope, { ...widgetRegistry, Probe });
  renderToStaticMarkup(React.createElement(WidgetActionProvider, { state: scope.state }, tree));
  assert.strictEqual(received.data, series);
  assert.strictEqual(received.other, series);
});

test('functions returned by whitelisted methods are removed at prop and child boundaries', () => {
  const items = [() => 1];
  const registry = { Probe: () => null };
  const element = renderTemplate('<Probe value={items.find(x => true)} $other="items.at(0)">{items.find(x => true)}</Probe>', { items }, registry);
  assert.equal(element.props.value, undefined);
  assert.equal(element.props.other, undefined);
  assert.equal(element.props.children, undefined);
  const children = renderTemplate('<Probe>{items}</Probe>', { items: [items[0], [items[0], 'kept']] }, registry);
  assert.deepEqual(children.props.children, [null, [null, 'kept']]);
});

test('format supports all styles, locale, digits and sign options', () => {
  const cases = [
    ['format(1234.56)', '1,234.56'], ['format(1234, "number")', '1,234'],
    ['format(1200, "compact")', '1.2K'], ['format(12.5, "currency")', '$12.50'],
    ['format(0.25, "percent")', '25%'], ['format(12.5, "decimal")', '12.5'],
    ['format(12.345, "number", {digits: 2, minDigits: 2, sign: "always"})', '+12.35'],
    ['format(12, "currency", { currency: "EUR", locale: "de-DE" })', '12,00 €'],
    ['format(0, "number", {sign: "exceptZero"})', '0'], ['format(-2, "number", {sign: "never"})', '2'],
    ['format(1 / 0)', ''], ['format("invalid")', ''],
  ];
  for (const [expression, expected] of cases) assert.equal(evaluate(expression, {}), expected, expression);
});

test('formatDate supports every style and preserves calendar dates in negative time zones', () => {
  const cases = [
    ['short', 'Sep 26'], ['medium', 'Sep 26, 2026'], ['long', 'September 26, 2026'],
    ['weekday', 'Sat, Sep 26'], ['iso', '2026-09-26'], ['time', '12:00 AM'], ['datetime', 'Sep 26, 12:00 AM'],
  ];
  for (const [style, expected] of cases) {
    assert.equal(evaluate(`formatDate("2026-09-26", "${style}", {timeZone: "America/Los_Angeles"})`, {}), expected);
  }
  assert.equal(evaluate('formatDate("2026-09-26")', {}), 'Sep 26, 2026');
  assert.equal(evaluate('formatDate("2026-09-26T15:04:00Z", "time", { timeZone: "UTC" })', {}), '3:04 PM');
  assert.equal(evaluate('formatDate(1790435040000, "iso")', {}), '2026-09-26');
  assert.equal(evaluate('formatDate("2026-09-26", "short", {locale: "fr-FR"})', {}), '26 sept.');
  for (const value of ['invalid', '2026-02-30', null]) assert.equal(evaluate('formatDate(value)', { value }), '');
  assert.equal(evaluate('formatDate(now() + 3 * 86400000, "relative")', {}), 'in 3 days');
  assert.equal(evaluate('formatDate(now() - 2 * 3600000, "relative")', {}), '2 hours ago');
  for (const [duration, unit] of [[1000, 'second'], [60000, 'minute'], [3600000, 'hour'], [86400000, 'day'], [604800000, 'week'], [2592000000, 'month'], [31536000000, 'year']]) {
    assert.equal(evaluate(`formatDate(now() + ${duration * 3}, "relative")`, {}), `in 3 ${unit}s`);
  }
});

test('aggregate, sort, range and numeric helpers preserve data', () => {
  const scope = { items: [{ stats: { amount: 3 } }, { stats: { amount: 1 } }, { stats: { amount: null } }, { stats: { amount: Infinity } }] };
  assert.equal(evaluate('sum(items, "stats.amount")', scope), 4);
  assert.equal(evaluate('avg(items, "stats.amount")', scope), 2);
  assert.equal(evaluate('sum([1, 2, 3])', {}), 6);
  assert.equal(evaluate('avg([])', {}), 0);
  assert.deepEqual(evaluate('sortBy([3, null, 1, undefined], undefined, "desc")', {}), [3, 1, null, undefined]);
  assert.deepEqual(evaluate('sortBy(["b", "a"])', {}), ['a', 'b']);
  assert.deepEqual(evaluate('sortBy(items, "rank")', { items: [{ id: 'a', rank: 1 }, { id: 'b', rank: 1 }, { id: 'c', rank: 0 }] }).map(x => x.id), ['c', 'a', 'b']);
  assert.equal(scope.items[0].stats.amount, 3);
  assert.deepEqual(evaluate('range(4)', {}), [0, 1, 2, 3]);
  assert.deepEqual(evaluate('range(2, 7, 2)', {}), [2, 4, 6]);
  assert.deepEqual(evaluate('range(3, 0, -1)', {}), [3, 2, 1]);
  assert.equal(evaluate('size(range(10000))', {}), 1000);
  assert.throws(() => evaluate('range(0, 4, 0)', {}), /nonzero/);
  assert.equal(evaluate('clamp(12, 0, 10)', {}), 10);
  assert.equal(evaluate('abs(-3)', {}), 3);
  assert.equal(evaluate('pluralize(1, "item")', {}), '1 item');
  assert.equal(evaluate('pluralize(3000, "item")', {}), '3,000 items');
  assert.equal(evaluate('pluralize(2, "person", "people")', {}), '2 people');
});

test('theme follows the renderer and cannot be shadowed by data or Scope', () => {
  for (const theme of ['light', 'dark']) {
    assert.match(render('<Card><Scope values={{ __widgetTheme: "fake", theme: "fake" }}><Text value={theme()} /></Scope></Card>', { __widgetTheme: 'fake' }, theme), new RegExp(`>${theme}</`));
  }
});

test('Show chooses only the first true branch and ignores missing ElseIf conditions', () => {
  const template = '<Card><Show when={main}><Text value="MAIN" /><Show.ElseIf><Text value="MISSING" /></Show.ElseIf><Show.ElseIf when={first}><Text value="FIRST" /></Show.ElseIf><Show.ElseIf $when="second"><Text value="SECOND" /></Show.ElseIf><Show.Else><Text value="FALLBACK" /></Show.Else></Show><Show.ElseIf when={true}><Text value="OUTSIDE" /></Show.ElseIf></Card>';
  for (const [data, expected] of [[{ main: true, first: true }, 'MAIN'], [{ first: true, second: true }, 'FIRST'], [{ second: true }, 'SECOND'], [{}, 'FALLBACK']]) {
    const html = render(template, data);
    assert.match(html, new RegExp(expected));
    for (const label of ['MAIN', 'MISSING', 'FIRST', 'SECOND', 'FALLBACK', 'OUTSIDE'].filter(x => x !== expected)) assert.doesNotMatch(html, new RegExp(label));
  }
  assert.match(render('<Card><Show><Text value="present" /><Show.ElseIf when={true}><Text value="wrong" /></Show.ElseIf></Show></Card>'), /present/);
});

test('State defaults are visible as identifiers and state properties in SSR; host values win', () => {
  const template = '<State initial={{ query: "DEFAULT", done: true, mode: "week" }}><Card><Text value={query} /><Text value={state.query} /><Input bind="query" /><Checkbox bind="done" /><SegmentedControl bind="mode" options={[{ label: "Week", value: "week" }, { label: "Month", value: "month" }]} /></Card></State>';
  const defaults = render(template);
  assert.equal((defaults.match(/>DEFAULT</g) ?? []).length, 2);
  assert.match(defaults, /value="DEFAULT"/);
  assert.match(defaults, /role="checkbox"[^>]*aria-checked="true"/);
  assert.match(defaults, /aria-checked="true"[^>]*>Week</);
  const host = render(template, { query: 'HOST', done: false, mode: 'month' });
  assert.match(host, /value="HOST"/);
  assert.doesNotMatch(host, /DEFAULT/);
  assert.match(host, /role="checkbox"[^>]*aria-checked="false"/);
  assert.match(host, /aria-checked="true"[^>]*>Month</);
});

test('nested State defaults layer correctly and do not deep-merge present host keys', () => {
  const template = '<State initial={{ query: "OUTER", other: "KEEP" }}><Card><State initial={{ query: "INNER" }}><Text value={query} /><Text value={state.query} /><Text value={other} /><Input bind="query" /></State></Card></State>';
  const html = render(template);
  assert.match(html, /value="INNER"/);
  assert.match(html, /KEEP/);
  assert.doesNotMatch(html, /OUTER/);
  assert.match(render(template, { query: 'HOST' }), /value="HOST"/);
  assert.deepEqual(seedStateDefaults({ filters: {} }, { filters: { status: 'open' } }), { filters: {} });
  assert.deepEqual(seedStateDefaults({ query: null }, { query: 'fallback' }), { query: null });
  assert.match(render('<Card><Scope values={{ label: "SCOPED" }}><State initial={{ count: 0 }}><Text value={label} /></State></Scope></Card>', { label: 'HOST' }), /SCOPED/);
});

test('all bound controls accept host values and explicit controlled props take precedence', () => {
  const options = '[{ label: "Alpha", value: "a" }, { label: "Beta", value: "b" }]';
  const templates = [
    '<Input bind="choice" />', '<Textarea bind="choice" />', `<Select bind="choice" options={${options}} />`,
    `<RadioGroup bind="choice" options={${options}} />`, `<Combobox bind="choice" options={${options}} />`,
    '<InputOTP bind="code" />', '<DatePicker bind="date" />', `<ChipGroup bind="choice" options={${options}} />`,
    `<ToggleGroup bind="choices" type="multiple" options={${options}} />`, `<SegmentedControl bind="choice" options={${options}} />`,
    '<Toggle bind="enabled" label="Enabled" />', '<Toggle bind="enabled" variant="switch" label="Enabled" />',
    '<Slider bind="amount" />', '<Slider bind="bounds" />', '<Collapsible bind="enabled" title="Details" content="Expanded" />',
    '<Tabs bind="choice" tabs={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]}><Tabs.Panel id="b"><Text value="Chosen panel" /></Tabs.Panel></Tabs>',
    '<BaseCarousel bind="slide"><BaseCarousel.Item><Text value="First" /></BaseCarousel.Item><BaseCarousel.Item><Text value="Second" /></BaseCarousel.Item></BaseCarousel>',
  ];
  const data = { choice: 'b', choices: ['a', 'b'], code: '123456', date: '2026-09-26', enabled: true, amount: 30, bounds: [20, 80], slide: 1 };
  for (const template of templates) assert.ok(render(`<Card><Form>${template}</Form></Card>`, data).length > 0, template);
  const controlled = render('<Card><Input bind="query" value="CONTROLLED" /><Checkbox bind="enabled" checked={false} /><Toggle bind="enabled" pressed={false} label="Off" /></Card>', { query: 'BOUND', enabled: true });
  assert.match(controlled, /value="CONTROLLED"/);
  assert.match(controlled, /aria-checked="false"/);
  assert.match(controlled, /aria-pressed="false"/);
  assert.match(render('<Card><Input bind="filters.query" /></Card>', { filters: { query: 'NESTED' } }), /id="filters-query"[^>]*name="filters.query"[^>]*value="NESTED"/);
});

test('binding writes use immutable nested patches and normalize only Slider state values', () => {
  const before = { items: [{ done: false }], filters: { query: '' } };
  const next = writeBinding(before, 'items.0.done', true);
  assert.equal(next.items[0].done, true);
  assert.equal(before.items[0].done, false);
  assert.equal(next.filters, before.filters);
  assert.deepEqual(seedBindingDefault({}, 'filters.query', 'fallback', { filters: { query: 'query', status: 'open' } }), { filters: { query: 'query', status: 'open' } });
  assert.deepEqual(seedBindingDefault({ filters: { query: 'host' } }, 'filters.query', 'fallback', { filters: { query: 'query', status: 'open' } }), { filters: { query: 'host' } });
  assert.equal(writeBinding(next, 'filters.query', 'release').filters.query, 'release');
  assert.equal(writeBinding({}, 'amount', normalizeSliderBinding([42])).amount, 42);
  assert.deepEqual(writeBinding({}, 'amount', normalizeSliderBinding([20, 80])).amount, [20, 80]);
  assert.deepEqual(buildChangePayload('amount', [42]), { amount: [42], value: [42] });
  assert.deepEqual(seedStateDefaults({ query: 'arrived meanwhile' }, { query: 'default' }), { query: 'arrived meanwhile' });
});

test('State supplies runtime defaults to direct React children and deferred actions', () => {
  let action;
  const Probe = props => { action = props.onClickAction; return null; };
  const tree = renderTemplate('<State initial={{ query: "seed" }}><Probe $onClickAction="{ type: \'send_message\', payload: { text: state.query } }" /></State>', {}, { ...widgetRegistry, Probe });
  renderToStaticMarkup(React.createElement(WidgetActionProvider, { state: {} }, tree));
  assert.equal(resolveDeferredActionExpression(action, { state: { query: 'latest' } }).payload.text, 'latest');
  const html = renderToStaticMarkup(React.createElement(WidgetActionProvider, { state: {} }, React.createElement(State, { initial: { query: 'direct' } }, React.createElement(widgetRegistry.Input, { bind: 'query' }))));
  assert.match(html, /value="direct"/);
});

test('documented live filter renders realistic data and its empty branch', () => {
  const guide = readFileSync(new URL('../public/AGENTS.md', import.meta.url), 'utf8');
  const example = guide.split('## Example: live filter (State + bind)')[1].split('\n## Example:')[0];
  const template = example.match(/```\n([\s\S]*?)```/)[1];
  const data = JSON.parse(example.match(/```json\n([\s\S]*?)```/)[1]);
  const html = render(template, data);
  assert.match(html, /3 tasks · 4.5 hours/);
  assert.match(html, /Review checkout flow/);
  assert.match(render(template, { ...data, query: 'not found' }), /No matching tasks/);
  assert.match(render(template, { ...data, status: 'done' }), /1 task · 1 hours/);
});


test('every component documentation example renders without errors', async () => {
  const source = readFileSync(new URL('../src/docs/componentExamples.ts', import.meta.url), 'utf8')
    .replace('"@/widget/iconNames"', JSON.stringify(new URL('../packages/widgets/dist/widget/iconNames.js', import.meta.url).href))
    .replace('"zod"', JSON.stringify(import.meta.resolve('zod')));
  const compiled = stripTypeScriptTypes(source);
  const { componentExamples } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  for (const [name, example] of Object.entries(componentExamples)) {
    const html = renderToStaticMarkup(React.createElement(WidgetRenderer, example));
    assert.doesNotMatch(html, /Template error|Schema validation failed/, name);
    assert.ok(html.length > 0, name);
  }
});


test('a binding write stays local and is visible to a following deferred notification', () => {
  let write;
  let dispatch;
  let state = { query: 'before' };
  const notifications = [];
  const Probe = () => {
    [, write] = useWidgetStateBinding('query', '');
    dispatch = useWidgetAction();
    return null;
  };
  renderToStaticMarkup(React.createElement(WidgetActionProvider, {
    state,
    onStateChange: updater => { state = updater(state); },
    onAction: action => notifications.push(action)
  }, React.createElement(Probe)));
  write('after');
  assert.deepEqual(state, { query: 'after' });
  assert.deepEqual(notifications, []);
  dispatch({ __widgetActionExpression: '{ type: "send_message", payload: { text: state.query } }', scope: {} });
  assert.equal(notifications[0].payload.text, 'after');
  assert.equal(notifications[0].type, 'send_message');
});
