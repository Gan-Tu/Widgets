import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WidgetRenderer } from '../packages/widgets/dist/widget/WidgetRenderer.js';
import { widgetRegistry } from '../packages/widgets/dist/widget/registry.js';
import { formatNumber } from '../packages/widgets/dist/widget/format.js';
import { evaluateTemplateExpression } from '../packages/widgets/dist/widget/renderer/templateEngine.js';

const render = (template, data = {}, props = {}) => {
  const html = renderToStaticMarkup(React.createElement(WidgetRenderer, { template, data, ...props }));
  assert.doesNotMatch(html, /Template error|Schema validation failed/);
  return html;
};

test('Text numeric, marker, decoration, whitespace, and strong props', () => {
  const html = render('<Text value="123  456" tabularNums underline highlight preserveWhitespace strong />');
  for (const pattern of [/font-variant-numeric:tabular-nums/, /text-decoration:underline/, /white-space:pre-wrap/, /font-weight:600/, /<mark class="wg-highlight">123  456<\/mark>/]) assert.match(html, pattern);
  assert.match(render('<Text value="Explicit" weight="normal" strong />'), /font-weight:400/);
  assert.match(render('<Text value="Both" underline lineThrough />'), /text-decoration:line-through underline/);
  assert.match(render('<Title value="123" tabularNums italic />'), /font-variant-numeric:tabular-nums;font-style:italic/);
  const caption = render('<Caption value="123" tabularNums truncate maxLines={2} textAlign="end" />');
  for (const pattern of [/font-variant-numeric:tabular-nums/, /text-overflow:ellipsis/, /-webkit-line-clamp:2/, /text-align:right/]) assert.match(caption, pattern);
});

test('Stat and KeyValue values default to tabular numerals; Badge truncates with full title', () => {
  assert.match(render('<Stat label="Total" value="1,234" />'), /class="wg-tabular"[^>]*>1,234</);
  assert.match(render('<KeyValue rows={[{label: "Total", value: "1,234"}]} />'), /class="wg-tabular"[^>]*>1,234</);
  const badge = render('<Badge label="A long descriptive label" maxWidth={100} />');
  assert.match(badge, /title="A long descriptive label"/);
  assert.match(badge, /max-width:100px/);
  assert.match(badge, /wg-badge-label/);
});

test('loading buttons retain label, show spinner, and do not become faded disabled controls', () => {
  for (const variant of ['solid', 'soft', 'outline', 'ghost']) {
    const html = render(`<Button label="Saving" loading iconStart="check" variant="${variant}" color="danger" />`);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /wg-button-spinner/);
    assert.match(html, /animate-spin/);
    assert.match(html, /<span>Saving<\/span>/);
    assert.doesNotMatch(html, /disabled=""|<svg/);
  }
});

test('Checkbox checklist label and circle shape', () => {
  const html = render('<Checkbox label="Packed" checked lineThrough shape="circle" />');
  assert.match(html, /data-shape="circle"/);
  assert.match(html, /wg-checkbox-completed">Packed/);
  assert.doesNotMatch(render('<Checkbox label="To do" lineThrough />'), /wg-checkbox-completed/);
  assert.match(render('<Checkbox label="Square" />'), /data-shape="square"/);
});

test('invalid fields expose aria-invalid in light, dark, and glass', () => {
  for (const theme of ['light', 'dark']) for (const appearance of ['default', 'glass']) {
    for (const template of ['<Input invalid />', '<Textarea invalid />', '<Select invalid options={[{value: "a", label: "A"}]} />']) {
      assert.match(render(template, {}, { theme, appearance }), /aria-invalid="true"/);
    }
  }
  assert.doesNotMatch(render('<Input />'), /aria-invalid/);
});

test('Slider ticks, edge labels, and both range thumbs', () => {
  const html = render('<Slider value={[20,80]} marks={[0,{value:50,label:"Middle"},{value:100,label:"Max"}]} />');
  assert.equal((html.match(/class="wg-slider-tick"/g) ?? []).length, 3);
  assert.match(html, /left:50%;transform:translateX\(-50%\).*?>Middle/);
  assert.match(html, /left:100%;transform:translateX\(-100%\).*?>Max/);
  assert.equal((html.match(/role="slider"/g) ?? []).length, 2);
  assert.doesNotMatch(render('<Slider marks={[0,50,100]} />'), /wg-slider-labels/);
});

test('Box, Row, and Col clip and scroll with independent gaps', () => {
  for (const tag of ['Box', 'Row', 'Col']) {
    const html = render(`<${tag} clip scrollable rowGap={2} columnGap={3} maxHeight={100}><Text value="Content" /></${tag}>`);
    for (const pattern of [/overflow:hidden/, /overflow-y:auto/, /row-gap:0\.5rem/, /column-gap:0\.75rem/, /max-height:100px/, /wg-scrollable/]) assert.match(html, pattern);
  }
  assert.match(render('<Box scrollable="x" />'), /overflow-x:auto/);
});

test('Grid responsive child width overrides columns and supports row templates', () => {
  const html = render('<Grid columns={9} minChildWidth={180} rows={2} rowGap={3} columnGap={4} />');
  assert.match(html, /grid-template-columns:repeat\(auto-fit, minmax\(min\(100%, 180px\), 1fr\)\)/);
  assert.match(html, /grid-template-rows:repeat\(2, auto\)/);
  assert.match(html, /row-gap:0\.75rem;column-gap:1rem/);
  assert.match(render('<Grid rows="auto 1fr" />'), /grid-template-rows:auto 1fr/);
});

test('Table empty Each, sticky headers, cell spans, sizing, and dividers', () => {
  const html = render(`<Table stickyHeader maxHeight={120} dividers={false} emptyLabel="No results">
    <Table.Row header><Table.Cell header colSpan={3}>Results</Table.Cell></Table.Row>
    <Each of={rows} item="row"><Table.Row><Table.Cell>{row.name}</Table.Cell></Table.Row></Each>
  </Table>`, { rows: [] });
  assert.match(html, /max-height:120px/);
  assert.match(html, /data-sticky-header="true" data-dividers="false"/);
  assert.match(html, /<thead><tr/);
  assert.match(html, /<td colSpan="3" class="wg-table-empty">No results<\/td>/);
  const cell = render('<Table><Table.Row><Table.Cell rowSpan={2} colSpan={3} vAlign="middle" width="25%">Cell</Table.Cell></Table.Row></Table>');
  assert.match(cell, /colSpan="3" rowSpan="2"/);
  assert.match(cell, /width:25%;vertical-align:middle/);
  assert.match(render('<Table><Table.Row><Table.Cell columnSpan={4} colSpan={2} width={120}>Cell</Table.Cell></Table.Row></Table>'), /colSpan="4"[^>]*width:120px/);
  assert.doesNotMatch(render('<Table emptyLabel="Nothing"><Table.Row><Table.Cell>Something</Table.Cell></Table.Row></Table>'), /Nothing/);
  const section = render('<Table stickyHeader><Table.Section label="Results"><Table.Row header><Table.Cell header>A</Table.Cell></Table.Row><Table.Row><Table.Cell>B</Table.Cell></Table.Row></Table.Section></Table>');
  assert.match(section, /<thead>[\s\S]*Results[\s\S]*A[\s\S]*<\/thead><tbody>[\s\S]*B/);
});

test('List decimal start and item lead, description, disabled state, and children', () => {
  const html = render('<List marker="decimal" start={4}><List.Item label="Review" description="Read the draft" disabled><Text value="Extra" /></List.Item></List>');
  assert.match(html, /counter-reset:widget-list-item 3/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /wg-list-label">Review<\/div><div class="wg-list-description">Read the draft<\/div>.*Extra/);
});

test('Popover close affordance and offset; Pressable preserves accessible content', () => {
  const html = render('<Popover open><Popover.Trigger>Details</Popover.Trigger><Popover.Content showCloseButton sideOffset={16}>More</Popover.Content></Popover>');
  assert.match(html, /aria-label="Close"/);
  assert.match(html, /calc\(100% \+ 16px\)/);
  assert.match(render('<Pressable tooltip="Copy value" onClickAction={{type:"copy",payload:{value:"42"}}}><Text value="Copy" /></Pressable>'), /role="button".*Copy/);
});

test('shared number formatter owns number, compact, currency, percent, affixes, and Phase 1 options', () => {
  for (const [value, style, options, expected] of [
    [1234.56, 'number', {}, '1,234.56'],
    [1200, 'compact', {}, '1.2K'],
    [12.5, 'currency', {}, '$12.50'],
    [12.5, 'currency', { currency: 'EUR' }, '€12.50'],
    [0.125, 'percent', { digits: 1 }, '12.5%'],
    [2, 'number', { minDigits: 2, sign: 'always' }, '+2.00'],
    [12.345, 'number', { digits: 1, prefix: '~', suffix: ' kg' }, '~12.3 kg'],
    [1234.5, 'number', { locale: 'de-DE' }, '1.234,5'],
  ]) {
    assert.equal(formatNumber(value, style, options), expected);
    assert.equal(formatNumber(value, style, { ...options, prefix: '[', suffix: ']' }), `[${formatNumber(value, style, { ...options, prefix: '', suffix: '' })}]`);
    assert.equal(evaluateTemplateExpression('format(value, style, options)', { value, style, options }), expected);
  }
  for (const value of [null, '12', NaN, Infinity]) assert.equal(formatNumber(value, 'number', { prefix: '$' }), '');
});

test('ScatterChart is registered and its lazy SSR skeleton and implementation render', async () => {
  assert.equal(typeof widgetRegistry.ScatterChart, 'function');
  const html = render('<ScatterChart data={points} xAxis={{dataKey:"price"}} series={[{dataKey:"rating",sizeKey:"reviews"}]} height={240} />', { points: [{ price: 90, rating: 4.5, reviews: 120 }] });
  assert.match(html, /wg-skeleton/);
  assert.match(html, /height:240px/);
  const { ScatterChartImpl } = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  assert.match(renderToStaticMarkup(React.createElement(ScatterChartImpl, { data: [], xAxis: { dataKey: 'price' }, series: [], height: 240 })), /height:240px/);
});

test('omitted axis gaps preserve the existing gap shorthand', () => {
  for (const tag of ['Box', 'Row', 'Col', 'Grid']) {
    const html = render(`<${tag} gap={4} />`);
    assert.match(html, /gap:1rem/);
    assert.doesNotMatch(html, /row-gap|column-gap/);
  }
});

// Capture the returned element tree while hooks run in a real SSR render.
// This inspects chart configuration before ChartFrame waits for browser measurement.
function capture(Component, props) {
  let tree;
  function Probe() { tree = Component(props); return null; }
  renderToStaticMarkup(React.createElement(Probe));
  return tree;
}
function elements(tree, Type) {
  if (!React.isValidElement(tree)) return [];
  return [...(tree.type === Type ? [tree] : []), ...React.Children.toArray(tree.props.children).flatMap(child => elements(child, Type))];
}

test('all chart types wire shared and per-series formats, axis domains/titles, and visibility', async () => {
  const impl = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  const { XAxis, YAxis, Tooltip, Bar, Scatter, ZAxis, BarChart } = await import('recharts');
  const base = { data: [{ name: 'A', price: 12, value: 0.5, reviews: 100 }], xAxis: { dataKey: 'name', label: 'Category' }, yAxis: { min: 0, max: 1, label: 'Share', tickCount: 3 }, valueFormat: 'currency', currency: 'EUR', valuePrefix: '~', valueSuffix: ' total', showYAxis: true, series: [{ dataKey: 'value', type: 'bar', valueFormat: 'percent', valuePrefix: '', valueSuffix: ' share' }] };
  for (const name of ['BarChartImpl', 'LineChartImpl', 'AreaChartImpl', 'ComposedChartImpl', 'PieChartImpl']) {
    const tree = capture(impl[name], base);
    const tooltip = elements(tree, Tooltip)[0];
    assert.equal(tooltip.props.formatter(0.5, 'Value', { dataKey: 'value' }), '50% share', name);
    assert.equal(tooltip.props.formatter(12, 'Other', { dataKey: 'other' }), '~€12.00 total', name);
    if (name === 'PieChartImpl') continue;
    const y = elements(tree, YAxis)[0].props;
    assert.deepEqual(y.domain, [0, 1]);
    assert.equal(y.tickCount, 3);
    assert.equal(y.tickFormatter(0.5), '50% share');
    assert.equal(y.label.value, 'Share');
    assert.equal(y.hide, false);
    assert.equal(elements(tree, XAxis)[0].props.label.value, 'Category');
    const hidden = capture(impl[name], { ...base, showYAxis: false, xAxis: { ...base.xAxis, hide: true } });
    assert.equal(elements(hidden, YAxis)[0].props.hide, true);
    assert.equal(elements(hidden, XAxis)[0].props.hide, true);
  }
  const horizontalBars = capture(impl.BarChartImpl, { ...base, layout: 'vertical', showYAxis: false, series: [{dataKey:'price', stack:'all'}, {dataKey:'value', stack:'all'}] });
  assert.equal(elements(horizontalBars, BarChart)[0].props.layout, 'vertical');
  assert.equal(elements(horizontalBars, YAxis)[0].props.type, 'category');
  assert.equal(elements(horizontalBars, YAxis)[0].props.hide, undefined);
  assert.equal(elements(horizontalBars, XAxis)[0].props.hide, true);
  assert.equal(elements(horizontalBars, Bar)[0].props.radius, 0);
  assert.deepEqual(elements(horizontalBars, Bar)[1].props.radius, [0, 5, 5, 0]);
  const scatter = capture(impl.ScatterChartImpl, { ...base, xAxis: {dataKey:'price',label:'Price',min:1,max:100}, series: [{...base.series[0], sizeKey:'reviews'}] });
  assert.equal(elements(scatter, YAxis)[0].props.hide, false);
  assert.deepEqual(elements(scatter, XAxis)[0].props.domain, [1,100]);
  assert.equal(elements(scatter, Scatter)[0].props.data[0].z, 100);
  assert.equal(elements(scatter, ZAxis)[0].props.name, 'reviews');
  assert.equal(elements(scatter, Tooltip)[0].props.formatter(0.5, 'Value', {dataKey:'y',payload:{seriesKey:'value'}}), '50% share');
  assert.equal(elements(scatter, Scatter)[0].props.fill, 'var(--widget-chart-5)');
});

test('loading prevents click and submit defaults', () => {
  for (const submit of [false, true]) {
    const button = capture(widgetRegistry.Button, {loading:true,submit,label:'Wait',onClickAction:{type:'copy',payload:{value:'x'}}});
    let prevented = false;
    button.props.onClick({preventDefault(){prevented = true;}});
    assert.equal(prevented, true);
  }
});

test('invalid glass border override retains priority over glass control paint', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../src/widget/widget.css', import.meta.url), 'utf8');
  assert.match(css, /\.widget-root\[data-appearance="glass"\] \.wg-input\[aria-invalid="true"\]:focus-visible\s*\{\s*border-color: var\(--widget-danger\) !important;/);
});

test('default Grid gap and Box clip/gap omit clearing style longhands', () => {
  const grid = render('<Grid gap={2}><Text value="Cell" /></Grid>');
  assert.match(grid, /gap:0\.5rem/);
  assert.doesNotMatch(grid, /row-gap|column-gap/);
  const box = render('<Box clip gap={3}><Text value="Content" /></Box>');
  assert.match(box, /gap:0\.75rem/);
  assert.match(box, /overflow:hidden/);
  assert.doesNotMatch(box, /row-gap|column-gap|overflow-x|overflow-y/);

  // Unlike SSR output, these assertions detect own keys whose values are undefined.
  for (const [name, props] of [['Grid', {gap:2}], ['Box', {clip:true,gap:3}]]) {
    const style = capture(widgetRegistry[name], props).props.style;
    for (const key of ['rowGap', 'columnGap', 'overflowX', 'overflowY']) assert.equal(Object.hasOwn(style, key), false, `${name}.${key}`);
  }
  const explicit = capture(widgetRegistry.Box, {clip:true,scrollable:'x',rowGap:2,columnGap:3}).props.style;
  assert.equal(explicit.overflow, 'hidden');
  assert.equal(explicit.overflowX, 'auto');
  assert.equal(explicit.rowGap, '0.5rem');
  assert.equal(explicit.columnGap, '0.75rem');
});

test('audited presentation styles omit unset keys and table cells preserve default alignment', async () => {
  for (const name of ['Text', 'Title', 'Caption', 'Badge', 'Button', 'Grid', 'Box', 'Table.Cell']) {
    const tree = capture(widgetRegistry[name], {value:'Text',label:'Label'});
    for (const [key, value] of Object.entries(tree.props.style)) assert.ok(value != null, `${name}.${key} must be omitted`);
  }
  const cell = capture(widgetRegistry['Table.Cell'], {});
  assert.equal(Object.hasOwn(cell.props.style, 'verticalAlign'), false);
  assert.doesNotMatch(cell.props.className, /align-top/);
  assert.match(render('<Table><Table.Row><Table.Cell vAlign="bottom">Cell</Table.Cell></Table.Row></Table>'), /vertical-align:bottom/);
  assert.doesNotMatch(render('<Table><Table.Row><Table.Cell>Cell</Table.Cell></Table.Row></Table>'), /vertical-align|align-top/);
  let content;
  function Probe() { content = widgetRegistry['Popover.Content']({ children:'Details' }); return null; }
  renderToStaticMarkup(React.createElement(widgetRegistry.Popover, {open:true}, React.createElement(Probe)));
  assert.equal(Object.hasOwn(content.props.style, 'paddingRight'), false);
  assert.ok(Object.values(content.props.style).every(value => value != null));

  const { LineChartImpl } = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  const frame = capture(LineChartImpl, {data:[],series:[],xAxis:{dataKey:'name'}});
  assert.ok(Object.values(capture(frame.type, frame.props).props.style).every(value => value != null));
  const fallback = capture(widgetRegistry.ScatterChart, {data:[],series:[],xAxis:{dataKey:'x'}}).props.fallback;
  assert.ok(Object.values(capture(fallback.type, fallback.props).props.style).every(value => value != null));
});

test('integer value ticks drop default decimals while tooltips and explicit precision are preserved', async () => {
  const { formatNumberTick } = await import('../packages/widgets/dist/widget/format.js');
  assert.equal(formatNumberTick(6000, 'currency'), '$6,000');
  assert.equal(formatNumberTick(6000.5, 'currency'), '$6,000.50');
  assert.equal(formatNumberTick(6000, 'currency', {minDigits:2}), '$6,000.00');
  assert.equal(formatNumberTick(6000, 'currency', {digits:2}), '$6,000.00');
  assert.equal(formatNumberTick(6000, 'currency', {prefix:'~',suffix:' / year'}), '~$6,000 / year');
  const impl = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  const { XAxis, YAxis, Tooltip } = await import('recharts');
  for (const name of ['BarChartImpl', 'LineChartImpl', 'AreaChartImpl', 'ComposedChartImpl', 'ScatterChartImpl']) {
    const tree = capture(impl[name], { data:[], xAxis:{dataKey:'x'}, series:[{dataKey:'y',type:'bar'}],valueFormat:'currency' });
    assert.equal(elements(tree, YAxis)[0].props.tickFormatter(6000), '$6,000', name);
    assert.equal(elements(tree, Tooltip)[0].props.formatter(6000, 'Value', {dataKey:'y',payload:{seriesKey:'y'}}), '$6,000.00', name);
  }
  const horizontal = capture(impl.BarChartImpl, {data:[],xAxis:{dataKey:'name'},series:[],layout:'vertical',valueFormat:'currency'});
  assert.equal(elements(horizontal, XAxis)[0].props.tickFormatter(6000), '$6,000');
});

test('cartesian bottom titles reserve axis and legend space without changing unlabeled charts', async () => {
  const impl = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  const { XAxis, Legend } = await import('recharts');
  const props = {data:[],series:[],xAxis:{dataKey:'month',label:'Month'}};
  for (const name of ['BarChartImpl', 'LineChartImpl', 'AreaChartImpl', 'ComposedChartImpl', 'ScatterChartImpl']) {
    const tree = capture(impl[name], props);
    const axis = elements(tree, XAxis)[0].props;
    assert.equal(axis.height, 56, name);
    assert.equal(axis.label.position, 'insideBottom', name);
    assert.equal(axis.label.offset, 8, name);
    assert.equal(elements(tree, Legend)[0].props.wrapperStyle.paddingTop, 8, name);
    const untitled = capture(impl[name], {...props,xAxis:{dataKey:'month'}});
    assert.equal(Object.hasOwn(elements(untitled, Legend)[0].props.wrapperStyle, 'paddingTop'), false, name);
  }
  const horizontal = capture(impl.BarChartImpl, {...props,layout:'vertical',showYAxis:true,yAxis:{label:'Revenue'}});
  assert.equal(elements(horizontal, XAxis)[0].props.height, 56);
  assert.equal(elements(horizontal, XAxis)[0].props.label.offset, 8);
  assert.equal(elements(horizontal, Legend)[0].props.wrapperStyle.paddingTop, 8);
});

test('scatter tooltip formats only y with chart units; x and size stay plain numbers', async () => {
  const { ScatterChartImpl } = await import('../packages/widgets/dist/widget/components/chartImpl.js');
  const { Tooltip } = await import('recharts');
  const tree = capture(ScatterChartImpl, {data:[],xAxis:{dataKey:'price'},series:[{dataKey:'rating',valueFormat:'percent',valueSuffix:' score'}],valueFormat:'currency',valuePrefix:'~',valueSuffix:' total'});
  const formatter = elements(tree, Tooltip)[0].props.formatter;
  assert.equal(formatter(6000, 'Price', {dataKey:'x',payload:{seriesKey:'rating'}}), '6,000');
  assert.equal(formatter(0.8, 'Rating', {dataKey:'y',payload:{seriesKey:'rating'}}), '~80% score');
  assert.equal(formatter(1200, 'Reviews', {dataKey:'z',payload:{seriesKey:'rating'}}), '1,200');
});

test('table surfaces stay unpainted, header separator remains, and light marker uses soft yellow', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../src/widget/widget.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\.wg-table\s*\{[^}]*background/);
  assert.match(css, /\.wg-table thead tr:last-child\s*\{[^}]*border-bottom:/);
  assert.match(css, /--widget-highlight: #fef08a;/);
  assert.match(css, /\[data-theme="dark"\]\s*\{ --widget-highlight: color-mix/);
});
