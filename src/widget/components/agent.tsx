import React from "react";

import { buildChangePayload, useWidgetForm, useWidgetTheme, useWidgetAction } from "../context";
import { useActionInvoker } from "../hooks";
import { resolveColor, sizeToCss } from "../style";
import type { ActionConfig, ThemeColor, WidgetIcon } from "../types";
import { safeHttpHref } from "../url";
import { Icon } from "./content";

type AgentStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

const EMPTY: never[] = [];

const statusIcon: Record<AgentStatus, WidgetIcon> = {
  pending: "empty-circle",
  running: "arrow-right",
  completed: "check-circle-filled",
  failed: "alert-circle",
  cancelled: "ban"
};

function AgentButton({
  label,
  icon,
  primary = false,
  disabled = false,
  onClick
}: {
  label: string;
  icon?: WidgetIcon;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="wg-agent-button"
      data-primary={primary || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {icon ? <Icon name={icon} size="xs" color="currentColor" /> : null}
      <span>{label}</span>
    </button>
  );
}

function StatusMark({ status }: { status: AgentStatus }) {
  return (
    <span className="wg-agent-status" data-status={status}>
      <Icon name={statusIcon[status]} size="xs" color="currentColor" />
    </span>
  );
}

/* ------------------------------------------------------------------
   Thinking, activity, and loading
   ------------------------------------------------------------------ */

type ThinkingStateProps = {
  label?: string;
  active?: boolean;
  elapsed?: string | number;
  icon?: WidgetIcon;
};

const ThinkingState: React.FC<ThinkingStateProps> = ({
  label = "Thinking",
  active = true,
  elapsed,
  icon = "sparkle"
}) => (
  <span className="wg-thinking-state" data-active={active || undefined} role="status">
    <Icon name={icon} size="xs" color="currentColor" />
    <span className={active ? "wg-agent-shimmer" : undefined}>{label}</span>
    {elapsed !== undefined ? <span className="wg-thinking-elapsed" aria-hidden>{elapsed}</span> : null}
  </span>
);

type ReasoningStep = {
  label: string;
  detail?: string;
  status?: AgentStatus;
};

type ThinkingReasoningProps = {
  label?: string;
  summary?: string;
  steps?: ReasoningStep[];
  active?: boolean;
  elapsed?: string | number;
  defaultOpen?: boolean;
  collapsible?: boolean;
  onToggleAction?: ActionConfig;
};

const ThinkingReasoning: React.FC<ThinkingReasoningProps> = ({
  label = "Thinking",
  summary,
  steps = [],
  active = false,
  elapsed,
  defaultOpen,
  collapsible = true,
  onToggleAction
}) => {
  const invoke = useActionInvoker();
  const [open, setOpen] = React.useState(defaultOpen ?? active);
  const canToggle = collapsible && !active;
  const heading = active
    ? label
    : summary ?? (elapsed !== undefined ? `Thought for ${elapsed}` : "Thought process");

  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const toggle = () => {
    if (!canToggle) return;
    const next = !open;
    setOpen(next);
    invoke(onToggleAction, { open: next });
  };

  return (
    <div className="wg-reasoning" data-active={active || undefined}>
      <button
        type="button"
        className="wg-reasoning-header"
        aria-expanded={open}
        disabled={!canToggle}
        onClick={toggle}
      >
        <span className={active ? "wg-agent-shimmer" : undefined}>{heading}</span>
        {canToggle ? (
          <Icon name={open ? "chevron-up" : "chevron-down"} size="xs" color="tertiary" />
        ) : null}
      </button>
      <div className="wg-reasoning-body" data-open={open || undefined} aria-hidden={!open}>
        <div className="wg-reasoning-steps">
          {steps.map((step, index) => {
            const status = step.status ?? (active && index === steps.length - 1 ? "running" : "completed");
            return (
              <div className="wg-reasoning-step" data-status={status} key={`${step.label}-${index}`}>
                <span className="wg-reasoning-rail">
                  {status === "completed" ? (
                    <Icon name="check" size="xs" color="currentColor" />
                  ) : status === "failed" ? (
                    <Icon name="x" size="xs" color="currentColor" />
                  ) : (
                    <span className="wg-reasoning-dot" />
                  )}
                </span>
                <span className="wg-reasoning-copy">
                  <span>{step.label}</span>
                  {step.detail ? <small>{step.detail}</small> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Thinking = ThinkingReasoning;

type OrbVariant =
  | "S1" | "S2" | "S3" | "S4" | "S5"
  | "G1" | "G2" | "G3" | "G4" | "G5"
  | "C1" | "C2" | "C3" | "C4" | "C5"
  | "B1" | "B2" | "B3" | "B4" | "B5"
  | "M1" | "M2" | "M3" | "M4" | "M5";

type OrbProps = {
  variant?: OrbVariant;
  size?: number | string;
  color?: string | ThemeColor;
  label?: string;
};

const Orb: React.FC<OrbProps> = ({ variant = "S1", size = 20, color, label }) => {
  const theme = useWidgetTheme();
  const family = variant.slice(0, 1);
  const resolved = (color ? resolveColor(color, theme) : undefined) ?? "var(--widget-accent)";
  const style = {
    "--wg-orb-size": sizeToCss(size),
    "--wg-orb-color": resolved
  } as React.CSSProperties;

  return (
    <span className="wg-orb-wrap" role={label ? "status" : undefined} aria-label={label}>
      <span className="wg-orb" data-family={family} data-variant={variant} style={style} aria-hidden>
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} style={{ "--wg-orb-i": index } as React.CSSProperties} />
        ))}
      </span>
      {label ? <span className="wg-orb-label">{label}</span> : null}
    </span>
  );
};

const Orbs = Orb;

type LoadingStateProps = {
  label?: string;
  elapsed?: string | number;
  variant?: "drive" | "dots" | "orbit" | "surfer";
};

const LoadingState: React.FC<LoadingStateProps> = ({
  label = "Working",
  elapsed,
  variant = "drive"
}) => {
  const orbVariant: OrbVariant =
    variant === "dots" ? "S3" : variant === "orbit" ? "C3" : variant === "surfer" ? "G4" : "M2";
  return (
    <div className="wg-loading-state" role="status">
      <Orb variant={orbVariant} size={22} />
      <span className="wg-agent-shimmer">{label}</span>
      {elapsed !== undefined ? <span className="wg-loading-elapsed" aria-hidden>{elapsed}</span> : null}
    </div>
  );
};

/* ------------------------------------------------------------------
   Responses, citations, code, and generated media
   ------------------------------------------------------------------ */

type TextResponseProps = {
  value?: string;
  children?: React.ReactNode;
  compact?: boolean;
};

const TextResponse: React.FC<TextResponseProps> = ({ value, children, compact = false }) => (
  <div className="wg-text-response" data-compact={compact || undefined}>
    {value ?? children}
  </div>
);

type CitationSource = {
  id?: string | number;
  label: string;
  host?: string;
  url?: string;
};

type InlineCitationsProps = {
  text: string;
  sources?: CitationSource[];
};

// Ids may be strings ("owasp") or out-of-order numbers; only a finite numeric
// id overrides the positional number, so the badge never renders NaN.
function citationNumber(source: CitationSource, index: number): number {
  const numeric = typeof source.id === "number" ? source.id : Number(source.id);
  return Number.isFinite(numeric) ? numeric : index + 1;
}

function CitationLink({ source, number }: { source: CitationSource; number: number }) {
  const href = safeHttpHref(source.url);
  const content = (
    <>
      <span className="wg-citation-number">{number}</span>
      <span className="wg-citation-label">{source.label}</span>
      {source.host ? <span className="wg-citation-host">· {source.host}</span> : null}
    </>
  );
  return href ? (
    <a className="wg-citation-source" href={href} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <span className="wg-citation-source">{content}</span>
  );
}

const InlineCitations: React.FC<InlineCitationsProps> = ({ text, sources = [] }) => {
  const pieces = String(text ?? "").split(/(\[\d+\])/g);
  return (
    <div className="wg-inline-citations">
      <p>
        {pieces.map((piece, index) => {
          const match = piece.match(/^\[(\d+)\]$/);
          if (!match) return <React.Fragment key={index}>{piece}</React.Fragment>;
          const number = Number(match[1]);
          const source =
            sources.find((item, sourceIndex) => citationNumber(item, sourceIndex) === number) ??
            sources[number - 1];
          return (
            <sup className="wg-citation-marker" key={index} title={source?.label}>
              {number}
            </sup>
          );
        })}
      </p>
      {sources.length > 0 ? (
        <div className="wg-citation-sources">
          {sources.map((source, index) => (
            <CitationLink source={source} number={citationNumber(source, index)} key={`${source.label}-${index}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

type StreamingAction = {
  label: string;
  action: ActionConfig;
  icon?: WidgetIcon;
};

type StreamingTextProps = {
  text: string;
  streaming?: boolean;
  speed?: number;
  loop?: boolean;
  loopDelay?: number;
  sources?: CitationSource[];
  actions?: StreamingAction[];
  followUps?: StreamingAction[];
};

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  streaming = true,
  speed = 10,
  loop = false,
  loopDelay = 1800,
  sources = [],
  actions = [],
  followUps = []
}) => {
  const invoke = useActionInvoker();
  const safeText = String(text ?? "");
  const [visible, setVisible] = React.useState(streaming ? Math.min(1, safeText.length) : safeText.length);

  React.useEffect(() => {
    if (!streaming) {
      setVisible(safeText.length);
      return;
    }
    // Keep chars/sec exact but never tick faster than a display frame: a
    // sub-16ms interval only burns renders that can never be painted.
    const base = Math.max(8, speed);
    const multiplier = Math.ceil(16 / base);
    const step = 2 * multiplier;
    let visibleCount = Math.min(1, safeText.length);
    let interval: number | undefined;
    let restartTimeout: number | undefined;

    const start = () => {
      visibleCount = Math.min(1, safeText.length);
      setVisible(visibleCount);
      if (safeText.length <= 1) return;

      interval = window.setInterval(() => {
        visibleCount = Math.min(safeText.length, visibleCount + step);
        setVisible(visibleCount);
        if (visibleCount < safeText.length) return;

        window.clearInterval(interval);
        interval = undefined;
        if (loop) {
          restartTimeout = window.setTimeout(start, Math.max(0, loopDelay));
        }
      }, base * multiplier);
    };

    start();
    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      if (restartTimeout !== undefined) window.clearTimeout(restartTimeout);
    };
  }, [loop, loopDelay, safeText, speed, streaming]);

  const isStreaming = streaming && visible < safeText.length;
  return (
    <div className="wg-streaming-text">
      <p className="wg-streaming-prose">
        {safeText.slice(0, visible)}
        <span className="wg-streaming-caret" data-active={isStreaming || undefined} aria-hidden />
      </p>
      {actions.length > 0 ? (
        <div className="wg-streaming-actions">
          {actions.map((item, index) => (
            <button type="button" onClick={() => invoke(item.action)} aria-label={item.label} key={`${item.label}-${index}`}>
              <Icon name={item.icon ?? "sparkle"} size="xs" color="currentColor" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
      {sources.length > 0 ? (
        <details className="wg-streaming-sources">
          <summary>{sources.length} sources</summary>
          <div>
            {sources.map((source, index) => (
              <CitationLink source={source} number={index + 1} key={`${source.label}-${index}`} />
            ))}
          </div>
        </details>
      ) : null}
      {followUps.length > 0 ? (
        <div className="wg-follow-ups">
          <span>Follow-ups</span>
          {followUps.map((item, index) => (
            <button type="button" onClick={() => invoke(item.action)} key={`${item.label}-${index}`}>
              <Icon name={item.icon ?? "arrow-right"} size="xs" color="currentColor" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

type CodeBlockProps = {
  code: string;
  language?: string;
  file?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  streaming?: boolean;
  highlightLines?: number[];
  onCopyAction?: ActionConfig;
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "text",
  file,
  showLineNumbers = true,
  copyable = true,
  streaming = false,
  highlightLines = EMPTY,
  onCopyAction
}) => {
  const invoke = useActionInvoker();
  const [copied, setCopied] = React.useState(false);
  const lines = React.useMemo(() => String(code ?? "").split("\n"), [code]);
  const copy = () => {
    invoke(onCopyAction ?? { type: "copy", handler: "client", payload: { value: code } });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  // The body is static per (code, options); memoizing it lets React skip the
  // whole n-line subtree when only the copy-feedback state toggles.
  const body = React.useMemo(
    () => (
      <div className="wg-code-body">
        {lines.map((line, index) => (
          <div
            className="wg-code-line"
            data-highlighted={highlightLines.includes(index + 1) || undefined}
            style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
            key={index}
          >
            {showLineNumbers ? <span className="wg-code-number">{index + 1}</span> : null}
            <code>{line || "\u00a0"}</code>
          </div>
        ))}
      </div>
    ),
    [lines, highlightLines, showLineNumbers]
  );
  return (
    <div className="wg-code-block" data-streaming={streaming || undefined}>
      <div className="wg-code-header">
        <span>
          <Icon name="square-code" size="xs" color="tertiary" />
          <strong>{file ?? language}</strong>
          {file ? <small>{language}</small> : null}
        </span>
        {copyable ? (
          <button type="button" className="wg-code-copy" onClick={copy}>
            <Icon name={copied ? "check" : "copy"} size="xs" color="currentColor" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        ) : null}
      </div>
      {body}
    </div>
  );
};

type DiffLine = {
  oldLine?: number;
  newLine?: number;
  type?: "context" | "add" | "remove";
  text: string;
};

type FileDiffProps = {
  file: string;
  rows?: DiffLine[];
  language?: string;
  compact?: boolean;
};

const FileDiff: React.FC<FileDiffProps> = ({ file, rows = [], language, compact = false }) => {
  const added = rows.filter((row) => row.type === "add").length;
  const removed = rows.filter((row) => row.type === "remove").length;
  return (
    <div className="wg-file-diff" data-compact={compact || undefined}>
      <div className="wg-diff-header">
        <span>
          <Icon name="code" size="xs" color="tertiary" />
          <strong>{file}</strong>
          {language ? <small>{language}</small> : null}
        </span>
        <span className="wg-diff-stats"><b>+{added}</b><i>−{removed}</i></span>
      </div>
      <div className="wg-diff-lines">
        {rows.map((row, index) => {
          const type = row.type ?? "context";
          return (
            <div className="wg-diff-line" data-type={type} key={index}>
              <span>{row.oldLine ?? ""}</span>
              <span>{row.newLine ?? ""}</span>
              <b>{type === "add" ? "+" : type === "remove" ? "−" : ""}</b>
              <code>{row.text}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ImageGenerationProps = {
  prompt?: string;
  resolution?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | string;
  progress?: number;
  status?: string;
  image?: string;
  alt?: string;
};

const ImageGeneration: React.FC<ImageGenerationProps> = ({
  prompt = "Generating a new image",
  resolution = "1024 × 1024",
  aspectRatio = "square",
  progress,
  status = "Generating image",
  image,
  alt = "Generated image"
}) => {
  const src = safeHttpHref(image);
  const ratio = aspectRatio === "portrait" ? "4 / 5" : aspectRatio === "landscape" ? "16 / 9" : aspectRatio === "square" ? "1 / 1" : aspectRatio;
  return (
    <div className="wg-image-generation">
      <div className="wg-image-canvas" style={{ aspectRatio: ratio }}>
        {src ? <img src={src} alt={alt} /> : <span className="wg-image-grid" aria-hidden />}
        {!src ? <span className="wg-image-glow" aria-hidden /> : null}
        <span className="wg-image-resolution">{resolution}</span>
        {progress !== undefined ? (
          <span className="wg-image-progress"><i style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} /></span>
        ) : null}
      </div>
      <div className="wg-image-meta">
        <strong>{status}</strong>
        <span>“{prompt}”</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   Tasks and tool activity
   ------------------------------------------------------------------ */

type AgentTask = {
  id?: string | number;
  label: string;
  detail?: string;
  status?: AgentStatus;
  progress?: number;
  children?: { label: string; detail?: string; status?: AgentStatus }[];
};

type TaskListProps = {
  title?: string;
  items?: AgentTask[];
  defaultOpen?: boolean;
  collapsible?: boolean;
  onItemClickAction?: ActionConfig;
};

const TaskList: React.FC<TaskListProps> = ({
  title = "To-dos",
  items = [],
  defaultOpen = true,
  collapsible = true,
  onItemClickAction
}) => {
  const invoke = useActionInvoker();
  const [open, setOpen] = React.useState(defaultOpen);
  const complete = items.filter((item) => item.status === "completed").length;
  return (
    <div className="wg-task-list">
      <button
        type="button"
        className="wg-task-list-header"
        disabled={!collapsible}
        aria-expanded={open}
        onClick={() => collapsible && setOpen((value) => !value)}
      >
        <span><Icon name="clipboard" size="xs" color="tertiary" /><strong>{title}</strong></span>
        <span>{complete}/{items.length} {collapsible ? <Icon name={open ? "chevron-up" : "chevron-down"} size="xs" color="tertiary" /> : null}</span>
      </button>
      {open ? (
        <div className="wg-task-list-items">
          {items.map((item, index) => {
            const status = item.status ?? "pending";
            return (
              <button
                type="button"
                className="wg-task-list-item"
                data-status={status}
                disabled={!onItemClickAction}
                onClick={() => invoke(onItemClickAction, { id: item.id ?? index, item })}
                key={String(item.id ?? index)}
              >
                <Icon name={statusIcon[status]} size="sm" color="currentColor" />
                <span><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</span>
                {item.progress !== undefined ? <em>{Math.round(item.progress)}%</em> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

type ToolChip = {
  id?: string | number;
  type?: "thinking" | "write" | "command" | "read" | "message" | "search";
  label: string;
  detail?: string;
  status?: AgentStatus;
  additions?: number;
  deletions?: number;
};

type ToolChipsProps = {
  summary?: string;
  items?: ToolChip[];
  defaultOpen?: boolean;
  onItemClickAction?: ActionConfig;
};

const toolIcon: Record<NonNullable<ToolChip["type"]>, WidgetIcon> = {
  thinking: "sparkle",
  write: "write",
  command: "terminal",
  read: "document",
  message: "message",
  search: "search"
};

const ToolChips: React.FC<ToolChipsProps> = ({
  summary,
  items = [],
  defaultOpen = true,
  onItemClickAction
}) => {
  const invoke = useActionInvoker();
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="wg-tool-chips">
      <button type="button" className="wg-tool-summary" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{summary ?? `${items.length} tool call${items.length === 1 ? "" : "s"}`}</span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size="xs" color="tertiary" />
      </button>
      {open ? (
        <div className="wg-tool-chip-list">
          {items.map((item, index) => {
            const type = item.type ?? "thinking";
            return (
              <button
                type="button"
                className="wg-tool-chip"
                disabled={!onItemClickAction}
                onClick={() => invoke(onItemClickAction, { id: item.id ?? index, item })}
                key={String(item.id ?? index)}
              >
                <Icon name={toolIcon[type]} size="xs" color="tertiary" />
                <span><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</span>
                {item.additions !== undefined ? <b>+{item.additions}</b> : null}
                {item.deletions !== undefined ? <i>−{item.deletions}</i> : null}
                {item.status ? <StatusMark status={item.status} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

type TaskRowsProps = {
  items?: AgentTask[];
  variant?: "capsules" | "list";
  onItemClickAction?: ActionConfig;
};

const statusLabel: Record<AgentStatus, string> = {
  pending: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled"
};

function TaskDisc({ status, index }: { status: AgentStatus; index: number }) {
  return (
    <span className="wg-task-disc" data-status={status}>
      {status === "completed" ? (
        <Icon name="check" size="xs" color="currentColor" />
      ) : status === "failed" ? (
        <Icon name="x" size="xs" color="currentColor" />
      ) : status === "cancelled" ? (
        <Icon name="ban" size="xs" color="currentColor" />
      ) : (
        <i>{index + 1}</i>
      )}
    </span>
  );
}

const TaskRows: React.FC<TaskRowsProps> = ({ items = [], variant = "capsules", onItemClickAction }) => {
  const invoke = useActionInvoker();
  return (
    <div className="wg-task-rows" data-variant={variant}>
      {items.map((item, index) => {
        const status = item.status ?? "pending";
        const hasChildren = variant === "list" && Boolean(item.children?.length);
        return (
          <div className="wg-task-row-wrap" data-status={status} key={String(item.id ?? index)}>
            <button
              type="button"
              className="wg-task-row"
              disabled={!onItemClickAction}
              onClick={() => invoke(onItemClickAction, { id: item.id ?? index, item })}
            >
              <TaskDisc status={status} index={index} />
              <span><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</span>
              {status === "running" && item.progress !== undefined ? <em>{Math.round(item.progress)}%</em> : null}
              <span className="wg-task-pill" data-status={status}>{statusLabel[status]}</span>
            </button>
            {hasChildren ? (
              <div className="wg-task-children">
                {item.children?.map((child, childIndex) => (
                  <span data-status={child.status ?? "pending"} key={`${child.label}-${childIndex}`}>
                    <Icon
                      name={child.status === "completed" ? "check" : child.status === "running" ? "arrow-right" : "empty-circle"}
                      size="xs"
                      color="currentColor"
                    />
                    <span>{child.label}</span>
                    {child.detail ? <small>{child.detail}</small> : null}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
   Agent input, approval, chat, and recommendations
   ------------------------------------------------------------------ */

type AgentModel = { value: string; label: string };
type AgentAttachment = {
  id?: string | number;
  name: string;
  type?: string;
  size?: string;
};
type AgentCommand = {
  value: string;
  label: string;
  description?: string;
  icon?: WidgetIcon;
};
type AgentSkill = {
  value: string;
  label: string;
  description?: string;
  icon?: WidgetIcon;
};

type AgentInputProps = {
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  models?: AgentModel[];
  defaultModel?: string;
  attachments?: AgentAttachment[];
  commands?: AgentCommand[];
  skills?: AgentSkill[];
  selectedSkills?: string[];
  submitAction?: ActionConfig;
  attachAction?: ActionConfig;
  removeAttachmentAction?: ActionConfig;
  commandAction?: ActionConfig;
  skillAction?: ActionConfig;
  enhanceAction?: ActionConfig;
  cancelEnhanceAction?: ActionConfig;
  onChangeAction?: ActionConfig;
  enhancing?: boolean;
  disabled?: boolean;
  rows?: number;
};

const AgentInput: React.FC<AgentInputProps> = ({
  name = "prompt",
  placeholder = "Ask AI Agent",
  defaultValue = "",
  models = [],
  defaultModel,
  attachments = [],
  commands = EMPTY,
  skills = EMPTY,
  selectedSkills = [],
  submitAction,
  attachAction,
  removeAttachmentAction,
  commandAction,
  skillAction,
  enhanceAction,
  cancelEnhanceAction,
  onChangeAction,
  enhancing = false,
  disabled = false,
  rows = 2
}) => {
  const form = useWidgetForm();
  const dispatch = useWidgetAction();
  const invoke = useActionInvoker();
  const [value, setValue] = React.useState(defaultValue);
  const [model, setModel] = React.useState(defaultModel ?? models[0]?.value ?? "");
  const [menu, setMenu] = React.useState<"commands" | "skills" | null>(null);
  const [activeMenuItem, setActiveMenuItem] = React.useState(0);

  // Publish the draft into the surrounding form. The write itself produces a
  // new form identity, so an unguarded [form] dep would re-run this effect
  // every commit and loop forever; the ref makes the sync converge.
  const lastFormSyncRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!form) return;
    const key = `${name} ${value}`;
    if (lastFormSyncRef.current === key) return;
    lastFormSyncRef.current = key;
    form.setValue(name, value);
  }, [form, name, value]);

  const change = (next: string) => {
    setValue(next);
    const slashMatch = next.match(/(?:^|\s)\/([^\s]*)$/);
    if (slashMatch && commands.length > 0) {
      setMenu("commands");
      setActiveMenuItem(0);
    } else if (menu === "commands") {
      setMenu(null);
    }
    if (onChangeAction && dispatch) dispatch(onChangeAction, buildChangePayload(name, next));
  };
  const submit = () => {
    if (!value.trim()) return;
    invoke(submitAction, { [name]: value, value, model });
  };

  const visibleCommands = React.useMemo(() => {
    const query = value.match(/(?:^|\s)\/([^\s]*)$/)?.[1]?.toLowerCase() ?? "";
    return commands.filter((item) => `${item.label} ${item.value} ${item.description ?? ""}`.toLowerCase().includes(query));
  }, [commands, value]);
  const menuItems = menu === "commands" ? visibleCommands : skills;
  const chooseCommand = (item: AgentCommand) => {
    const next = value.replace(/(^|\s)\/[^\s]*$/, (_match, lead: string) => `${lead}/${item.value} `);
    setValue(next);
    // Record the sync key before writing so the form-sync effect doesn't
    // repeat this exact write on the next commit.
    lastFormSyncRef.current = `${name} ${next}`;
    form?.setValue(name, next);
    if (onChangeAction && dispatch) dispatch(onChangeAction, buildChangePayload(name, next));
    setMenu(null);
    invoke(commandAction, buildChangePayload("command", item.value));
  };
  const chooseSkill = (item: AgentSkill) => {
    setMenu(null);
    invoke(skillAction, buildChangePayload("skill", item.value));
  };

  return (
    <div className="wg-agent-input" data-disabled={disabled || undefined}>
      {attachments.length > 0 || selectedSkills.length > 0 ? (
        <div className="wg-agent-input-chips">
          {attachments.map((attachment, index) => (
            <span className="wg-agent-attachment" key={String(attachment.id ?? index)}>
              <Icon name="paperclip" size="xs" color="tertiary" />
              <span><strong>{attachment.name}</strong>{attachment.size ? <small>{attachment.size}</small> : null}</span>
              {removeAttachmentAction ? (
                <button type="button" onClick={() => invoke(removeAttachmentAction, { id: attachment.id ?? index, attachment })} aria-label={`Remove ${attachment.name}`}>
                  <Icon name="x" size="xs" color="currentColor" />
                </button>
              ) : null}
            </span>
          ))}
          {selectedSkills.map((skill) => <span className="wg-agent-skill-chip" key={skill}>@{skill}</span>)}
        </div>
      ) : null}
      <textarea
        name={name}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (menu && menuItems.length > 0) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setActiveMenuItem((current) => {
                const delta = event.key === "ArrowDown" ? 1 : -1;
                return (current + delta + menuItems.length) % menuItems.length;
              });
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              const item = menuItems[activeMenuItem];
              if (menu === "commands" && item) chooseCommand(item as AgentCommand);
              if (menu === "skills" && item) chooseSkill(item as AgentSkill);
              return;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setMenu(null);
              return;
            }
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      {menu && menuItems.length > 0 ? (
        <div className="wg-agent-palette" role="listbox" aria-label={menu === "commands" ? "Commands" : "Skills"}>
          <small>{menu === "commands" ? "Commands" : "Skills"}</small>
          {menuItems.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={activeMenuItem === index}
              data-active={activeMenuItem === index || undefined}
              onMouseEnter={() => setActiveMenuItem(index)}
              onClick={() => menu === "commands" ? chooseCommand(item as AgentCommand) : chooseSkill(item as AgentSkill)}
              key={item.value}
            >
              <Icon name={item.icon ?? (menu === "commands" ? "terminal" : "sparkle")} size="sm" color="tertiary" />
              <span><strong>{item.label}</strong>{item.description ? <small>{item.description}</small> : null}</span>
              <kbd>{menu === "commands" ? `/${item.value}` : `@${item.value}`}</kbd>
            </button>
          ))}
        </div>
      ) : null}
      <div className="wg-agent-input-toolbar">
        <span>
          {attachAction ? (
            <button type="button" onClick={() => invoke(attachAction)} aria-label="Attach files">
              <Icon name="paperclip" size="sm" color="currentColor" />
            </button>
          ) : null}
          {skills.length > 0 ? (
            <button type="button" data-active={menu === "skills" || undefined} onClick={() => { setMenu((current) => current === "skills" ? null : "skills"); setActiveMenuItem(0); }} aria-label="Choose skills">
              <Icon name="sparkle" size="sm" color="currentColor" />
            </button>
          ) : null}
          {enhanceAction || enhancing ? (
            <button
              type="button"
              data-active={enhancing || undefined}
              onClick={() => enhancing ? invoke(cancelEnhanceAction) : invoke(enhanceAction, buildChangePayload(name, value))}
              aria-label={enhancing ? "Cancel prompt enhancement" : "Enhance prompt"}
              disabled={enhancing && !cancelEnhanceAction}
            >
              <Icon name={enhancing ? "x" : "sparkle-double"} size="sm" color="currentColor" />
            </button>
          ) : null}
        </span>
        <span>
          {models.length > 0 ? (
            <select value={model} onChange={(event) => setModel(event.target.value)} aria-label="Model">
              {models.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          ) : null}
          <button
            type="button"
            className="wg-agent-send"
            disabled={disabled || !submitAction || !value.trim()}
            onClick={submit}
            aria-label="Send"
          >
            <Icon name="arrow-up" size="sm" color="currentColor" />
          </button>
        </span>
      </div>
    </div>
  );
};

const PromptInput = AgentInput;

type ApprovalOption = { label: string; value: string; description?: string };
type ApprovalQuestion = {
  id: string;
  title: string;
  description?: string;
  options?: ApprovalOption[];
  multiple?: boolean;
  allowOther?: boolean;
  otherPlaceholder?: string;
};

type ApprovalCardProps = {
  variant?: "questions" | "command" | "plan";
  title: string;
  description?: string;
  options?: ApprovalOption[];
  questions?: ApprovalQuestion[];
  defaultValue?: string;
  allowOther?: boolean;
  otherPlaceholder?: string;
  autoAdvance?: boolean;
  command?: string;
  planItems?: string[];
  approveLabel?: string;
  rejectLabel?: string;
  approveAction?: ActionConfig;
  rejectAction?: ActionConfig;
  skipAction?: ActionConfig;
  viewAction?: ActionConfig;
  onQuestionChangeAction?: ActionConfig;
  countdown?: number;
};

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  variant = "questions",
  title,
  description,
  options = [],
  questions = [],
  defaultValue = "",
  allowOther = true,
  otherPlaceholder = "Type something…",
  autoAdvance = false,
  command,
  planItems = [],
  approveLabel = "Approve",
  rejectLabel = "Skip",
  approveAction,
  rejectAction,
  skipAction,
  viewAction,
  onQuestionChangeAction,
  countdown
}) => {
  const invoke = useActionInvoker();
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>(() => ({
    [questions[0]?.id ?? "question"]: defaultValue
  }));
  const [otherAnswers, setOtherAnswers] = React.useState<Record<string, string>>({});
  const questionList: ApprovalQuestion[] = questions.length > 0 ? questions : [{
    id: "question",
    title,
    description,
    options,
    allowOther,
    otherPlaceholder
  }];
  const activeQuestion = questionList[Math.min(questionIndex, questionList.length - 1)];
  const questionId = activeQuestion?.id ?? "question";
  const selected = answers[questionId] ?? "";
  const selectedValues = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const other = otherAnswers[questionId] ?? "";
  const answer = selectedValues.length > 0 ? (activeQuestion?.multiple ? selectedValues : selectedValues[0]) : other;
  // Typing an "other" answer blanks the canonical entry for that question, so
  // the submit payload must fold EVERY question's free text back in — not just
  // the question that happens to be on screen when Approve/Skip is pressed.
  const answerMap: Record<string, string | string[]> = { ...answers };
  for (const [id, text] of Object.entries(otherAnswers)) {
    const chosen = answerMap[id];
    const hasChosen = Array.isArray(chosen) ? chosen.length > 0 : Boolean(chosen);
    if (text && !hasChosen) answerMap[id] = text;
  }
  const goToQuestion = (next: number) => {
    const bounded = Math.max(0, Math.min(next, questionList.length - 1));
    setQuestionIndex(bounded);
    invoke(onQuestionChangeAction, { index: bounded, id: questionList[bounded]?.id, value: bounded });
  };
  const selectOption = (option: ApprovalOption) => {
    setOtherAnswers((current) => ({ ...current, [questionId]: "" }));
    setAnswers((current) => {
      if (!activeQuestion?.multiple) return { ...current, [questionId]: option.value };
      const values = Array.isArray(current[questionId]) ? current[questionId] as string[] : [];
      return {
        ...current,
        [questionId]: values.includes(option.value)
          ? values.filter((value) => value !== option.value)
          : [...values, option.value]
      };
    });
    if (autoAdvance && !activeQuestion?.multiple && questionIndex < questionList.length - 1) {
      window.setTimeout(() => goToQuestion(questionIndex + 1), 240);
    }
  };
  return (
    <div className="wg-approval-card" data-variant={variant}>
      <div className="wg-approval-heading">
        <span className="wg-approval-icon"><Icon name={variant === "command" ? "terminal" : variant === "plan" ? "clipboard" : "circle-question"} size="sm" color="currentColor" /></span>
        <span>
          <strong>{variant === "questions" ? activeQuestion?.title ?? title : title}</strong>
          {(variant === "questions" ? activeQuestion?.description : description) ? <small>{variant === "questions" ? activeQuestion?.description : description}</small> : null}
        </span>
        {variant === "questions" && questionList.length > 1 ? <em className="wg-approval-position">{questionIndex + 1}/{questionList.length}</em> : null}
      </div>
      {variant === "questions" ? (
        <div className="wg-approval-options">
          {(activeQuestion?.options ?? []).map((option, optionIndex) => (
            <label data-selected={selectedValues.includes(option.value) || undefined} key={option.value}>
              <input
                type={activeQuestion?.multiple ? "checkbox" : "radio"}
                checked={selectedValues.includes(option.value)}
                onChange={() => selectOption(option)}
              />
              <i className="wg-approval-letter" aria-hidden>
                {selectedValues.includes(option.value) ? (
                  <Icon name="check" size="xs" color="currentColor" />
                ) : (
                  String.fromCharCode(65 + optionIndex)
                )}
              </i>
              <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
            </label>
          ))}
          {activeQuestion?.allowOther !== false ? (
            <input
              className="wg-approval-other"
              value={other}
              placeholder={activeQuestion?.otherPlaceholder ?? otherPlaceholder}
              onChange={(event) => {
                const next = event.target.value;
                setOtherAnswers((current) => ({ ...current, [questionId]: next }));
                if (next) setAnswers((current) => ({ ...current, [questionId]: activeQuestion?.multiple ? [] : "" }));
              }}
            />
          ) : null}
          {questionList.length > 1 ? (
            <div className="wg-approval-progress" aria-label={`Question ${questionIndex + 1} of ${questionList.length}`}>
              {questionList.map((question, index) => <span data-active={index <= questionIndex || undefined} key={question.id} />)}
            </div>
          ) : null}
        </div>
      ) : null}
      {variant === "command" && command ? <CodeBlock code={command} language="shell" showLineNumbers={false} copyable={false} /> : null}
      {variant === "plan" && planItems.length > 0 ? (
        <ol className="wg-approval-plan">{planItems.map((item, index) => <li key={index}><span>{index + 1}</span>{item}</li>)}</ol>
      ) : null}
      <div className="wg-approval-footer">
        <span>{countdown !== undefined ? `Auto approve in ${countdown}s` : null}</span>
        <div>
          {variant === "questions" && questionIndex > 0 ? <AgentButton label="Previous" onClick={() => goToQuestion(questionIndex - 1)} /> : null}
          {viewAction ? <AgentButton label="View plan" onClick={() => invoke(viewAction)} /> : null}
          {skipAction || rejectAction ? <AgentButton label={rejectLabel} onClick={() => invoke(skipAction ?? rejectAction, { value: answer, answers: answerMap })} /> : null}
          {variant === "questions" && questionIndex < questionList.length - 1 ? (
            <AgentButton label="Next" primary disabled={!answer || (Array.isArray(answer) && answer.length === 0)} onClick={() => goToQuestion(questionIndex + 1)} />
          ) : (
            <AgentButton
              label={approveLabel}
              primary
              disabled={!approveAction || (variant === "questions" && (!answer || (Array.isArray(answer) && answer.length === 0)))}
              onClick={() => invoke(approveAction, { value: answer, answers: answerMap })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

type ChatTab = { id: string; label: string };
type ChatMessage = {
  id?: string | number;
  role?: "user" | "assistant" | "tool" | "reasoning";
  content: string;
  label?: string;
  detail?: string;
  duration?: string;
};

type ChatProps = {
  tabs?: ChatTab[];
  defaultTab?: string;
  messages?: ChatMessage[];
  placeholder?: string;
  sendAction?: ActionConfig;
  onTabChangeAction?: ActionConfig;
};

const Chat: React.FC<ChatProps> = ({
  tabs = [],
  defaultTab,
  messages = [],
  placeholder = "Write a message…",
  sendAction,
  onTabChangeAction
}) => {
  const invoke = useActionInvoker();
  const [activeTab, setActiveTab] = React.useState(defaultTab ?? tabs[0]?.id ?? "");
  return (
    <div className="wg-chat">
      {tabs.length > 0 ? (
        <div className="wg-chat-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              data-active={activeTab === tab.id || undefined}
              onClick={() => { setActiveTab(tab.id); invoke(onTabChangeAction, buildChangePayload("tab", tab.id)); }}
              key={tab.id}
            >{tab.label}</button>
          ))}
        </div>
      ) : null}
      <div className="wg-chat-messages">
        {messages.map((message, index) => {
          const role = message.role ?? "assistant";
          return (
            <div className="wg-chat-message" data-role={role} key={String(message.id ?? index)}>
              {role === "user" ? null : <span className="wg-chat-message-mark"><Icon name={role === "tool" ? "wrench" : "sparkle"} size="xs" color="currentColor" /></span>}
              <div>
                {message.label ? <small>{message.label}{message.detail ? ` · ${message.detail}` : ""}{message.duration ? ` · ${message.duration}` : ""}</small> : null}
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>
      <AgentInput placeholder={placeholder} submitAction={sendAction} rows={2} />
    </div>
  );
};

type PromptSource = {
  id: string;
  label: string;
  description?: string;
  icon?: WidgetIcon;
  connected?: boolean;
};

type PromptBarProps = AgentInputProps & {
  sources?: PromptSource[];
  selectedSources?: string[];
  variant?: "rounded" | "pill";
  sourceAction?: ActionConfig;
};

const PromptBar: React.FC<PromptBarProps> = ({
  sources = [],
  selectedSources = [],
  variant = "rounded",
  sourceAction,
  rows = 1,
  ...inputProps
}) => {
  const invoke = useActionInvoker();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="wg-prompt-bar" data-variant={variant}>
      {open && sources.length > 0 ? (
        <div className="wg-prompt-sources">
          {sources.map((source) => (
            <button type="button" onClick={() => invoke(sourceAction, buildChangePayload("source", source.id))} key={source.id}>
              <Icon name={source.icon ?? "database"} size="sm" color="tertiary" />
              <span><strong>{source.label}</strong>{source.description ? <small>{source.description}</small> : null}</span>
              {source.connected ? <em>Connected</em> : null}
            </button>
          ))}
        </div>
      ) : null}
      {selectedSources.length > 0 ? (
        <div className="wg-prompt-selected">{selectedSources.map((source) => <span key={source}>@{source}</span>)}</div>
      ) : null}
      <div className="wg-prompt-input-wrap">
        <button type="button" className="wg-prompt-source-trigger" onClick={() => setOpen((value) => !value)} aria-label="Choose sources">
          <Icon name="plus" size="sm" color="currentColor" />
        </button>
        <AgentInput {...inputProps} rows={rows} />
      </div>
    </div>
  );
};

type RecommendationOption = {
  label: string;
  description?: string;
  status?: string;
  action?: ActionConfig;
};

type RecommendationCardProps = {
  title: string;
  description?: string;
  confidence?: number;
  confidenceLabel?: string;
  alternatives?: RecommendationOption[];
  acceptLabel?: string;
  acceptAction?: ActionConfig;
  alternativesAction?: ActionConfig;
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  confidence = 0.85,
  confidenceLabel,
  alternatives = [],
  acceptLabel = "Accept",
  acceptAction,
  alternativesAction
}) => {
  const invoke = useActionInvoker();
  const normalized = confidence > 1 ? confidence / 100 : confidence;
  const label = confidenceLabel ?? (normalized >= 0.8 ? "High confidence" : normalized >= 0.55 ? "Medium confidence" : "Low confidence");
  return (
    <div className="wg-recommendation">
      <div className="wg-recommendation-copy"><strong>{title}</strong>{description ? <p>{description}</p> : null}</div>
      {alternatives.length > 0 ? (
        <div className="wg-recommendation-options">
          <small>Other options</small>
          {alternatives.map((option, index) => (
            <button type="button" disabled={!option.action} onClick={() => invoke(option.action, { option: option.label, index })} key={`${option.label}-${index}`}>
              <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
              {option.status ? <em>{option.status}</em> : null}
            </button>
          ))}
        </div>
      ) : null}
      <div className="wg-recommendation-footer">
        <span className="wg-confidence"><i><b style={{ width: `${Math.max(0, Math.min(normalized, 1)) * 100}%` }} /></i>{label}</span>
        <div>
          {alternativesAction ? <AgentButton label="Alternatives" onClick={() => invoke(alternativesAction)} /> : null}
          <AgentButton label={acceptLabel} primary disabled={!acceptAction} onClick={() => invoke(acceptAction)} />
        </div>
      </div>
    </div>
  );
};

export {
  AgentInput,
  ApprovalCard,
  Chat,
  CodeBlock,
  FileDiff,
  ImageGeneration,
  InlineCitations,
  LoadingState,
  Orb,
  Orbs,
  PromptBar,
  PromptInput,
  RecommendationCard,
  StreamingText,
  TaskList,
  TaskRows,
  TextResponse,
  Thinking,
  ThinkingReasoning,
  ThinkingState,
  ToolChips
};

export type {
  AgentInputProps,
  AgentAttachment,
  AgentCommand,
  AgentModel,
  AgentSkill,
  AgentStatus,
  AgentTask,
  ApprovalCardProps,
  ApprovalOption,
  ApprovalQuestion,
  ChatMessage,
  ChatProps,
  ChatTab,
  CitationSource,
  CodeBlockProps,
  DiffLine,
  FileDiffProps,
  ImageGenerationProps,
  InlineCitationsProps,
  LoadingStateProps,
  OrbProps,
  OrbVariant,
  PromptBarProps,
  PromptSource,
  ReasoningStep,
  RecommendationCardProps,
  RecommendationOption,
  StreamingAction,
  StreamingTextProps,
  TaskListProps,
  TaskRowsProps,
  TextResponseProps,
  ThinkingReasoningProps,
  ThinkingStateProps,
  ToolChip,
  ToolChipsProps
};
