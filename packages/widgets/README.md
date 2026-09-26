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
- `data: unknown` — widget state/data; when `schema` is provided, it must match the schema. Keep the reference stable between renders; a new object resets widget-local state
- `onAction?: (action, formData?) => void` — receives declarative actions, optional captured form state, and client-action results
- `theme?: "light" | "dark"` — force theme for the widget subtree
- `appearance?: "default" | "glass"` — optional visual material override; requires the glass stylesheet when enabled
- `debug?: boolean` — render validated data under the widget

## DIL support

The renderer exposes 145 registered component names across layout, media, rich text, forms, charts, table rows/cells, popovers, carousels, loading states, control flow, agent activity/input, and workspace data/navigation. Dotted child components such as `Table.Row`, `BaseCarousel.Item`, `Popover.Trigger`, and `Show.Else` are supported.

The agent-native and workspace primitives are independent implementations inspired by interaction concepts in the current [AIcss](https://www.aicss.dev/) and [Beautiful UI](https://www.beautifului.dev/) catalogs. No source code or assets from either project are copied.

Guide-style `$` expression props are supported:

```tsx
<Each $of="state.items" item="item">
  <Text $value="item.label" />
</Each>
```

Built-in client actions: `copy`, `add_to_calendar`, `request_location_permission`, `open_url`, `email.mailto`, and `card.open`. Other actions are forwarded to the host through `onAction`.

The published renderer intentionally does not accept consumer-supplied custom/client-defined widget components. Extend the library by adding built-ins to the source registry, not by passing a runtime component map.

## Authoring and examples

- [Authoring guide](https://widgets.gan.dev/AGENTS.md) — template rules, actions, component APIs, and design principles
- [Featured examples](https://widgets.gan.dev/FEATURED_WIDGET_EXAMPLES.md) — the curated template + data pairs used with the guide for generation
- [All examples](https://widgets.gan.dev/WIDGET_EXAMPLES.md) — the complete gallery corpus
- [Gallery](https://widgets.gan.dev/gallery) — opens on Featured
- [Playground](https://widgets.gan.dev/playground) — edit a template and its data, starting with Checkout
- [Component docs](https://widgets.gan.dev/docs) — prop references and live demos

For documentation matching a source checkout, use that checkout's `public/AGENTS.md` and generated example files. The hosted demo follows the site's deployed version, which can differ from an installed npm version.

## Design and theming

Use the built-in shadcn-based controls, light borders, neutral surfaces, and deliberate spacing. Compose one clear task with one primary action; selected toggles should read clearly, and media should share the content gutter. Fields emphasize their border on focus, while keyboard-operated controls retain a muted focus indicator. The [design guidelines](https://widgets.gan.dev/AGENTS.md#design-guidelines) cover hierarchy, compact layouts, and interaction states.

Pass `theme="light"` or `theme="dark"` to `WidgetRenderer`. Widget popovers, menus, and dialogs inherit that theme. Customize `--widget-*` CSS variables after importing the stylesheet:

```css
.widget-root {
  --widget-font-sans: "Inter", system-ui, sans-serif;
  --widget-radius: 12px;
}
```

Use `.widget-root[data-theme="light"]` or `.widget-root[data-theme="dark"]` for mode-specific overrides. Widget portals also carry these attributes; an ancestor selector around only the card will not reach portals mounted under `body`. When changing the action accent, update its strong/soft/border variants and `--widget-on-accent` together for readable text and states.

Charts have their own vivid palette, independent of the monochrome action accent. With no explicit series colors, one series uses blue, two use yellow + green, and three use blue + green + pinkish red. Larger sets add purple and orange without pairing yellow with orange. Pie charts choose combinations by slice count. Override `--widget-chart-1` through `--widget-chart-6` to customize palette entries; their numbers are not series positions. Keep chart labels and tooltip text neutral and readable.

### Experimental liquid glass

Load the optional stylesheet after the base styles and enable it on the renderer:

```tsx
import "@tugan/widgets/styles.css";
import "@tugan/widgets/liquid-glass.css";
import { WidgetRenderer, WidgetAppearanceProvider } from "@tugan/widgets";

<WidgetRenderer template={template} data={data} appearance="glass" theme="light" />

// Or share one appearance preference across multiple renderers:
<WidgetAppearanceProvider appearance={glassEnabled ? "glass" : "default"}>
  <WidgetRenderer template={template} data={data} />
</WidgetAppearanceProvider>
```

Standard appearance is the default; an explicit renderer prop overrides its provider. Changing this setting preserves widget state and does not change template syntax, data, or actions. Light/dark mode is independent, and floating menus and dialogs inherit both settings.

The CSS material adds frosted surfaces, edge highlights, and softer depth while keeping content sharp. A background with subtle color or detail makes the effect visible. Reduced-transparency and increased-contrast preferences use solid surfaces; browsers without backdrop blur receive an opaque fallback. Importing only `styles.css` keeps the existing appearance.

Chromium renders real edge refraction with a faint chromatic fringe; Safari and Firefox receive the same neutral glass material without refraction because `backdrop-filter: url()` is Chromium-only. Refraction needs detail behind the widget, such as a grid, image, or text. Import `setLiquidGlassRefraction` from `@tugan/widgets` and call `setLiquidGlassRefraction(false)` to disable it (use `"auto"` to restore it). Reduced-transparency and increased-contrast preferences always receive solid surfaces.

## License

Licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution.

The license does not grant permission to use project names, package names,
logos, or other branding except as required for reasonable and customary
attribution.
