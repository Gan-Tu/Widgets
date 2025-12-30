import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { WidgetRenderer } from "@/widget";

const PlaygroundSchema = z.any();

type PlaygroundErrorBoundaryProps = {
  children: React.ReactNode;
  onError: (error: unknown) => void;
};

type PlaygroundErrorBoundaryState = {
  hasError: boolean;
};

class PlaygroundErrorBoundary extends React.Component<
  PlaygroundErrorBoundaryProps,
  PlaygroundErrorBoundaryState
> {
  state: PlaygroundErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [template, setTemplate] = React.useState(defaultTemplate);
  const [jsonInput, setJsonInput] = React.useState(
    JSON.stringify(defaultData, null, 2)
  );
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const [previewKey, setPreviewKey] = React.useState(0);
  const lastLoadedExampleIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Prefer reading from location.search so this effect reliably re-runs when the
    // query string changes (even if the URLSearchParams instance identity is stable).
    const params = new URLSearchParams(location.search);
    const exampleId = params.get("example");
    const componentId = params.get("component");

    const key = exampleId ? `example:${exampleId}` : componentId ? `component:${componentId}` : null;
    if (!key) return;
    if (lastLoadedExampleIdRef.current === key) return;

    let cancelled = false;

    const load = async () => {
      try {
        if (exampleId) {
          const mod = await import("@/examples/widgetExamples");
          const examples = mod.widgetExamples as {
            id: string;
            template: string;
            data: unknown;
            theme?: "light" | "dark";
          }[];
          const match = examples.find((ex) => ex.id === exampleId);
          if (!match || cancelled) return;

          lastLoadedExampleIdRef.current = key;
          setTemplate(match.template ?? "");
          setJsonInput(JSON.stringify(match.data ?? {}, null, 2) ?? "{}");
          setTheme(match.theme ?? "light");
          return;
        }

        if (componentId) {
          const mod = await import("@/docs/componentExamples");
          const match = (mod.componentExamples as Record<
            string,
            { template: string; data: unknown; theme?: "light" | "dark" }
          >)[componentId];
          if (!match || cancelled) return;

          lastLoadedExampleIdRef.current = key;
          setTemplate(match.template ?? "");
          setJsonInput(JSON.stringify(match.data ?? {}, null, 2) ?? "{}");
          setTheme(match.theme ?? "light");
        }
      } catch {
        // If examples can't be loaded, keep the current editor contents.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [location.search, searchParams]);

  React.useEffect(() => {
    // Any edit should reset the preview and clear prior runtime errors.
    setRenderError(null);
    setPreviewKey((prev) => prev + 1);
  }, [template, jsonInput, theme]);

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
          {renderError ? (
            <p className="text-xs text-rose-600">{renderError}</p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Preview</h2>
          <div className="mt-4 flex justify-center">
            <PlaygroundErrorBoundary
              key={previewKey}
              onError={(caught) => {
                setRenderError(
                  caught instanceof Error
                    ? caught.message
                    : "Preview failed to render"
                );
              }}
            >
              <WidgetRenderer
                template={template}
                schema={PlaygroundSchema}
                data={data}
                theme={theme}
                onAction={(action) => console.info("Playground action", action)}
              />
            </PlaygroundErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
