# @tugan/widgets

A compact, schema-driven widget renderer for chat UIs. Pass a Widget UI template string + a Zod schema + data, and it renders a small, opinionated widget with minimal interactivity.

## Install

```bash
npm install @tugan/widgets
```

Import the styles once in your app entry:

```ts
import "@tugan/widgets/styles.css";
```

The styles bundle includes the Tailwind utilities used by the widget UI, so you don't need Tailwind set up in the host app.

## Basic usage

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

## WidgetRenderer props

- `template: string` — Widget UI template (a strict JSX-like language)
- `schema: z.ZodTypeAny` — Zod schema for widget data (validated before render)
- `data: z.infer<typeof schema>` — data matching the schema
- `onAction?: (action, formData?) => void` — receives declarative actions (and optional captured form state)
- `components?: ComponentRegistry` — override / add components to the registry
- `theme?: "light" | "dark"` — force theme for the widget subtree
- `debug?: boolean` — render validated data under the widget

## License

Apache-2.0
