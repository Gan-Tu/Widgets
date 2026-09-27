import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ImagePlus, Sparkles } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/playground/CodeEditor";
import { cn } from "@/lib/utils";
import { WidgetRenderer } from "@/widget";
import { widgetExamples } from "@/examples/widgetExamples";
import type { ActionConfig } from "@/widget";

const PlaygroundSchema = z.any();

type PlaygroundErrorBoundaryProps = {
  children: React.ReactNode;
  onError: (error: unknown) => void;
  /** When this changes, a caught error is cleared so the preview can retry. */
  resetSignal: number;
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

  componentDidUpdate(prevProps: PlaygroundErrorBoundaryProps) {
    if (
      prevProps.resetSignal !== this.props.resetSignal &&
      this.state.hasError
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const defaultExample = widgetExamples.find((example) => example.id === "checkout-summary");
if (!defaultExample) throw new Error("The default Checkout example is missing.");
const defaultTemplate = defaultExample.template;
const defaultData = defaultExample.data;
const defaultExampleId = defaultExample.id;

// Keep the core demos first without changing the gallery's ordering.
const examples = [
  ...widgetExamples.filter((example) => example.category !== "Editorial"),
  ...widgetExamples.filter((example) => example.category === "Editorial")
];

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

type ParsedJson =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function parseJsonInput(input: string): ParsedJson {
  const sanitizeJson = (value: string) => value.replace(/,\s*([}\]])/g, "$1");

  try {
    return { ok: true, data: JSON.parse(input) };
  } catch {
    try {
      return { ok: true, data: JSON.parse(sanitizeJson(input)) };
    } catch (innerError) {
      return {
        ok: false,
        error: innerError instanceof Error ? innerError.message : "Invalid JSON"
      };
    }
  }
}

const previewWidthClasses = {
  mobile: "w-full max-w-[360px]",
  default: "w-full max-w-[480px]",
  full: "w-full"
} as const;

type PreviewWidth = keyof typeof previewWidthClasses;

/**
 * "side" puts the preview beside the editors (the default two-column split).
 * "above" and "below" stack it over or under them and turn the editors
 * horizontal, trading editor height for preview width — the layouts for
 * inspecting a wide widget. All only diverge at `lg`; narrow viewports stack
 * everything either way.
 */
type PreviewPlacement = "side" | "above" | "below";

type SegmentedOption<T extends string> = { value: T; label: string };

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="studio-segmented inline-flex items-center rounded-lg bg-[var(--plinth)] p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors  ",
            value === option.value
              ? "bg-[#111114] text-white"
              : "text-[var(--mid)] hover:text-[var(--ink)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EditorActionButton({
  onClick,
  children,
  disabled,
  ariaLabel
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium text-[var(--ink)] transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function PlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Raw editor state updates on every keystroke; applied state feeds the
  // preview and only updates after a short debounce (or an explicit load).
  const [template, setTemplate] = React.useState(defaultTemplate);
  const [isFormattingTemplate, setIsFormattingTemplate] = React.useState(false);
  const [templateFormatError, setTemplateFormatError] = React.useState<string | null>(null);
  const formattingRequestRef = React.useRef(0);
  const clearTemplateFormatting = React.useCallback(() => {
    formattingRequestRef.current += 1;
    setIsFormattingTemplate(false);
    setTemplateFormatError(null);
  }, []);
  const [jsonInput, setJsonInput] = React.useState(
    JSON.stringify(defaultData, null, 2)
  );
  const [appliedTemplate, setAppliedTemplate] = React.useState(defaultTemplate);
  const [appliedData, setAppliedData] = React.useState<unknown>(defaultData);
  const [appliedVersion, setAppliedVersion] = React.useState(0);
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [previewWidth, setPreviewWidth] = React.useState<PreviewWidth>("default");
  const [previewPlacement, setPreviewPlacement] =
    React.useState<PreviewPlacement>("side");
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<ActionConfig | null>(null);

  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiStatus, setAiStatus] = React.useState<string | null>(null);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [designSpec, setDesignSpec] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [referenceImages, setReferenceImages] = React.useState<ReferenceImage[]>([]);

  const [previewKey, setPreviewKey] = React.useState(0);
  const [selectedExampleId, setSelectedExampleId] = React.useState(defaultExampleId);
  const [copied, setCopied] = React.useState<"template" | "json" | null>(null);

  const lastLoadedExampleIdRef = React.useRef<string | null>(null);
  const copyTimeoutRef = React.useRef<number | null>(null);

  // Applies content to both the editors and the preview immediately, and
  // remounts the widget tree. Only used for example loads, AI results, and
  // reset — never for keystrokes.
  const applyContent = React.useCallback(
    (nextTemplate: string, nextData: unknown, nextTheme: "light" | "dark") => {
      const nextJson = JSON.stringify(nextData ?? {}, null, 2) ?? "{}";
      clearTemplateFormatting();
      setTemplate(nextTemplate);
      setJsonInput(nextJson);
      setAppliedTemplate(nextTemplate);
      setAppliedData(nextData ?? {});
      setTheme(nextTheme);
      setJsonError(null);
      setRenderError(null);
      setLastAction(null);
      setAppliedVersion((version) => version + 1);
      setPreviewKey((key) => key + 1);
    },
    [clearTemplateFormatting]
  );

  React.useEffect(() => {
    // Prefer reading from location.search so this effect reliably re-runs when the
    // query string changes (even if the URLSearchParams instance identity is stable).
    const params = new URLSearchParams(location.search);
    const exampleId = params.get("example");
    const componentId = params.get("component");

    const key = exampleId ? `example:${exampleId}` : componentId ? `component:${componentId}` : "default";
    if (lastLoadedExampleIdRef.current === key) return;

    let cancelled = false;

    const load = async () => {
      try {
        if (!exampleId && !componentId) {
          lastLoadedExampleIdRef.current = key;
          applyContent(defaultTemplate, defaultData, "light");
          setSelectedExampleId(defaultExampleId);
          setDesignSpec(null);
          return;
        }

        if (exampleId) {
          const match = widgetExamples.find((ex) => ex.id === exampleId);
          if (!match || cancelled) return;

          lastLoadedExampleIdRef.current = key;
          applyContent(match.template ?? "", match.data ?? {}, match.theme ?? "light");
          setSelectedExampleId(match.id);
          setDesignSpec(null);
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
          applyContent(match.template ?? "", match.data ?? {}, match.theme ?? "light");
          setSelectedExampleId("");
          setDesignSpec(null);
        }
      } catch {
        // If examples can't be loaded, keep the current editor contents.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [location.search, searchParams, applyContent]);

  // Parse once per JSON edit: a fresh parse per debounce tick would hand the
  // renderer a new data identity on template-only keystrokes, resetting
  // widget-local state and re-rendering for nothing.
  const parsedJson = React.useMemo(() => parseJsonInput(jsonInput), [jsonInput]);

  // Debounced application of editor input into the preview. Keeps the last
  // valid data when the JSON is mid-edit, and never remounts the widget tree.
  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAppliedTemplate(template);

      if (parsedJson.ok) {
        setAppliedData(parsedJson.data);
        setJsonError(null);
      } else {
        setJsonError(parsedJson.error);
      }

      setRenderError(null);
      setAppliedVersion((version) => version + 1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [template, parsedJson]);

  React.useEffect(() => {
    if (aiStatus !== "Widget ready") return;

    const timeout = window.setTimeout(() => {
      setAiStatus(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [aiStatus]);

  React.useEffect(() => {
    return () => {
      formattingRequestRef.current += 1;
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleWidgetAction = React.useCallback((action: ActionConfig) => {
    console.info("Playground action", action);
    setLastAction(action);
  }, []);

  const loadExample = (exampleId: string) => {
    const match = examples.find((example) => example.id === exampleId);
    if (!match) return;

    lastLoadedExampleIdRef.current = `example:${match.id}`;
    applyContent(match.template, match.data ?? {}, match.theme ?? "light");
    setSelectedExampleId(match.id);
    setDesignSpec(null);
    setSearchParams({ example: match.id }, { replace: true });
  };

  const resetPlayground = () => {
    lastLoadedExampleIdRef.current = "default";
    applyContent(defaultTemplate, defaultData, "light");
    setSelectedExampleId(defaultExampleId);
    setDesignSpec(null);
    setAiError(null);
    setAiStatus(null);
    setSearchParams({}, { replace: true });
  };

  const formatTemplate = async () => {
    const request = ++formattingRequestRef.current;
    setIsFormattingTemplate(true);
    setTemplateFormatError(null);
    try {
      const { formatWidgetTemplate } = await import("@/components/playground/formatTemplate");
      const formatted = await formatWidgetTemplate(template);
      // Typing, loading an example, or resetting while the formatter loads wins.
      if (formattingRequestRef.current === request) setTemplate(formatted);
    } catch (error) {
      if (formattingRequestRef.current === request) {
        setTemplateFormatError(error instanceof Error ? error.message : "Unable to format the template.");
      }
    } finally {
      if (formattingRequestRef.current === request) setIsFormattingTemplate(false);
    }
  };

  const formatJson = () => {
    try {
      setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
    } catch {
      // No-op when the JSON doesn't parse; the inline error already explains why.
    }
  };

  const copyToClipboard = async (which: "template" | "json") => {
    const text = which === "template" ? template : jsonInput;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard unavailable (permissions/insecure context); silently ignore.
    }
  };

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
        applyContent(result.template, result.data ?? {}, result.theme ?? "light");
        setSelectedExampleId("");
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
            applyContent(
              event.widget.template,
              event.widget.data ?? {},
              event.widget.theme ?? "light"
            );
            setSelectedExampleId("");
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

    const problems: string[] = [];
    const files = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      problems.push(`You can attach up to ${maxReferenceImages} reference images.`);
    }

    const validFiles = files.filter((file) => {
      if (!allowedReferenceImageTypes.includes(file.type)) {
        problems.push(`${file.name} must be PNG, JPEG, or WebP.`);
        return false;
      }
      if (file.size > maxReferenceImageBytes) {
        problems.push(`${file.name} must be 5 MB or smaller.`);
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
      problems.push(
        caught instanceof Error ? caught.message : "Unable to read reference image."
      );
    }

    setAiError(problems.length > 0 ? problems.join(" ") : null);
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((currentImages) =>
      currentImages.filter((image) => image.id !== id)
    );
  };

  const lastActionJson = lastAction
    ? JSON.stringify({ type: lastAction.type, payload: lastAction.payload })
    : null;

  return (
    <div className="playground-page space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-medium tracking-[-0.045em] text-[var(--ink)]">
            Playground
          </h1>
          <p className="mt-1 text-sm text-[var(--mid)]">
            A place to try things. Edit a template and watch it come to life.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Preview theme"
            value={theme}
            onChange={(next) => {
              setTheme(next);
              // A theme flip re-renders the widget; give the error boundary a
              // fresh reset signal so a previously crashed preview can recover
              // instead of staying blank with a stale error line.
              setRenderError(null);
              setAppliedVersion((version) => version + 1);
            }}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" }
            ]}
          />
          <SegmentedControl
            label="Preview width"
            value={previewWidth}
            onChange={setPreviewWidth}
            options={[
              { value: "mobile", label: "Mobile" },
              { value: "default", label: "Default" },
              { value: "full", label: "Full" }
            ]}
          />
          <SegmentedControl
            label="Preview placement"
            value={previewPlacement}
            onChange={setPreviewPlacement}
            options={[
              { value: "side", label: "Beside" },
              { value: "above", label: "Above" },
              { value: "below", label: "Below" }
            ]}
          />
          <button
            type="button"
            onClick={resetPlayground}
            disabled={isGenerating}
            className="cursor-pointer rounded-lg border border-[var(--control-border)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--mid)] transition-colors hover:bg-slate-50  disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </header>

      <form className="space-y-2" onSubmit={generateWidget}>
        <div className="playground-prompt flex items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--plinth)] py-2.5 pl-4 pr-2.5 focus-within:border-stone-400">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--ink)]" aria-hidden />
          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-stone-500 disabled:opacity-60"
            placeholder="Describe a widget — e.g. 'flight status card for SFO→JFK'"
            aria-label="Describe the widget to generate"
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            disabled={isGenerating}
          />
          <label
            className={cn(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700",
              (isGenerating || referenceImages.length >= maxReferenceImages) &&
                "pointer-events-none opacity-40"
            )}
            title={`Attach reference images (up to ${maxReferenceImages}, PNG/JPEG/WebP, 5 MB each)`}
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
            <span className="sr-only">Attach reference images</span>
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
          <Button
            type="submit"
            disabled={!aiPrompt.trim() || isGenerating}
            className="h-9 shrink-0 cursor-pointer rounded-lg bg-[var(--ink)] px-4 text-xs font-medium text-white hover:bg-stone-700"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </Button>
        </div>

        {aiStatus ? (
          <p className="pl-4 text-xs text-slate-500">{aiStatus}</p>
        ) : null}
        {aiError ? <p className="pl-4 text-xs text-rose-600">{aiError}</p> : null}

        {referenceImages.length > 0 ? (
          <div className="flex flex-wrap gap-2 pl-4">
            {referenceImages.map((image) => (
              <div
                key={image.id}
                className="group relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200/70 bg-white"
              >
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove ${image.name}`}
                  className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[11px] font-semibold text-[var(--mid)] shadow-sm transition-colors hover:bg-white hover:text-[var(--ink)]"
                  onClick={() => removeReferenceImage(image.id)}
                  disabled={isGenerating}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {designSpec ? (
          <details className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
            <summary className="cursor-pointer select-none text-xs font-semibold text-slate-700">
              Design spec
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[var(--mid)]">
              {designSpec}
            </p>
          </details>
        ) : null}
      </form>

      <div
        className={cn(
          "grid items-start gap-6",
          previewPlacement === "side" &&
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        )}
      >
        <section className="playground-editor min-w-0 rounded-xl border border-[var(--hairline)] bg-white p-5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Editors</h2>
            <select
              aria-label="Load example"
              className="h-8 w-[min(50%,14rem)] cursor-pointer rounded-lg border border-slate-200/70 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm  "
              value={selectedExampleId}
              onChange={(event) => {
                if (event.target.value) loadExample(event.target.value);
              }}
            >
              <option value="">Load example…</option>
              {examples.map((example) => (
                <option key={example.id} value={example.id}>
                  {example.title}
                </option>
              ))}
            </select>
          </div>

          <div
            className={cn(
              "mt-4",
              previewPlacement !== "side"
                ? "space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0"
                : "space-y-5"
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="playground-template"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Template
                </label>
                <div className="flex items-center gap-1">
                  <EditorActionButton
                    onClick={() => void formatTemplate()}
                    disabled={isFormattingTemplate || !template.trim()}
                    ariaLabel="Format template"
                  >
                    {isFormattingTemplate ? "Formatting…" : "Format"}
                  </EditorActionButton>
                  <EditorActionButton onClick={() => void copyToClipboard("template")}>
                    {copied === "template" ? "Copied" : "Copy"}
                  </EditorActionButton>
                </div>
              </div>
              <CodeEditor
                id="playground-template"
                language="widget"
                className="mt-2 min-h-[320px]"
                value={template}
                describedBy={templateFormatError ? "playground-template-format-error" : undefined}
                onChange={(value) => {
                  clearTemplateFormatting();
                  setTemplate(value);
                  setSelectedExampleId("");
                }}
              />
              {templateFormatError ? (
                <p id="playground-template-format-error" role="alert" className="mt-2 text-xs text-rose-600">
                  Couldn’t format template: {templateFormatError}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="playground-data"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Data (JSON)
                </label>
                <div className="flex items-center gap-1">
                  <EditorActionButton onClick={formatJson} ariaLabel="Format JSON">Format</EditorActionButton>
                  <EditorActionButton onClick={() => void copyToClipboard("json")}>
                    {copied === "json" ? "Copied" : "Copy"}
                  </EditorActionButton>
                </div>
              </div>
              <CodeEditor
                id="playground-data"
                language="json"
                className={cn(
                  "mt-2 min-h-[240px]",
                  // Side by side, the shorter data box would leave a ragged
                  // bottom edge next to the template — match their heights.
                  previewPlacement !== "side" && "lg:min-h-[320px]"
                )}
                value={jsonInput}
                onChange={(value) => {
                  setJsonInput(value);
                  setSelectedExampleId("");
                }}
              />
            </div>
          </div>
        </section>

        <section
          className={cn(
            "playground-preview min-w-0 rounded-xl bg-[var(--plinth)] p-5",
            // Sticky only helps when the preview sits beside a tall editor
            // column; stacked, it would pin over the page as you scroll.
            previewPlacement === "side" && "lg:sticky lg:top-20",
            // "Above" flips the stacked order; the grid wrapper makes the
            // order utility effective.
            previewPlacement === "above" && "order-first"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Preview</h2>
            {lastAction && lastActionJson ? (
              <div className="flex min-w-0 items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50 py-0.5 pl-2.5 pr-1">
                <code
                  className="truncate font-mono text-[11px] text-[var(--mid)]"
                  title={lastActionJson}
                >
                  {lastActionJson}
                </code>
                <button
                  type="button"
                  aria-label="Clear last action"
                  onClick={() => setLastAction(null)}
                  className="inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-stone-500">No actions yet</span>
            )}
          </div>

          {jsonError ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              JSON error: {jsonError} — showing the last valid data.
            </p>
          ) : null}
          {renderError ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Render error: {renderError}
            </p>
          ) : null}

          <div className="playground-preview-stage mt-4 flex min-w-0 justify-center">
            {isGenerating ? (
              <div className="flex min-h-48 w-full max-w-md items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50 p-6 text-center">
                <div className="space-y-2">
                  <div className="mx-auto h-2 w-2 rounded-full bg-[#111114] motion-safe:animate-pulse" />
                  <p className="text-sm font-medium text-slate-700">
                    {aiStatus ?? "Generating the widget interface"}
                  </p>
                </div>
              </div>
            ) : (
              <div className={cn("mx-auto", previewWidthClasses[previewWidth])}>
                <div
                  data-preview-theme={theme}
                  className={cn(
                    // Beside the editors a widget that caps its own width
                    // (Card size="lg" stops at 560px) would sit flush left;
                    // auto margins center it.
                    "playground-widget-frame [&>*]:mx-auto",
                    // Stacked above or below the editors, the whole point is
                    // seeing the widget at full size, so drop that self-imposed
                    // cap and let it fill the preview. The cap is an inline
                    // style on the widget root, so only `!important` beats it.
                    previewPlacement !== "side" && "[&>*]:max-w-none!",
                    theme === "dark" && "rounded-xl bg-[#08080a] p-6"
                  )}
                >
                  <PlaygroundErrorBoundary
                    key={previewKey}
                    resetSignal={appliedVersion}
                    onError={(caught) => {
                      setRenderError(
                        caught instanceof Error
                          ? caught.message
                          : "Preview failed to render"
                      );
                    }}
                  >
                    <WidgetRenderer
                      template={appliedTemplate}
                      schema={PlaygroundSchema}
                      data={appliedData}
                      theme={theme}
                      onAction={handleWidgetAction}
                    />
                  </PlaygroundErrorBoundary>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
