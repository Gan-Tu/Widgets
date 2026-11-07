# WidgetRenderer

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gan-Tu/Widgets)

A compact, schema-capable widget renderer for chat UIs. Pass a **Widget UI template string** + optional **Zod schema** + **data**, and it renders a small, opinionated widget with local client actions.

DeepWiki Docs: https://deepwiki.com/Gan-Tu/Widgets

To try generative widgets in ChatGPT, create a custom plugin with `https://genui.tugan.app/mcp` (no auth needed).


## What’s in this repo

- **Reusable renderer**: `WidgetRenderer` (published as `@tugan/widgets`)
- **Component library**: 144 registered components — containers, layout, typography, forms, charts, media, control flow, premium data display, and agent-native/workspace primitives (`ThinkingReasoning`, `StreamingText`, `ApprovalCard`, `AgentInput`, `RecordsTable`, `Flowchart`, and more), all themed by CSS design tokens with full light/dark support
- **Demo app**:
  - `/` — an exploded-view SVG of a widget being built: the model's template streams in, tokens cross a validation layer that binds data and rejects an injected unsafe line, and the rendered card turns to face the viewer and fires `onAction`. Below it, a live template-to-widget exhibit. The hero supports pause, pointer tilt, reduced motion, and automatic suspension offscreen or in hidden tabs
  - `/gallery` — 73 categorized, searchable pre-built widgets; opens on **Featured**, with category and search filters preserved in the URL (`?category=All` shows everything)
  - `/docs` — per-component docs with live examples, prop tables, deep links, and a searchable component sidebar
  - `/glass` — interactive Liquid Glass lab with light/dark and Clear/Regular materials, Unsplash or local image backgrounds, and background scrolling behind fixed widgets
  - `/playground` — live template + JSON editing, plus AI widget generation using **`gpt-6.1-sol`** through the OpenAI Responses API; starts with **Checkout**, and Reset restores it. Explicit example/component links open the requested demo
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

The [authoring guide’s design guidelines](public/AGENTS.md#design-guidelines) explain composition, spacing, chart colors, media, and interaction details. Its [complete component design playbook](public/AGENTS.md#choose-from-the-full-component-library) gives a use case and boundary for all 144 registered names, including agent activity, streaming, editing, workspace navigation, and disclosure. Breadcrumb-style paths use existing buttons, icons, and text. Shared rendering fixes belong in the primitive or its tokens so every widget benefits.

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

### AI generation quota configuration

The playground allows **3 admitted generations per rolling 24 hours for both the
client IP and a signed browser cookie**. Both must have allowance left. The server
checks and records both quotas atomically in Redis before any OpenAI call or
stream begins. Internal searches and repair calls count as part of that one
generation. Invalid requests and missing OpenAI configuration do not consume
quota; once admitted, failed generations still count because upstream work may
already have been billed.

Configure these **server-only** environment variables in Vercel for each target
environment, or in `.env.local` for `npm run dev`:

| Variable | Value |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI key used by the generator |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST endpoint of an Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Write-capable REST token supporting `EVAL` |
| `WIDGET_QUOTA_SECRET` | Random secret of at least 32 characters, shared by every instance |

`KV_REST_API_URL` and `KV_REST_API_TOKEN` are supported aliases for existing Vercel
Redis integrations. Use a dedicated database for production and a separate one
for development/preview so tests and previews do not consume public allowances.
Never prefix these settings with `VITE_` or expose them to the browser. Generate a
secret using `openssl rand -hex 32`; keep it stable across deployments. Rotating
it invalidates visitor cookies and changes the hashed quota identities, so
existing allowances effectively reset.

Missing configuration, an unreachable store, or an uncertain store response
returns HTTP 503 and **blocks generation**. There is no in-memory fallback.
Connect the store and set the secret **before deploying this change** to keep
generation available. Redis keys contain keyed hashes rather than raw IPs and
expire after 24 hours of inactivity. Configure the database to preserve quota
keys (no eviction); deleting keys or restoring older data can reset allowances.

On Vercel, only its overwritten `x-forwarded-for` header is trusted. Elsewhere,
the server uses the direct socket IP and ignores forwarded headers; deployments
behind another reverse proxy need an explicitly trusted IP adapter. Production
uses a `__Host-widget_visitor` cookie with `Secure`, `HttpOnly`, `SameSite=Lax`, and
`Path=/`. Local HTTP development uses `widget_visitor` without `Secure`.

Quota rejections return HTTP 429 with `Retry-After`. Accepted and rejected quota
checks provide `x-generation-limit`, `x-generation-remaining`, and
`x-generation-reset` (Unix seconds). The reset indicates when another slot can
become available, not necessarily a full replenishment. The playground shows
these values after a generation attempt; the backend remains authoritative.

People sharing an IP share its allowance. Clearing cookies alone does not reset
the IP quota; switching IPs alone does not reset the browser quota. Changing both
can evade these anonymous limits. This is not a per-person identity system or a
global dollar spending cap. The separate public MCP renderer does not call
OpenAI and is not changed by this playground quota.

### Owner access with passkeys

The Playground's **Owner access** button authenticates an enrolled owner passkey.
A valid owner session bypasses the daily browser/IP generation quotas without
consuming either allowance. The ordinary short-term request burst protection
still applies. The browser UI is advisory; the server verifies the session and
credential before every exemption. No public account registration or IP allowlist
grants owner access.

Use Node.js 22 or newer. In addition to the Redis and quota settings above, set
`WIDGET_OWNER_ORIGIN` to the site's exact origin, for example
`https://widgets.example.com` (no path). The relying-party ID comes from that
configured hostname, never a request header. Production requires HTTPS; local
development can use `http://localhost:5173`. Keep production credentials and
Redis data separate from preview/development environments. Credentials enrolled
for localhost or a preview hostname do not authorize the production site.

For initial setup, run this **privately** with the production settings in your
local `.env.local` (or provide the environment variables through your secret
manager and omit `--env-file`):

```bash
node --env-file=.env.local scripts/owner-access.mjs invite
```

The command creates a random, single-use invitation valid for 10 minutes and
prints its URL. Open it in the browser you want to authorize, then select
**Set up owner passkey** and approve your device's prompt. The invitation is
carried in the URL fragment, removed from the address bar on page load, and kept
only in component memory. Do not paste it into a public chat, issue, commit, or
analytics system. Enrollment consumes it when the ceremony starts; cancellation
or expiry requires a fresh invitation. An invitation authorizes registration,
not generation by itself.

Once enrolled, use **Owner access** on the website to restore access with the
same passkey. A synced passkey can be used on another supported device. Authorized
owners can select **Add passkey** to enroll a backup. Passkey challenges expire
after 5 minutes, work once, are bound to the requesting browser, and require user
verification. Public keys stay on the server; private keys and biometric data
are never sent to it.

Owner sessions use opaque random tokens in secure, HttpOnly, SameSite=Strict
cookies, with hashed tokens stored in Redis. They last 90 days and renew when
used with fewer than 30 days remaining. Each request checks that the session has
not been revoked and its passkey is still registered. Redis failure blocks an
owner exemption; an expired or revoked session falls back to visitor quotas.

**Sign out** removes this browser's session. **Sign out all browsers** invalidates
every current session, outstanding invitation, and pending authorization attempt,
but preserves registered passkeys, which can authenticate again. **Manage passkeys**
lets you remove a lost or compromised passkey and revoke its sessions. Removing
your last passkey requires another private setup link to recover access. The same
operations are available through the private administrative commands:

```bash
node --env-file=.env.local scripts/owner-access.mjs list
node --env-file=.env.local scripts/owner-access.mjs revoke-passkey CREDENTIAL_ID
node --env-file=.env.local scripts/owner-access.mjs revoke-all
```

If all passkeys are lost, mint another private invitation using the administrative
Redis credentials. There is no unauthenticated recovery endpoint. Back up owner
credential data and keep it in a non-evicting Redis database: losing that data
requires enrolling again. This feature does not impose a global API spending cap.

Visit `/glass` to compare the existing CSS glass with [Glass-HQ Liquid Glass](https://github.com/Glass-HQ/liquid-glass). Scroll over the photo or use the background slider to move it behind the widgets. Uploaded images stay in the browser. Gallery, Docs, and Playground previews also use the new renderer when the header's Glass toggle is on. This is a website enhancement; the published renderer keeps its existing optional CSS material. Enhanced scenes require localhost/HTTPS and WebGPU; Safari, unavailable GPUs, and accessibility transparency/contrast preferences retain CSS glass. Scenes are disposed offscreen and when the page is hidden.

The twenty **Editorial** studies live at `/gallery?category=Editorial`, with twelve rich workflows followed by the original eight compact studies. They were independently authored from the expanded guide using existing components, with illustrative data and working local interactions. Their reusable `{ designSpec, template, data, theme }` JSON lives in `public/design-bible/`; paste `template` and `data` into the Playground editors to explore them without calling the AI generator. The sources are `src/examples/designBibleExamples.ts` and `src/examples/designBibleRichExamples.ts`, both included in the generated example corpora. Original SVG posters and a 2.8-second C4/E4/G4 tone fixture live in `public/design-bible/assets/`; root-relative asset URLs require those files on the host. The same `build-widget-examples-doc.mjs` command regenerates the corpora and JSON files together.

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

- **Declarative logic only**: bindings (`{title}`), conditions (`{ok ? <Badge ... /> : null}`), `.map(...)` loops, and `$` expression props like `$value="item.label"`.
- **No arbitrary JS**: the template engine is intentionally conservative for safety and predictability.
- **Dotted child components are supported**: use names like `<BaseCarousel.Item>`, `<Table.Row>`, `<Table.Cell>`, `<Popover.Trigger>`, and `<Show.Else>`.
- **Client actions run locally**: `copy`, `add_to_calendar`, `request_location_permission`, `open_url`, `email.mailto`, and `card.open`. Other actions are forwarded to the host through `onAction`.

## Control flow

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

The published `WidgetRenderer` is intentionally a fixed component surface: package consumers cannot pass custom/client-defined widget components into the renderer. To add built-in components for this library itself:

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

The effect uses frosted backgrounds, backdrop blur, edge highlights, and restrained shadows. Text, images, and chart marks stay sharp. It works best over a subtle background with some color or detail; the demo provides one. `prefers-reduced-transparency` and increased-contrast preferences use solid surfaces, and browsers without backdrop-filter get an opaque fallback. The material combines CSS lighting with an optional browser lens filter.

The optional stylesheet lives in `src/widget/liquid-glass.css`; demo backgrounds and chrome live separately in `src/styles/glass-demo.css`. The package build copies the material stylesheet to its own export, so importing only `styles.css` keeps the existing appearance.

Material hierarchy follows [Apple's Liquid Glass guidance](https://developer.apple.com/videos/play/wwdc2025/219/): tint emphasizes primary actions, and a group shares one optical layer. Outer Cards, token-backed Boxes, and agent/workspace panels receive the frosted pane; nested panels use a thin matte wash, and deeper groups stay clear. Floating menus begin a fresh, denser pane. Tables share their container's finish, with one tint for selected columns. Labels, images, and chart marks stay sharp. Built-in components identify painted surfaces through the internal `data-widget-surface` hook; this adds no template props.

Chromium renders real edge refraction with a faint chromatic fringe; Safari and Firefox receive the same neutral glass material without refraction because `backdrop-filter: url()` is Chromium-only. Refraction needs detail behind the widget, such as a grid, image, or text. Import `setLiquidGlassRefraction` from `@tugan/widgets` and call `setLiquidGlassRefraction(false)` to disable it (use `"auto"` to restore it). Reduced-transparency and increased-contrast preferences always receive solid surfaces.

## License and project boundaries

The code and documentation in this repository, including the `@tugan/widgets`
package and the public demo/generator implementation, are licensed under the
[Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution.

The license covers only material distributed in this repository and package.
It does not grant rights to private infrastructure, credentials, hosted-service
data, or separately distributed proprietary products. It also does not grant
permission to use project names, package names, logos, or other branding except
as required for reasonable and customary attribution.
