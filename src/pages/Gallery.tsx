import { Play } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetRenderer } from "@/widget";

import type { ZodTypeAny } from "zod";

type WidgetExample = {
  id: string;
  title: string;
  description: string;
  template: string;
  schema?: ZodTypeAny;
  data: unknown;
  theme?: "light" | "dark";
};

type ActionLogItem = {
  id: string;
  source: string;
  action: unknown;
  formData?: unknown;
  time: string;
};

const clientActionExamples: WidgetExample[] = [
  {
    id: "copy",
    title: "Copy",
    description: "Writes custom payload.value text to the clipboard.",
    template: `
<Card size="full" gap={3}>
  <Row gap={2} align="center">
    <Icon name="square-text" />
    <Col gap={0}>
      <Text value="Copy custom text" weight="semibold" />
      <Caption value="Edit the field, then copy exactly that value." />
    </Col>
  </Row>
  <Form onSubmitAction={{ type: "copy", handler: "client" }} gap={3}>
    <Col gap={1}>
      <Label value="Text to copy" fieldName="value" />
      <Textarea
        name="value"
        defaultValue="WIDGETS-2026 invite code"
        rows={2}
        size="sm"
        autoSelect
      />
    </Col>
    <Button submit label="Copy text" iconStart="copy" block />
  </Form>
</Card>
    `.trim(),
    data: {}
  },
  {
    id: "add-calendar",
    title: "Add to calendar",
    description: "Opens a calendar event from editable form data.",
    template: `
<Card size="full" gap={3}>
  <Row gap={2} align="center">
    <Icon name="calendar" />
    <Col gap={0}>
      <Text value="Calendar event" weight="semibold" />
      <Caption value="Title, date, location, and description flow into Google Calendar." />
    </Col>
  </Row>
  <Form onSubmitAction={{ type: "add_to_calendar", handler: "client" }} gap={3}>
    <Col gap={1}>
      <Label value="Title" fieldName="item.title" />
      <Input name="item.title" defaultValue="Widget library review" size="sm" />
    </Col>
    <Col gap={1}>
      <Label value="Date" fieldName="item.date_str" />
      <DatePicker name="item.date_str" defaultValue="2026-06-20" size="sm" block />
    </Col>
    <Col gap={1}>
      <Label value="Location" fieldName="item.location" />
      <Input name="item.location" defaultValue="Remote review room" size="sm" />
    </Col>
    <Col gap={1}>
      <Label value="Description" fieldName="item.description" />
      <Textarea
        name="item.description"
        defaultValue="Review DIL component coverage, client actions, and release readiness."
        rows={3}
        size="sm"
      />
    </Col>
    <Button submit label="Add event" color="info" block />
  </Form>
</Card>
    `.trim(),
    data: {}
  },
  {
    id: "location",
    title: "Location permission",
    description: "Requests browser geolocation only.",
    template: `
<Card size="sm" gap={3}>
  <Row gap={2}>
    <Icon name="map-pin" />
    <Col gap={0}>
      <Text value="Find nearby pickup" weight="semibold" />
      <Caption value="No new-turn payload is issued." />
    </Col>
  </Row>
  <Button
    label="Request location"
    variant="outline"
    onClickAction={{ type: "request_location_permission", handler: "client" }}
  />
</Card>
    `.trim(),
    data: {}
  },
  {
    id: "open-url",
    title: "Open URL",
    description: "Validates and opens http(s) links.",
    template: `
<Card size="sm" gap={3}>
  <Row gap={2}>
    <Icon name="external-link" />
    <Col gap={0}>
      <Text value="Open package docs" weight="semibold" />
      <Caption value="Uses window.open with noopener." />
    </Col>
  </Row>
  <Button
    label="Open docs"
    iconEnd="external-link"
    onClickAction={{ type: "open_url", handler: "client", payload: { url: "https://www.npmjs.com/package/@tugan/widgets" } }}
  />
</Card>
    `.trim(),
    data: {}
  },
  {
    id: "mailto",
    title: "Send email",
    description: "Builds a mailto URL from editable recipient, subject, and body fields.",
    template: `
<Card size="full" gap={3}>
  <Row gap={2} align="center">
    <Icon name="mail" />
    <Col gap={0}>
      <Text value="Draft feedback email" weight="semibold" />
      <Caption value="Editable to, subject, and body are encoded into mailto." />
    </Col>
  </Row>
  <Form onSubmitAction={{ type: "email.mailto", handler: "client" }} gap={3}>
    <Col gap={1}>
      <Label value="To" fieldName="email.to" />
      <Input
        name="email.to"
        inputType="email"
        defaultValue="widgets@example.com"
        size="sm"
      />
    </Col>
    <Col gap={1}>
      <Label value="Subject" fieldName="email.subject" />
      <Input name="email.subject" defaultValue="Widget feedback" size="sm" />
    </Col>
    <Col gap={1}>
      <Label value="Body" fieldName="email.body" />
      <Textarea
        name="email.body"
        defaultValue="The DIL component gallery looks ready. The live demos cover editable client actions now."
        rows={3}
        size="sm"
      />
    </Col>
    <Button submit label="Open email draft" variant="outline" block />
  </Form>
</Card>
    `.trim(),
    data: {}
  },
  {
    id: "card-open",
    title: "Card open",
    description: "Dispatches card.open and scrolls matching cards.",
    template: `
<Card
  size="sm"
  cardId="gallery-action-card"
  gap={3}
  onClickAction={{ type: "card.open", handler: "client", payload: { card_id: "gallery-action-card" } }}
>
  <Row gap={2}>
    <Icon name="profile-card" />
    <Col gap={0}>
      <Text value="Open this card" weight="semibold" />
      <Caption value="The whole card is clickable." />
    </Col>
  </Row>
  <Badge label="Click card" color="discovery" />
</Card>
    `.trim(),
    data: {}
  }
];

export function GalleryPage() {
  const [examples, setExamples] = React.useState<WidgetExample[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [actionLog, setActionLog] = React.useState<ActionLogItem | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    import("@/examples/widgetExamples")
      .then((mod) => {
        if (!cancelled) setExamples(mod.widgetExamples as WidgetExample[]);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load examples";
        if (!cancelled) setLoadError(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pushActionLog = React.useCallback(
    (source: string, action: unknown, formData?: unknown) => {
      setActionLog({
        id: `${source}-${Date.now()}`,
        source,
        action,
        formData,
        time: new Date().toLocaleTimeString()
      });
    },
    []
  );

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Widget gallery</h1>
        <p className="text-sm text-slate-600">
          Browse real widget templates rendered by the WidgetRenderer. Each example
          is driven by schema-validated data.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {loadError}
        </div>
      ) : null}

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Client actions</h2>
            <p className="mt-1 text-sm text-slate-600">
              Browser-side actions implemented by the renderer: copy, calendar, location,
              URL open, mailto, and card open.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase text-slate-600"
          >
            handler=&quot;client&quot;
          </Badge>
        </div>

        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {clientActionExamples.map((example) => (
              <div
                key={example.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">{example.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{example.description}</p>
                </div>
                <WidgetRenderer
                  template={example.template}
                  schema={example.schema}
                  data={example.data}
                  theme={example.theme ?? "light"}
                  onAction={(action, formData) => pushActionLog(example.id, action, formData)}
                />
              </div>
            ))}
          </div>

          <aside className="min-w-0 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Action log</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 cursor-pointer rounded-full px-3 text-xs"
                onClick={() => setActionLog(null)}
              >
                Clear
              </Button>
            </div>
            <div className="mt-3 max-h-[520px] space-y-3 overflow-auto pr-1">
              {actionLog ? (
                <div key={actionLog.id} className="rounded-xl bg-white/8 p-3" data-action-log-item>
                  <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>{actionLog.source}</span>
                    <span>{actionLog.time}</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-200">
                    {JSON.stringify({ action: actionLog.action, formData: actionLog.formData }, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 p-4 text-xs text-slate-400">
                  Trigger a client action to see the resolved action payload and result.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <div className="grid min-w-0 gap-8 md:grid-cols-2">
        {examples
          ? examples.map((example, index) => (
              <motion.section
                key={example.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="min-w-0 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {example.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {example.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase text-slate-600"
                    >
                      {example.id}
                    </Badge>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-2 border-slate-200 bg-white/80 text-slate-800 hover:bg-white"
                    >
                      <Link
                        className="cursor-pointer"
                        to={`/playground?example=${encodeURIComponent(example.id)}`}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Try it
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-5 flex min-w-0 justify-center overflow-x-auto pb-1">
                  <WidgetRenderer
                    template={example.template}
                    schema={example.schema}
                    data={example.data}
                    theme={example.theme ?? "light"}
                    onAction={(action, formData) => pushActionLog(example.id, action, formData)}
                  />
                </div>
              </motion.section>
            ))
          : Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`gallery-skeleton-${index}`}
                className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm"
              >
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-900/10" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-900/10" />
                <div className="mt-5 h-56 animate-pulse rounded-2xl bg-slate-900/5" />
              </div>
            ))}
      </div>
    </div>
  );
}
