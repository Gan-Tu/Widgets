# WidgetRenderer

A compact, schema-driven widget renderer for chat UIs. Pass a **Widget UI template string** + a **Zod schema** + **data**, and it renders a small, opinionated widget with minimal interactivity.


https://github.com/user-attachments/assets/0a1ad957-2e58-4837-b5b1-a44750fc7148


## What’s in this repo

- **Reusable renderer**: `WidgetRenderer` (exported from `src/widget`)
- **Component library**: the Widget UI primitives (containers, layout, text, content, forms)
- **Demo app**:
  - `/gallery` — lots of pre-built widgets
  - `/docs` — component docs + reference
  - `/playground` — live template + JSON editing

Built with **React**, **Tailwind v4**, **shadcn/ui**, and **Motion** (`motion/react`).

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, then visit `/gallery`, `/docs`, or `/playground`.

## Basic usage (embed in your app)

```tsx
import { WidgetRenderer } from "@/widget";
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
- **`schema: z.ZodTypeAny`**: Zod schema for widget data (validated before render)
- **`data: z.infer<typeof schema>`**: data matching the schema
- **`onAction?: (action, formData?) => void`**: receives declarative actions (and optional captured form state)
- **`components?: ComponentRegistry`**: override / add components to the registry
- **`theme?: "light" | "dark"`**: force theme for the widget subtree
- **`debug?: boolean`**: render validated data under the widget

## Template rules (the important bits)

- **No text children**: text is always passed via props.

```tsx
// ✅ valid
<Text value="Hello" />
<Button label="Continue" />

// ❌ invalid
<Text>Hello</Text>
<Button>Continue</Button>
```

- **Declarative logic only**: bindings (`{title}`), conditions (`{ok ? <Badge ... /> : null}`), and `.map(...)` loops.
- **No arbitrary JS**: the template engine is intentionally conservative for safety and predictability.

## Where to look in code

- **Renderer**: `src/widget/WidgetRenderer.tsx`
- **Template engine**: `src/widget/renderer/templateEngine.tsx`
- **Widget components**: `src/widget/components/*`
- **Registry**: `src/widget/registry.ts`
- **Example widgets**: `src/examples/widgetExamples.ts`
- **Demo routes**: `src/pages/*` + `src/App.tsx`

## Extending the system

1. Add a component under `src/widget/components/*`
2. Register it in `src/widget/registry.ts`
3. Add an example to `src/examples/widgetExamples.ts` (so it shows up in `/gallery`)

## Notes

- `DatePicker` is implemented as a styled native date input for simplicity (matching the Widget UI API surface).
