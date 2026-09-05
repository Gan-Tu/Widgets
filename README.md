# WidgetRenderer

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gan-Tu/Widgets)

A compact, schema-capable widget renderer for chat UIs. Pass a **Widget UI template string** + optional **Zod schema** + **data**, and it renders a small, opinionated widget with local client actions.

DeepWiki Docs: https://deepwiki.com/Gan-Tu/Widgets

To try generative widgets in ChatGPT, create a custom plugin with `https://genui.tugan.app/mcp` (no auth needed).


## What’s in this repo

- **Reusable renderer**: `WidgetRenderer` (published as `@tugan/widgets`)
- **Component library**: 142 registered components — containers, layout, typography, forms, charts, media, control flow, premium data display, and agent-native/workspace primitives (`ThinkingReasoning`, `StreamingText`, `ApprovalCard`, `AgentInput`, `RecordsTable`, `Flowchart`, and more), all themed by CSS design tokens with full light/dark support
- **Demo app**:
  - `/` — a monochrome SVG particle sculpture cycling through five forms, including a rotating braided knot, plus a live template-to-widget exhibit; the sculpture supports pause, pointer interaction, reduced motion, and automatic suspension offscreen or in hidden tabs
  - `/gallery` — 52 categorized, searchable pre-built widgets; opens on **Featured**, with category and search filters preserved in the URL (`?category=All` shows everything)
  - `/docs` — per-component docs with live examples, prop tables, deep links, and a searchable component sidebar
  - `/playground` — live template + JSON editing, plus AI widget generation using **`gpt-6-astra`** through the OpenAI Responses API; starts with **Checkout**, and Reset restores it. Explicit example/component links open the requested demo
- **Authoring guide**: [`public/AGENTS.md`](public/AGENTS.md) — the complete widget-authoring contract and design principles embedded into generation and repair prompts
- **Example corpus**: `public/WIDGET_EXAMPLES.md` — every gallery widget as a template + data pair, generated from `src/examples/widgetExamples.ts` (regenerate with `node --experimental-strip-types scripts/build-widget-examples-doc.mjs`); an optional download for richer LLM context
- **Featured example corpus**: `public/FEATURED_WIDGET_EXAMPLES.md` — the smaller, gallery-ranked featured set linked beside `AGENTS.md` in the navbar and used by Playground AI generation

Built with **React**, **Tailwind v4**, **shadcn/ui** and **Radix** primitives, **Recharts** (lazy-loaded), and **Motion** (`motion/react`).

The agent-native and workspace primitives are independent implementations inspired by interaction concepts in the current [AIcss](https://www.aicss.dev/) and [Beautiful UI](https://www.beautifului.dev/) catalogs. No source code or assets from either project are copied.

## Design principles

Compose a compact widget around one useful task. Start with the existing components and shadcn variants; character should come from content, hierarchy, imagery, and spacing.

- Use crisp white surfaces and near-black text in light mode, with theme tokens for dark mode. Separate groups with spacing or a fine divider; avoid nested gray panels, heavy outlines, and decorative glass effects.
- Keep button borders subtle or use ghost actions. Give the primary action prominence and selected controls an unmistakable filled state. Keep icon buttons square and centered.
- Use regular body and timeline text, medium weight for the active step, and stronger type only for headings and key values. Callouts and quotes have no decorative left stripe.
- Use the vivid chart palette independently of the neutral UI: **blue** for one series, **yellow + green** for two, **blue + green + pinkish red** for three. Larger sets add purple and orange; do not pair yellow and orange. Keep tooltip text neutral.
- Fit the available width: allow form fields to shrink or stack, align media and captions to one gutter, and use one full carousel slide at compact widths. Carousel navigation remains visible when content overflows.
- Keep keyboard focus visible without heavy black rings: fields emphasize their border; other controls use one muted indicator. Verify selected, disabled, empty, long-content, narrow-width, and dark-theme states.

The [authoring guide’s design guidelines](public/AGENTS.md#design-guidelines) explain composition, spacing, chart colors, media, and interaction details for template authors. Shared rendering fixes belong in the primitive or its tokens so every widget benefits.

## Install (for use in your app)

```bash
npm install @tugan/widgets
```

Import the styles once in your app entry:

```ts
import "@tugan/widgets/styles.css";
```

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, then visit `/gallery`, `/docs`, or `/playground`.

## Basic usage (embed in your app)

```tsx
import "@tugan/widgets/styles.css";
import { WidgetRenderer } from "@tugan/widgets";
import WidgetSchema from "./schema";

export function WidgetMessage() {
  return (
    <WidgetRenderer
      template={templateString}
      schema={WidgetSchema}
      data={widgetData}
      onAction={(action, formData) => {
        console.log("action", action);
        console.log("formData", formData);
      }}
    />
  );
}
```

## `WidgetRenderer` props

- **`template: string`**: Widget UI template (a strict JSX-like language)
- **`schema?: z.ZodTypeAny`**: optional Zod schema for widget data (validated before render when provided)
- **`data: unknown`**: widget state/data; when `schema` is provided, it must match the schema. Keep the reference stable between renders (memoize it) — passing a fresh object each render resets widget-local state
- **`onAction?: (action, formData?) => void`**: receives declarative actions, optional captured form state, and client-action results
- **`theme?: "light" | "dark"`**: force theme for the widget subtree
- **`appearance?: "default" | "glass"`**: override the host's visual material; defaults to standard styling. Glass requires the optional stylesheet below
- **`debug?: boolean`**: render validated data under the widget

## Template rules (the important bits)

- **Text props or children**: text-bearing components prefer `value`/`label`, but simple text children are also supported.

```tsx
// valid
<Text value="Hello" />
<Button label="Continue" onClickAction={{ type: "flow.continue" }} />

// also valid
<Text>Hello</Text>
<Button onClickAction={{ type: "flow.continue" }}>Continue</Button>
```

- **Declarative logic only**: bindings (`{title}`), conditions (`{ok ? <Badge ... /> : null}`), `.map(...)` loops, and DIL-style `$` expression props like `$value="item.label"`.
- **No arbitrary JS**: the template engine is intentionally conservative for safety and predictability.
- **Dotted child components are supported**: use names like `<BaseCarousel.Item>`, `<Table.Row>`, `<Table.Cell>`, `<Popover.Trigger>`, and `<Show.Else>`.
- **Client actions run locally**: `copy`, `add_to_calendar`, `request_location_permission`, `open_url`, `email.mailto`, and `card.open`. Other actions are forwarded to the host through `onAction`.

## DIL-style control flow

```tsx
<Each $of="state.items" item="item">
  <Text $value="item.label" />
</Each>

<Show $when="size(state.items) > 0">
  <Text value="Loaded" />
  <Show.Else>
    <Text value="Empty" />
  </Show.Else>
</Show>
```

## Client action example

```tsx
<Button
  label="Copy code"
  onClickAction={{
    type: "copy",
    handler: "client",
    payload: { value: "WIDGETS-2026" }
  }}
/>
```

Local widget state is also supported without a server round-trip via `updateState`, `replaceState`, and `patchState` action fields (see `public/AGENTS.md` → "Actions & state").

Server-side actions are intentionally host-owned. See `SERVER_SIDE_ACTION_PLAN.md` for the recommended Express/API integration contract.

## Where to look in code

- **Renderer**: `src/widget/WidgetRenderer.tsx`
- **Template engine**: `src/widget/renderer/templateEngine.tsx`
- **Widget components**: `src/widget/components/*`
- **Shared UI primitives**: `src/components/ui/*`
- **Theme tokens and portal theme context**: `src/widget/widget.css` + `src/widget/theme.tsx`
- **Automatic chart combinations**: `src/widget/chartPalette.ts`
- **Registry**: `src/widget/registry.ts`
- **Example widgets**: `src/examples/widgetExamples.ts`
- **Featured selection and ordering**: `src/examples/featuredExamples.ts`
- **Component documentation and live demos**: `src/docs/componentDocs.ts` + `src/docs/componentExamples.ts`
- **Gallery presentation**: `src/components/gallery/*` + `src/pages/gallery.css`
- **Demo routes**: `src/pages/*` + `src/App.tsx`

## Extending the system

The published `WidgetRenderer` is intentionally a fixed DIL/component surface: package consumers cannot pass custom/client-defined widget components into the renderer. To add built-in components for this library itself:

1. Add a component under `src/widget/components/*`
2. Register it in `src/widget/registry.ts`
3. Mirror the name in `api/widget-component-names.js` and document it in `public/AGENTS.md` — `npm test` enforces that all three stay in sync
4. Add the component's documentation and live example to `src/docs/componentDocs.ts` and `src/docs/componentExamples.ts`
5. Add or update a composed gallery example in `src/examples/widgetExamples.ts` when it demonstrates a useful pattern
6. Regenerate the example docs and run the checks below. If the registry or gallery count changes, update the counts in both READMEs and the demo metadata; the tests flag stale counts

## Keeping authoring docs in sync

Edit the authoring contract and design guidance in `public/AGENTS.md`. Edit gallery templates and data in `src/examples/widgetExamples.ts`, then regenerate both public example files:

```bash
node --experimental-strip-types scripts/build-widget-examples-doc.mjs
```

Do not hand-edit `public/WIDGET_EXAMPLES.md` or `public/FEATURED_WIDGET_EXAMPLES.md`. The generator preserves template/data pairs, filters Featured entries, and applies their gallery ordering. Playground generation and repair load **AGENTS + Featured examples**; the full corpus is available for larger contexts. The generated introductions link back to the design guidance instead of maintaining a second set of rules.

## Testing

```bash
npm test
npm run build
npm run lint
```

`npm test` builds the package and runs gallery render smoke tests, form-default and accessibility checks, chart-palette and theme-contrast checks, registry/manifest/authoring-guide parity, and documentation synchronization checks. The other commands build the demo and lint the source. For visual changes, also inspect the affected widgets in the browser at compact and wide widths, in both themes, with mouse and keyboard interaction.

## Theming

Widget design tokens are declared in `src/widget/widget.css` and included in the package's `styles.css`. Load host overrides after the package styles, for example:

```css
.widget-root {
  --widget-font-sans: "Inter", system-ui, sans-serif;
  --widget-radius: 12px;
}
```

For mode-specific overrides, use `.widget-root[data-theme="light"]` and `.widget-root[data-theme="dark"]`. Popovers, menus, dialogs, and other widget portals receive the widget's theme and `.widget-root` scope too; a selector tied only to an ancestor around the embedded card will not reach a portal rendered under `body`.

If changing the action accent, coordinate `--widget-accent`, its strong/soft/border variants, and `--widget-on-accent` to preserve readable text and state contrast. Chart colors use separate `--widget-chart-1` through `--widget-chart-6` tokens; their numbers identify palette entries, not series order. Pie charts choose combinations by slice count. See the [chart reference](public/AGENTS.md#charts) for the palette and automatic combinations.

### Experimental liquid glass

Import the optional material layer after the base stylesheet, then choose the appearance on the renderer. Templates, data, actions, and the authoring output format stay the same:

```tsx
import "@tugan/widgets/styles.css";
import "@tugan/widgets/liquid-glass.css";
import { WidgetRenderer } from "@tugan/widgets";

<WidgetRenderer template={template} data={data} appearance="glass" theme="light" />
```

For one preference across a host app, wrap its renderers in the exported `WidgetAppearanceProvider`:

```tsx
import { WidgetAppearanceProvider } from "@tugan/widgets";

<WidgetAppearanceProvider appearance={glassEnabled ? "glass" : "default"}>
  <WidgetRenderer template={template} data={data} />
</WidgetAppearanceProvider>
```

An explicit renderer `appearance` overrides the provider. Switching appearance preserves local widget and form state. Light/dark theme remains independent, and menus, popovers, tooltips, sheets, and dialogs inherit both settings. The demo's **Glass** toggle applies to every route and remembers the choice in local storage; standard styling remains the default.

The effect uses frosted backgrounds, backdrop blur, edge highlights, and restrained shadows. Text, images, and chart marks stay sharp. It works best over a subtle background with some color or detail; the demo provides one. `prefers-reduced-transparency` and increased-contrast preferences use solid surfaces, and browsers without backdrop-filter get an opaque fallback. This experimental mode approximates the supplied references with CSS.

The optional stylesheet lives in `src/widget/liquid-glass.css`; demo backgrounds and chrome live separately in `src/styles/glass-demo.css`. The package build copies the material stylesheet to its own export, so importing only `styles.css` keeps the existing appearance.

Material hierarchy follows [Apple's Liquid Glass guidance](https://developer.apple.com/videos/play/wwdc2025/219/): tint emphasizes primary actions, and a group shares one optical layer. Outer Cards, token-backed Boxes, and agent/workspace panels receive the frosted pane; nested panels use a thin matte wash, and deeper groups stay clear. Floating menus begin a fresh, denser pane. Tables share their container's finish, with one tint for selected columns. Labels, images, and chart marks stay sharp. Built-in components identify painted surfaces through the internal `data-widget-surface` hook; this adds no template props.

Ordinary glass buttons use a nearly clear neutral material with readable text and subtle edges; semantic colors are faint accents. Ghost actions stay clear at rest. Panels and controls use actual alpha transparency with backdrop blur on the outer layer, while gradients are limited to a faint highlight. Hover gently strengthens the material; pressing adds an inset highlight and a small compression. Disabled controls retain their disabled treatment. Solid surfaces remain available for reduced-transparency/high-contrast preferences. Use surface tokens for automatic material treatment; explicit photo/brand backgrounds remain authored content. The implementation avoids nested blur boundaries, which [MDN explains can prevent a child from sampling the page backdrop](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter#backdrop_root).

## License and project boundaries

The code and documentation in this repository, including the `@tugan/widgets`
package and the public demo/generator implementation, are licensed under the
[Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution.

The license covers only material distributed in this repository and package.
It does not grant rights to private infrastructure, credentials, hosted-service
data, or separately distributed proprietary products. It also does not grant
permission to use project names, package names, logos, or other branding except
as required for reasonable and customary attribution.
