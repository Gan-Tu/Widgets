# Server-Side Widget Actions Plan

This renderer now handles the scoped browser client actions locally. Server-side actions should remain host-owned so the package can stay drop-in for any React app.

## Target Contract

Server actions use the existing `ActionConfig` shape:

```ts
{
  type: string;
  handler: "server";
  payload?: Record<string, unknown>;
  loadingBehavior?: "auto" | "none" | "self" | "container";
}
```

The renderer should continue to call `onAction(action, formData)` for server actions. The host app decides whether to POST to Express, Next.js, Hono, Cloudflare Workers, or another API.

## Recommended API Shape

Expose one endpoint owned by the host app:

```http
POST /api/widget-actions
Content-Type: application/json

{
  "action_type": "task.create",
  "payload": { "task": { "title": "..." } },
  "widget_id": "optional-widget-id",
  "conversation_id": "optional-host-context",
  "message_id": "optional-host-context"
}
```

Response:

```json
{
  "ok": true,
  "toast": "Task created",
  "nextWidget": {
    "template": "<Card>...</Card>",
    "data": {},
    "theme": "light"
  }
}
```

`nextWidget` is optional. Hosts that manage their own state can ignore it and update surrounding app state instead.

## Renderer Work

1. Add an optional `serverActionHandler` prop:
   `serverActionHandler?: (action, formData) => Promise<ServerActionResult>`.
2. Keep `onAction` as the low-level observer and backwards-compatible escape hatch.
3. Track loading state by action id or component scope when `loadingBehavior !== "none"`.
4. Surface success/error through an optional host callback, not hard-coded UI.
5. Allow hosts to return a replacement widget template/data pair.
6. Add tests for success, validation failure, network failure, duplicate clicks, and form payload merging.

## Express Example

```ts
app.post("/api/widget-actions", async (req, res) => {
  const { action_type, payload } = req.body;

  switch (action_type) {
    case "task.create":
      return res.json({
        ok: true,
        toast: "Task created",
        nextWidget: {
          template: "<Card><Text value=\"Task created\" /></Card>",
          data: {}
        }
      });
    default:
      return res.status(400).json({ ok: false, error: "Unknown action" });
  }
});
```

## Security Notes

- Validate `action_type` against an allowlist.
- Validate `payload` per action with Zod or equivalent.
- Keep auth, authorization, rate limits, and audit logging in the host API.
- Do not let widget templates choose arbitrary URLs for server requests.
- Strip display-only fields before persistence if the host uses toast/control metadata.
