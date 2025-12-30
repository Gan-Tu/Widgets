# Widget Renderer

A compact, schema-driven widget system for chat UIs. It ships with a JSX-like template language, a fully typed component library, and a demo gallery + playground.

## What you get

- **WidgetRenderer** component that accepts a Widget UI template + Zod schema + data.
- **Gallery** page with 12+ real widgets rendered from the spec.
- **Playground** page for live template + JSON editing.
- **Tailwind v4**, **shadcn/ui**, and **Motion (Framer Motion)** baked in.

## Quick start

```tsx
import { WidgetRenderer } from "@/widget";
import WidgetSchema from "./schema";

<WidgetRenderer
  template={templateString}
  schema={WidgetSchema}
  data={widgetData}
  onAction={(action) => console.log(action)}
/>;
```

### Run locally

```bash
npm install
npm run dev
```

Open:
- `/examples` for the gallery
- `/playground` for the live editor

## WidgetRenderer API

```ts
type WidgetRendererProps<T extends z.ZodTypeAny> = {
  template: string;
  schema: T;
  data: z.infer<T>;
  onAction?: (action: { type: string; payload?: Record<string, unknown> }) => void;
  components?: ComponentRegistry;
  theme?: "light" | "dark";
  debug?: boolean;
};
```

### Action handling

Interactive components dispatch declarative `ActionConfig` objects. The renderer surfaces them via the `onAction` callback. If the action is attached to a `Form` or `Card` with `asForm`, the payload includes the current form data.

## Template language

Templates use a strict JSX-like format. Text must be passed via props, not children.

```tsx
// Correct
<Text value="Hello" />
<Button label="Continue" />

// Incorrect
<Text>Hello</Text>
<Button>Continue</Button>
```

Supported structures:
- **Data binding**: `{title}`
- **Loops**: `{items.map((item) => (<Row ... />))}`
- **Conditions**: `{isNew ? <Badge ... /> : null}`

> Note: The demo renderer intentionally supports a limited expression set (identifiers, member access, literals, conditionals, and `.map`). Arbitrary JavaScript is blocked by design.

## Component reference

The renderer implements the full spec provided in `AGENTS.md`, including:

- **Containers**: `Basic`, `Card`, `ListView`, `ListViewItem`
- **Layout**: `Box`, `Row`, `Col`, `Form`, `Spacer`, `Divider`
- **Text**: `Title`, `Text`, `Caption`, `Markdown`, `Label`
- **Content**: `Badge`, `Icon`, `Image`, `Button`
- **Controls**: `Input`, `Textarea`, `Select`, `DatePicker`, `Checkbox`, `RadioGroup`
- **Visuals**: `Chart`, `Transition`

### New additions (extra spec)

The project adds several reusable components that are not present in the original spec:

- **Avatar** — `src?`, `name`, `size?`, `radius?`, `status?`
- **Progress** — `value`, `max?`, `label?`, `color?`, `size?`
- **Accordion** — `items`, `type?`, `collapsible?`
- **Collapsible** — `title`, `content`, `defaultOpen?`
- **Menubar** — `menus`
- **ContextMenu** — `triggerLabel`, `items`
- **Tooltip** — `label`, `content`
- **Toggle** — `name?`, `label`, `defaultPressed?`
- **ToggleGroup** — `name?`, `type?`, `options`
- **Slider** — `name?`, `defaultValue?`, `min?`, `max?`, `step?`
- **Sheet** — `triggerLabel`, `title?`, `description?`, `content?`, `side?`
- **Drawer** — `triggerLabel`, `title?`, `description?`, `content?`
- **Combobox** — `name?`, `options`, `placeholder?`
- **InputOTP** — `name?`, `length?`, `groupSize?`
- **Spinner** — `size?`, `label?`
- **DataTable** — `columns`, `rows`, `caption?`

These are included in the gallery examples and are registered in `widgetRegistry`.

## Theming

All widget roots define CSS variables in `.widget-root`. Use the `theme` prop on `Card`, `ListView`, or `Basic` to force light/dark styling for any subtree.

## File map

- `src/widget/WidgetRenderer.tsx` - main renderer
- `src/widget/renderer/templateEngine.tsx` - JSX-like template parser
- `src/widget/components/*` - widget component library
- `src/examples/widgetExamples.ts` - demo gallery examples
- `src/pages/*` - Home, Examples, Playground

## Extending

To add new components:

1. Implement the component under `src/widget/components`.
2. Register it in `src/widget/registry.ts`.
3. Document it in this README and add a demo example.

## Notes

- The template engine is deliberately conservative: it supports the constructs shown in the spec examples and blocks arbitrary code execution.
- `DatePicker` is implemented as a styled native date input for simplicity; it respects the API from the spec.
