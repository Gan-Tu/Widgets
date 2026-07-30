import React from "react";
import { z } from "zod";

import { WidgetActionProvider, WidgetThemeProvider } from "./context";
import { widgetRegistry } from "./registry";
import { renderTemplate } from "./renderer/templateEngine";
import { Card } from "./components/containers";
import { Text, Title } from "./components/text";
import type { ActionConfig } from "./types";

type WidgetRendererProps<T extends z.ZodTypeAny = z.ZodTypeAny> = {
  template: string;
  schema?: T;
  data: z.infer<T>;
  onAction?: (action: ActionConfig, formData?: Record<string, unknown>) => void;
  theme?: "light" | "dark";
  debug?: boolean;
};

function ErrorPanel({ title, message }: { title: string; message: string }) {
  return (
    <Card size="md" padding={4}>
      <Title value={title} size="sm" />
      <Text value={message} size="sm" color="secondary" />
    </Card>
  );
}

const WidgetRenderer = <T extends z.ZodTypeAny>({
  template,
  schema,
  data,
  onAction,
  theme = "light",
  debug = false
}: WidgetRendererProps<T>) => {
  const parseResult = React.useMemo(() => {
    if (!schema) {
      return { success: true as const, data };
    }
    return schema.safeParse(data);
  }, [schema, data]);

  const [localState, setLocalState] = React.useState<unknown>(
    parseResult.success ? parseResult.data : data
  );
  const [lastAppliedData, setLastAppliedData] = React.useState<unknown>(
    parseResult.success ? parseResult.data : undefined
  );

  // Derive state synchronously when new data arrives so the template never
  // renders against a stale shape (an effect-based sync produces one render
  // where a new template sees the previous widget's data).
  const incomingData = parseResult.success && parseResult.data !== lastAppliedData;
  if (incomingData) {
    setLastAppliedData(parseResult.data);
    setLocalState(parseResult.data);
  }
  // Render THIS pass against the fresh data too: the render-phase setState
  // re-invokes the component, and using the new data here means the re-run's
  // memo is a cache hit instead of a second full renderTemplate walk.
  const stateForRender = incomingData ? parseResult.data : localState;

  const renderResult = React.useMemo<
    { ok: true; node: React.ReactNode } | { ok: false; message: string }
  >(() => {
    const scope =
      typeof stateForRender === "object" && stateForRender !== null
        ? (() => {
            const record = stateForRender as Record<string, unknown>;
            // Historically we exposed the full validated state as `data`, but that can clobber
            // widgets that legitimately have a `data` field (common for chart datasets).
            // Keep backwards-compat by only injecting `data` when it doesn't already exist.
            return "data" in record
              ? { ...record, state: record }
              : { ...record, data: record, state: record };
          })()
        : { value: stateForRender, state: stateForRender };

    try {
      return { ok: true, node: renderTemplate(template.trim(), scope, widgetRegistry) };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      return { ok: false, message: message || "Unknown error" };
    }
  }, [stateForRender, template]);

  if (!parseResult.success) {
    const message = parseResult.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    return <ErrorPanel title="Schema validation failed" message={message} />;
  }

  if (!renderResult.ok) {
    return <ErrorPanel title="Template error" message={renderResult.message} />;
  }

  const rendered = renderResult.node;

  return (
    <WidgetThemeProvider theme={theme}>
      <WidgetActionProvider
        onAction={onAction}
        state={localState}
        onStateChange={setLocalState}
      >
        {rendered}
        {debug ? (
          <pre className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
            {JSON.stringify(localState, null, 2)}
          </pre>
        ) : null}
      </WidgetActionProvider>
    </WidgetThemeProvider>
  );
};

export { WidgetRenderer };
export type { WidgetRendererProps };
