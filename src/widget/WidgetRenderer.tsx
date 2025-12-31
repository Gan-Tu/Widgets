import React from "react";
import { z } from "zod";

import { WidgetActionProvider, WidgetThemeProvider } from "./context";
import { widgetRegistry, type ComponentRegistry } from "./registry";
import { renderTemplate } from "./renderer/templateEngine";
import { Card } from "./components/containers";
import { Text, Title } from "./components/text";

type WidgetRendererProps<T extends z.ZodTypeAny = z.ZodTypeAny> = {
  template: string;
  schema?: T;
  data: z.infer<T>;
  onAction?: (action: { type: string; payload?: Record<string, unknown> }, formData?: Record<string, unknown>) => void;
  components?: ComponentRegistry;
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
  components,
  theme = "light",
  debug = false
}: WidgetRendererProps<T>) => {
  // Validate data against the provided schema before rendering.
  const registry = React.useMemo(
    () => ({ ...widgetRegistry, ...(components ?? {}) }),
    [components]
  );

  const parseResult = React.useMemo(() => {
    if (!schema) {
      return { success: true as const, data };
    }
    return schema.safeParse(data);
  }, [schema, data]);

  if (!parseResult.success) {
    const message = parseResult.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    return <ErrorPanel title="Schema validation failed" message={message} />;
  }

  const scope =
    typeof parseResult.data === "object" && parseResult.data !== null
      ? (() => {
          const record = parseResult.data as Record<string, unknown>;
          // Historically we exposed the full validated state as `data`, but that can clobber
          // widgets that legitimately have a `data` field (common for chart datasets).
          // Keep backwards-compat by only injecting `data` when it doesn't already exist.
          return "data" in record
            ? { ...record, state: record }
            : { ...record, data: record };
        })()
      : { value: parseResult.data };

  let rendered: React.ReactNode;
  try {
    rendered = renderTemplate(template.trim(), scope, registry);
  } catch (error) {
    return (
      <ErrorPanel
        title="Template error"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  return (
    <WidgetThemeProvider theme={theme}>
      <WidgetActionProvider onAction={onAction}>
        {rendered}
        {debug ? (
          <pre className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
            {JSON.stringify(parseResult.data, null, 2)}
          </pre>
        ) : null}
      </WidgetActionProvider>
    </WidgetThemeProvider>
  );
};

export { WidgetRenderer };
export type { WidgetRendererProps };
