# WidgetRenderer

A compact, schema-capable widget renderer for chat UIs. Pass a **Widget UI template string** + optional **Zod schema** + **data**, and it renders a small, opinionated widget with local client actions.

DeepWiki Docs: https://deepwiki.com/Gan-Tu/Widgets

https://github.com/user-attachments/assets/0a1ad957-2e58-4837-b5b1-a44750fc7148


## What’s in this repo

- **Reusable renderer**: `WidgetRenderer` (published as `@tugan/widgets`)
- **Component library**: Widget UI / DIL primitives for containers, layout, text, media, forms, data display, control flow, loading states, and client actions
- **Demo app**:
  - `/gallery` — lots of pre-built widgets
  - `/docs` — component docs + reference
  - `/playground` — live template + JSON editing

Built with **React**, **Tailwind v4**, **shadcn/ui-style primitives**, **Recharts**, and **Motion** (`motion/react`).

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
- **`data: unknown`**: widget state/data; when `schema` is provided, it must match the schema
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

Server-side actions are intentionally host-owned. See `PLAN.md` for the recommended Express/API integration contract.

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
3. Add an example to `src/examples/widgetExamples.ts` (so it shows up in `/gallery`)

## Notes

- `DatePicker` is implemented as a styled native date input for simplicity (matching the Widget UI API surface).
