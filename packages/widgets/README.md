# @tugan/widgets

A compact, schema-capable widget renderer for chat UIs. Pass a Widget UI / DIL-style template string + optional Zod schema + data, and it renders a small, opinionated widget with local client actions and host-forwarded actions.

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
- `schema?: z.ZodTypeAny` — optional Zod schema for widget data (validated before render when provided)
- `data: unknown` — widget state/data; when `schema` is provided, it must match the schema
- `onAction?: (action, formData?) => void` — receives declarative actions, optional captured form state, and client-action results
- `theme?: "light" | "dark"` — force theme for the widget subtree
- `debug?: boolean` — render validated data under the widget

## DIL support

The renderer supports the documented DIL component surface to the extent it can run in a standalone React package: layout, media, rich text, forms, charts, table rows/cells, popovers, carousels, loading states, control flow, and dotted child components such as `Table.Row`, `BaseCarousel.Item`, `Popover.Trigger`, and `Show.Else`.

Guide-style `$` expression props are supported:

```tsx
<Each $of="state.items" item="item">
  <Text $value="item.label" />
</Each>
```

Built-in client actions: `copy`, `add_to_calendar`, `request_location_permission`, `open_url`, `email.mailto`, and `card.open`. Other actions are forwarded to the host through `onAction`.

The published renderer intentionally does not accept consumer-supplied custom/client-defined widget components. Extend the library by adding built-ins to the source registry, not by passing a runtime component map.

## License

Apache-2.0
