import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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

type AuthorWidgetResponse = {
  template: string;
  data: unknown;
  theme?: "light" | "dark";
  designSpec?: string;
  stages?: string[];
  error?: string;
};

type ReferenceImage = {
  id: string;
  name: string;
  dataUrl: string;
};

type GenerationStreamEvent =
  | {
      type: "status";
      message: string;
    }
  | {
      type: "result";
      widget: AuthorWidgetResponse;
    }
  | {
      type: "error";
      error: string;
    };

const maxReferenceImages = 3;
const maxReferenceImageBytes = 5 * 1024 * 1024;
const allowedReferenceImageTypes = ["image/png", "image/jpeg", "image/webp"];

function createReferenceImageId(file: File) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${file.name}-${file.lastModified}-${randomId}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error(`Unable to read ${file.name}.`));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function PlaygroundPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [template, setTemplate] = React.useState(defaultTemplate);
  const [jsonInput, setJsonInput] = React.useState(
    JSON.stringify(defaultData, null, 2)
  );
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiStatus, setAiStatus] = React.useState<string | null>(null);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [designSpec, setDesignSpec] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [referenceImages, setReferenceImages] = React.useState<ReferenceImage[]>([]);
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

  React.useEffect(() => {
    if (aiStatus !== "Widget ready") return;

    const timeout = window.setTimeout(() => {
      setAiStatus(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [aiStatus]);

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

  const generateWidget = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = aiPrompt.trim();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setAiError(null);
    setRenderError(null);
    setDesignSpec(null);
    setAiStatus("Planning the widget");

    try {
      const response = await fetch("/api/author-widget", {
        method: "POST",
        headers: {
          accept: "application/x-ndjson",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          referenceImages: referenceImages.map(({ name, dataUrl }) => ({
            name,
            dataUrl
          }))
        })
      });

      if (!response.ok) {
        const result = (await response.json()) as AuthorWidgetResponse;
        throw new Error(result.error || "Unable to generate widget.");
      }

      if (!response.body) {
        const result = (await response.json()) as AuthorWidgetResponse;
        if (typeof result.template !== "string") {
          throw new Error("The authoring agent returned an invalid template.");
        }
        setTemplate(result.template);
        setJsonInput(JSON.stringify(result.data ?? {}, null, 2));
        setTheme(result.theme ?? "light");
        setDesignSpec(result.designSpec ?? "Generated widget loaded.");
        setAiStatus("Widget ready");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedWidget = false;

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as GenerationStreamEvent;

          if (event.type === "status") {
            setAiStatus(event.message);
          } else if (event.type === "result") {
            if (typeof event.widget.template !== "string") {
              throw new Error("The authoring agent returned an invalid template.");
            }
            receivedWidget = true;
            setTemplate(event.widget.template);
            setJsonInput(JSON.stringify(event.widget.data ?? {}, null, 2));
            setTheme(event.widget.theme ?? "light");
            setDesignSpec(event.widget.designSpec ?? "Generated widget loaded.");
          } else if (event.type === "error") {
            throw new Error(event.error || "Unable to generate widget.");
          }
        }

        if (done) break;
      }

      if (!receivedWidget) {
        throw new Error("Generation finished without returning a widget.");
      }
    } catch (caught) {
      setAiError(
        caught instanceof Error ? caught.message : "Unable to generate widget."
      );
      setAiStatus(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReferenceImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = maxReferenceImages - referenceImages.length;
    if (remainingSlots <= 0) {
      setAiError("Remove a reference image before adding another.");
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      setAiError(`You can attach up to ${maxReferenceImages} reference images.`);
    }

    const validFiles = files.filter((file) => {
      if (!allowedReferenceImageTypes.includes(file.type)) {
        setAiError(`${file.name} must be PNG, JPEG, or WebP.`);
        return false;
      }
      if (file.size > maxReferenceImageBytes) {
        setAiError(`${file.name} must be 5 MB or smaller.`);
        return false;
      }
      return true;
    });

    try {
      const images = await Promise.all(
        validFiles.map(async (file) => ({
          id: createReferenceImageId(file),
          name: file.name,
          dataUrl: await readFileAsDataUrl(file)
        }))
      );

      setReferenceImages((currentImages) =>
        [...currentImages, ...images].slice(0, maxReferenceImages)
      );
    } catch (caught) {
      setAiError(
        caught instanceof Error ? caught.message : "Unable to read reference image."
      );
    }
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((currentImages) =>
      currentImages.filter((image) => image.id !== id)
    );
  };

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
            {isGenerating ? (
              <div className="flex min-h-48 w-full max-w-md items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-6 text-center">
                <div className="space-y-2">
                  <div className="mx-auto h-2 w-2 rounded-full bg-slate-900 motion-safe:animate-pulse" />
                  <p className="text-sm font-medium text-slate-800">
                    {aiStatus ?? "Generating the widget interface"}
                  </p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
          {!isGenerating && (aiStatus || designSpec) ? (
            <p className="mx-auto mt-4 max-w-md text-center text-xs italic leading-relaxed text-slate-500">
              {aiStatus ?? designSpec}
            </p>
          ) : null}
        </div>
      </div>

      <form
        className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-sm"
        onSubmit={generateWidget}
      >
        <h2 className="text-sm font-semibold text-slate-700">
          AI authoring agent
        </h2>
        <Textarea
          className="mt-2 min-h-24 resize-y text-sm"
          placeholder="Generate a package tracking history widget."
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          disabled={isGenerating}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">
              Optional reference images, up to {maxReferenceImages}
            </span>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              Add images
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                disabled={
                  isGenerating || referenceImages.length >= maxReferenceImages
                }
                onChange={handleReferenceImagesChange}
              />
            </label>
          </div>
          <Button
            className="cursor-pointer"
            disabled={!aiPrompt.trim() || isGenerating}
            type="submit"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </div>
        {referenceImages.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-sm">
            {referenceImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove ${image.name}`}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900"
                  onClick={() => removeReferenceImage(image.id)}
                  disabled={isGenerating}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {aiError ? (
          <p className="mt-3 text-xs text-rose-600">{aiError}</p>
        ) : null}
      </form>
    </div>
  );
}
