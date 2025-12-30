import React from "react";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { WidgetRenderer } from "@/widget";

const PlaygroundSchema = z.any();

const defaultTemplate = `
<Card size="sm">
<Title value={ eta } size="xl" />

  <Row align="center">
    <Col minWidth="auto">
      <Caption value="Pick up" />
      <Text value={address} truncate />
    </Col>
    <Spacer />
    <Col align="end">
      <Caption value="Driver" />
      <Text value={driver.name} />
    </Col>

    <Image
      src={driver.photo}
      size={40}
      radius="full"
    />
  </Row>
</Card>
`.trim();

const defaultData = {
  eta: "1 min",
  address: "1008 Mission St",
  driver: {
    name: "Jonathan",
    photo: "https://cdn.openai.com/API/storybook/driver.png"
  }
};

export function PlaygroundPage() {
  const [template, setTemplate] = React.useState(defaultTemplate);
  const [jsonInput, setJsonInput] = React.useState(
    JSON.stringify(defaultData, null, 2)
  );

  const { data, error } = React.useMemo(() => {
    const sanitizeJson = (input: string) =>
      input.replace(/,\s*([}\]])/g, "$1");

    try {
      return { data: JSON.parse(jsonInput), error: null as string | null };
    } catch {
      try {
        return { data: JSON.parse(sanitizeJson(jsonInput)), error: null as string | null };
      } catch (innerError) {
        return {
          data: defaultData,
          error: innerError instanceof Error ? innerError.message : "Invalid JSON"
        };
      }
    }
  }, [jsonInput]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">
          Live playground
        </h1>
        <p className="text-sm text-slate-600">
          Paste a Widget UI template and JSON data. The renderer updates in real
          time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Widget template
            </h2>
            <Textarea
              className="mt-2 min-h-[380px] font-mono text-xs"
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Widget data (JSON)
            </h2>
            <Textarea
              className="mt-2 min-h-[300px] font-mono text-xs"
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
