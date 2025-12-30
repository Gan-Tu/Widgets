import React from "react";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { WidgetRenderer } from "@/widget";

const PlaygroundSchema = z.any();

const defaultTemplate = `
<Card size="sm">
  <Col gap={2}>
    <Title value={title} />
    <Text value={subtitle} color="secondary" />
    <Button label="Primary action" style="primary" />
  </Col>
</Card>
`.trim();

const defaultData = {
  title: "Hello widgets",
  subtitle: "Edit the template and JSON to see live updates."
};

export function PlaygroundPage() {
  const [template, setTemplate] = React.useState(defaultTemplate);
  const [jsonInput, setJsonInput] = React.useState(
    JSON.stringify(defaultData, null, 2)
  );

  const { data, error } = React.useMemo(() => {
    try {
      return { data: JSON.parse(jsonInput), error: null as string | null };
    } catch (err) {
      return {
        data: defaultData,
        error: err instanceof Error ? err.message : "Invalid JSON"
      };
    }
  }, [jsonInput]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Live playground</h1>
        <p className="text-sm text-slate-600">
          Paste a Widget UI template and JSON data. The renderer updates in real time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Widget template</h2>
            <Textarea
              className="mt-2 min-h-[280px] font-mono text-xs"
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Widget data (JSON)</h2>
            <Textarea
              className="mt-2 min-h-[200px] font-mono text-xs"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
            />
            {error ? (
              <p className="mt-2 text-xs text-rose-600">{error}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Preview</h2>
          <div className="mt-4 flex justify-center">
            <WidgetRenderer
              template={template}
              schema={PlaygroundSchema}
              data={data}
              onAction={(action) => console.info("Playground action", action)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
