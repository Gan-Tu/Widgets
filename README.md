# WidgetRenderer

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gan-Tu/Widgets)

A compact, schema-capable widget renderer for chat UIs. Pass a **Widget UI template string** + optional **Zod schema** + **data**, and it renders a small, opinionated widget with local client actions.

DeepWiki Docs: https://deepwiki.com/Gan-Tu/Widgets

To try generative widgets in ChatGPT, create a custom plugin with `https://genui.tugan.app/mcp` (no auth needed).


## What’s in this repo

- **Reusable renderer**: `WidgetRenderer` (published as `@tugan/widgets`)
- **Component library**: 142 registered components — containers, layout, typography, forms, charts, media, control flow, premium data display, and agent-native/workspace primitives (`ThinkingReasoning`, `StreamingText`, `ApprovalCard`, `AgentInput`, `RecordsTable`, `Flowchart`, and more), all themed by CSS design tokens with full light/dark support
- **Demo app**:
  - `/gallery` — 52 categorized, searchable pre-built widgets
  - `/docs` — per-component docs with live examples, prop tables, and deep links
  - `/playground` — live template + JSON editing, plus AI widget generation (OpenAI-backed)
- **Authoring guide**: `public/AGENTS.md` — the complete widget-authoring contract embedded into the generation prompt
- **Example corpus**: `public/WIDGET_EXAMPLES.md` — every gallery widget as a template + data pair, generated from `src/examples/widgetExamples.ts` (regenerate with `node --experimental-strip-types scripts/build-widget-examples-doc.mjs`); an optional download for richer LLM context

Built with **React**, **Tailwind v4**, **shadcn/ui-style primitives**, **Recharts** (lazy-loaded), and **Motion** (`motion/react`).

The agent-native and workspace primitives are independent implementations inspired by interaction concepts in the current [AIcss](https://www.aicss.dev/) and [Beautiful UI](https://www.beautifului.dev/) catalogs. No source code or assets from either project are copied.

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
- **`debug?: boolean`**: render validated data under the widget

## Template rules (the important bits)

- **Text props or children**: text-bearing components prefer `value`/`label`, but simple text children are also supported.

```tsx
// valid
<Text value="Hello" />
<Button label="Continue" />

// also valid
<Text>Hello</Text>
<Button>Continue</Button>
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
- **Registry**: `src/widget/registry.ts`
- **Example widgets**: `src/examples/widgetExamples.ts`
- **Demo routes**: `src/pages/*` + `src/App.tsx`

## Extending the system

The published `WidgetRenderer` is intentionally a fixed DIL/component surface: package consumers cannot pass custom/client-defined widget components into the renderer. To add built-in components for this library itself:

1. Add a component under `src/widget/components/*`
2. Register it in `src/widget/registry.ts`
3. Mirror the name in `api/widget-component-names.js` and document it in `public/AGENTS.md` — `npm test` enforces that all three stay in sync
4. Add an example to `src/examples/widgetExamples.ts` (so it shows up in `/gallery`)

## Testing

```bash
npm test
```

Builds the package, then runs the Node test suite: render smoke tests over every gallery example, list-marker rendering, and registry/manifest/AGENTS.md sync checks.

## Theming

All widget styling flows through `--widget-*` CSS custom properties declared in `src/widget/widget.css` (single source of truth — the published `styles.css` imports it). Override any token from your app, e.g.:

```css
.widget-root {
  --widget-accent: #0ea5e9;
  --widget-radius: 12px;
}
```

## License and project boundaries

The code and documentation in this repository, including the `@tugan/widgets`
package and the public demo/generator implementation, are licensed under the
[Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution.

The license covers only material distributed in this repository and package.
It does not grant rights to private infrastructure, credentials, hosted-service
data, or separately distributed proprietary products. It also does not grant
permission to use project names, package names, logos, or other branding except
as required for reasonable and customary attribution.
