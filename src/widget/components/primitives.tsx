import React from "react";
import { Star } from "lucide-react";

import { buildChangePayload, getFormValue, useWidgetAction, useWidgetForm, useWidgetTheme } from "../context";
import type { ActionConfig, TextAlign, ThemeColor, WidgetIcon } from "../types";
import { resolveColor, resolveGap, sizeToCss, spaceToCss } from "../style";
import { Icon, PlainButton } from "./content";

type Tone = "neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery";

const toneSoftBg: Record<Tone, string> = {
  neutral: "var(--widget-surface-tertiary)",
  accent: "var(--widget-accent-soft)",
  info: "var(--widget-info-soft-bg)",
  success: "var(--widget-success-soft-bg)",
  warning: "var(--widget-warning-soft-bg)",
  danger: "var(--widget-danger-soft-bg)",
  discovery: "var(--widget-discovery-soft-bg)"
};

const toneSoftFg: Record<Tone, string> = {
  neutral: "var(--widget-text-secondary)",
  accent: "var(--widget-accent)",
  info: "var(--widget-info-soft-fg)",
  success: "var(--widget-success-soft-fg)",
  warning: "var(--widget-warning-soft-fg)",
  danger: "var(--widget-danger-soft-fg)",
  discovery: "var(--widget-discovery-soft-fg)"
};

const toneSolid: Record<Tone, string> = {
  neutral: "var(--widget-text-tertiary)",
  accent: "var(--widget-accent)",
  info: "var(--widget-info)",
  success: "var(--widget-success)",
  warning: "var(--widget-warning)",
  danger: "var(--widget-danger)",
  discovery: "var(--widget-discovery)"
};

const toneSoftBorder: Record<Tone, string> = {
  neutral: "var(--widget-border-subtle)",
  accent: "var(--widget-accent-border)",
  info: "var(--widget-info-soft-border)",
  success: "var(--widget-success-soft-border)",
  warning: "var(--widget-warning-soft-border)",
  danger: "var(--widget-danger-soft-border)",
  discovery: "var(--widget-discovery-soft-border)"
};

/* ------------------------------------------------------------------
   Stat — a single metric with optional trend delta and helper text.
   ------------------------------------------------------------------ */

type StatProps = {
  label: string;
  value: string | number;
  delta?: string | number;
  deltaLabel?: string;
  /** Force the delta tone; inferred from the sign by default. */
  trend?: "up" | "down" | "flat";
  /** Semantic direction: is "up" good (default) or bad (e.g. costs)? */
  upIsPositive?: boolean;
  icon?: WidgetIcon;
  helpText?: string;
  align?: TextAlign;
  size?: "sm" | "md" | "lg";
};

const statValueSizes = { sm: "1.25rem", md: "1.6rem", lg: "2rem" };

function inferTrend(delta: string | number | undefined): "up" | "down" | "flat" {
  if (delta === undefined) return "flat";
  const numeric =
    typeof delta === "number"
      ? delta
      : Number(
          String(delta)
            // Normalize typographic minus signs (U+2212, en/em dash) — common in
            // formatted/LLM output — before stripping non-numerics.
            .replace(/[−–—]/g, "-")
            .replace(/[^\d.-]/g, "")
        );
  if (Number.isNaN(numeric) || numeric === 0) return "flat";
  return numeric > 0 ? "up" : "down";
}

const Stat: React.FC<StatProps> = ({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  upIsPositive = true,
  icon,
  helpText,
  align = "start",
  size = "md"
}) => {
  const resolvedTrend = trend ?? inferTrend(delta);
  const deltaTone: Tone =
    resolvedTrend === "flat"
      ? "neutral"
      : (resolvedTrend === "up") === upIsPositive
      ? "success"
      : "danger";
  const alignItems = align === "center" ? "center" : align === "end" ? "flex-end" : "flex-start";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
          color: "var(--widget-text-secondary)"
        }}
      >
        {icon ? <Icon name={icon} size="xs" color="tertiary" /> : null}
        <span>{label}</span>
      </div>
      <div
        className="wg-tabular"
        style={{
          fontSize: statValueSizes[size],
          fontWeight: 650,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "var(--widget-text-emphasis)"
        }}
      >
        {value}
      </div>
      {delta !== undefined || helpText ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.75rem",
            marginTop: "0.1rem"
          }}
        >
          {delta !== undefined ? (
            <span
              className="wg-tabular"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.15rem",
                fontWeight: 600,
                color: toneSoftFg[deltaTone]
              }}
            >
              {resolvedTrend !== "flat" ? (
                <Icon
                  name={resolvedTrend === "up" ? "trending-up" : "trending-down"}
                  size="xs"
                  color="currentColor"
                />
              ) : null}
              {delta}
            </span>
          ) : null}
          {deltaLabel || helpText ? (
            <span style={{ color: "var(--widget-text-tertiary)" }}>{deltaLabel ?? helpText}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------
   Sparkline — dependency-free inline trend line with gradient fill.
   ------------------------------------------------------------------ */

type SparklineProps = {
  data: number[];
  color?: string | ThemeColor;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  strokeWidth?: number;
};

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = "100%",
  height = 36,
  fill = true,
  strokeWidth = 2
}) => {
  const theme = useWidgetTheme();
  const gradientId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const resolved = (color ? resolveColor(color, theme) : undefined) ?? "var(--widget-accent)";

  if (!Array.isArray(data) || data.length < 2) return null;

  const w = 100;
  const h = 32;
  const pad = strokeWidth + 1;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1e-9);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((value - min) / range) * (h - pad * 2);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: sizeToCss(width), height: sizeToCss(height), display: "block" }}
      aria-hidden
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={`wgSpark${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolved} stopOpacity={0.25} />
              <stop offset="100%" stopColor={resolved} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#wgSpark${gradientId})`} />
        </>
      ) : null}
      <path
        d={line}
        fill="none"
        stroke={resolved}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

/* ------------------------------------------------------------------
   Callout — inline banner for info / success / warning / danger.
   ------------------------------------------------------------------ */

type CalloutProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  color?: Tone;
  icon?: WidgetIcon | "none";
  action?: { label: string; action: ActionConfig };
};

const calloutDefaultIcons: Record<Tone, WidgetIcon> = {
  neutral: "info",
  accent: "sparkle",
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  danger: "alert-circle",
  discovery: "sparkle"
};

const Callout: React.FC<CalloutProps> = ({
  title,
  description,
  children,
  color = "info",
  icon,
  action: actionProp
}) => {
  const dispatch = useWidgetAction();
  const resolvedIcon = icon === "none" ? null : icon ?? calloutDefaultIcons[color];

  return (
    <div
      role={color === "danger" || color === "warning" ? "alert" : "note"}
      style={{
        display: "flex",
        gap: "0.6rem",
        alignItems: "flex-start",
        padding: "0.75rem 0.9rem",
        borderRadius: "12px",
        background: toneSoftBg[color],
        border: `1px solid ${toneSoftBorder[color]}`
      }}
    >
      {resolvedIcon ? (
        <span style={{ display: "flex", marginTop: "0.1rem", color: toneSoftFg[color] }}>
          <Icon name={resolvedIcon} size="md" color="currentColor" />
        </span>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", flex: 1, minWidth: 0 }}>
        {title ? (
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: toneSoftFg[color] }}>
            {title}
          </span>
        ) : null}
        {description ? (
          <span style={{ fontSize: "0.8rem", lineHeight: 1.45, color: "var(--widget-text-secondary)" }}>
            {description}
          </span>
        ) : null}
        {children}
      </div>
      {actionProp ? (
        <PlainButton
          variant="soft"
          color={color === "neutral" ? "secondary" : color}
          size="xs"
          style={{ flexShrink: 0 }}
          onClick={() => dispatch?.(actionProp.action)}
        >
          {actionProp.label}
        </PlainButton>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------
   Timeline — vertical sequence of events with a connector rail.
   ------------------------------------------------------------------ */

type TimelineItemData = {
  title: string;
  description?: string;
  time?: string;
  icon?: WidgetIcon;
  color?: Tone;
  state?: "done" | "active" | "upcoming";
};

type TimelineProps = {
  items: TimelineItemData[];
  gap?: number | string;
};

const Timeline: React.FC<TimelineProps> = ({ items, gap = 0 }) => {
  if (!Array.isArray(items)) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: resolveGap(gap) }}>
      {items.map((item, index) => {
        const state = item.state ?? "done";
        const tone: Tone = item.color ?? (state === "active" ? "accent" : "neutral");
        const dotColor =
          state === "upcoming"
            ? "var(--widget-border-strong)"
            : toneSolid[tone];
        const isLast = index === items.length - 1;
        return (
          <div key={index} style={{ display: "flex", gap: "0.75rem", minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "18px",
                flexShrink: 0
              }}
            >
              <span
                style={{
                  width: item.icon ? "18px" : "9px",
                  height: item.icon ? "18px" : "9px",
                  marginTop: item.icon ? "0.05rem" : "0.32rem",
                  borderRadius: "999px",
                  background: item.icon ? toneSoftBg[tone] : dotColor,
                  color: toneSoftFg[tone],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    state === "active" && !item.icon
                      ? `0 0 0 3px ${toneSoftBg[tone]}`
                      : undefined,
                  flexShrink: 0
                }}
              >
                {item.icon ? <Icon name={item.icon} size="xs" color="currentColor" /> : null}
              </span>
              {!isLast ? (
                <span
                  style={{
                    width: "2px",
                    flex: 1,
                    minHeight: "12px",
                    marginTop: "0.2rem",
                    marginBottom: "0.2rem",
                    borderRadius: "2px",
                    background:
                      state === "upcoming" || items[index + 1]?.state === "upcoming"
                        ? "var(--widget-border-subtle)"
                        : "var(--widget-border-default)"
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
                paddingBottom: isLast ? 0 : "0.9rem",
                minWidth: 0,
                flex: 1,
                opacity: state === "upcoming" ? 0.65 : 1
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "0.75rem"
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--widget-text-primary)"
                  }}
                >
                  {item.title}
                </span>
                {item.time ? (
                  <span
                    className="wg-tabular"
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--widget-text-tertiary)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {item.time}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <span
                  style={{
                    fontSize: "0.78rem",
                    lineHeight: 1.45,
                    color: "var(--widget-text-secondary)"
                  }}
                >
                  {item.description}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
   Rating — star rating with fractional fill.
   ------------------------------------------------------------------ */

type RatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: string | ThemeColor;
  showValue?: boolean;
  count?: number | string;
};

const ratingSizes = { sm: 12, md: 15, lg: 18 };

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = "md",
  color,
  showValue = false,
  count
}) => {
  const theme = useWidgetTheme();
  const starSize = ratingSizes[size];
  const resolved = (color ? resolveColor(color, theme) : undefined) ?? "#f59e0b";
  const clamped = Math.max(0, Math.min(value, max));

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span
        style={{ display: "inline-flex", gap: "1px", position: "relative" }}
        role="img"
        aria-label={`${clamped} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, index) => {
          const fillRatio = Math.max(0, Math.min(clamped - index, 1));
          // Two layers of the same lucide Star (matching the icon set): a muted
          // base, and a width-clipped filled copy for fractional values.
          return (
            <span key={index} style={{ position: "relative", width: starSize, height: starSize }}>
              <Star
                size={starSize}
                fill="currentColor"
                strokeWidth={0}
                style={{ position: "absolute", inset: 0, color: "var(--widget-border-strong)" }}
                aria-hidden
              />
              {fillRatio > 0 ? (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    width: `${fillRatio * 100}%`
                  }}
                >
                  <Star
                    size={starSize}
                    fill="currentColor"
                    strokeWidth={0}
                    style={{ color: resolved, display: "block" }}
                    aria-hidden
                  />
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span
          className="wg-tabular"
          style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--widget-text-primary)" }}
        >
          {clamped.toFixed(1)}
        </span>
      ) : null}
      {count !== undefined ? (
        <span style={{ fontSize: "0.75rem", color: "var(--widget-text-tertiary)" }}>({count})</span>
      ) : null}
    </span>
  );
};

/* ------------------------------------------------------------------
   ChipGroup — wrapping set of selectable chips (single or multiple).
   ------------------------------------------------------------------ */

type ChipOption = { label: string; value: string; icon?: WidgetIcon; disabled?: boolean };

type ChipGroupProps = {
  name?: string;
  options: ChipOption[];
  type?: "single" | "multiple";
  defaultValue?: string;
  defaultValues?: string[];
  onChangeAction?: ActionConfig;
  size?: "sm" | "md";
  disabled?: boolean;
};

const ChipGroup: React.FC<ChipGroupProps> = ({
  name,
  options,
  type = "single",
  defaultValue,
  defaultValues,
  onChangeAction,
  size = "md",
  disabled
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [local, setLocal] = React.useState<string[]>(
    type === "multiple" ? defaultValues ?? [] : defaultValue ? [defaultValue] : []
  );
  const formValue = name && form ? getFormValue(form.values, name) : undefined;

  // Seed defaults into the enclosing form (mirrors useFieldValue in forms.tsx)
  // so an untouched ChipGroup still contributes to the submit payload. The
  // default is read through a ref: template evaluation produces a fresh array
  // identity every render, which as an effect dep would re-run this each time.
  const defaultPayloadRef = React.useRef(type === "multiple" ? defaultValues : defaultValue);
  defaultPayloadRef.current = type === "multiple" ? defaultValues : defaultValue;
  React.useEffect(() => {
    const defaultPayload = defaultPayloadRef.current;
    if (!name || !form || defaultPayload === undefined) return;
    if (getFormValue(form.values, name) === undefined) {
      form.setValue(name, defaultPayload);
    }
  }, [name, form, type]);
  const selected: string[] = Array.isArray(formValue)
    ? (formValue as string[])
    : typeof formValue === "string" && formValue
    ? [formValue]
    : local;

  const toggle = (value: string) => {
    let next: string[];
    if (type === "multiple") {
      next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
    } else {
      next = selected.includes(value) ? [] : [value];
    }
    setLocal(next);
    const payloadValue = type === "multiple" ? next : next[0] ?? "";
    if (name && form) form.setValue(name, payloadValue);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, payloadValue));
    }
  };

  const chipHeight = size === "sm" ? "26px" : "30px";
  const chipFont = size === "sm" ? "0.72rem" : "0.8rem";

  if (!Array.isArray(options)) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }} role="group">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className="wg-interactive"
            aria-pressed={active}
            disabled={disabled || option.disabled}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              height: chipHeight,
              padding: "0 0.7rem",
              borderRadius: "999px",
              fontSize: chipFont,
              fontWeight: 550,
              cursor: disabled || option.disabled ? "not-allowed" : "pointer",
              opacity: disabled || option.disabled ? 0.5 : 1,
              border: `1px solid ${active ? "var(--widget-accent-border)" : "var(--widget-border-default)"}`,
              background: active ? "var(--widget-accent-soft)" : "var(--widget-surface)",
              color: active ? "var(--widget-accent)" : "var(--widget-text-secondary)"
            }}
            onClick={() => toggle(option.value)}
          >
            {option.icon ? <Icon name={option.icon} size="xs" color="currentColor" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
   KeyValue — aligned label/value pairs for detail views.
   ------------------------------------------------------------------ */

type KeyValueRow = {
  label: string;
  value: string | number;
  icon?: WidgetIcon;
  emphasis?: boolean;
  color?: string | ThemeColor;
};

type KeyValueProps = {
  rows: KeyValueRow[];
  gap?: number | string;
  divider?: boolean;
  labelWidth?: number | string;
};

const KeyValue: React.FC<KeyValueProps> = ({ rows, gap = 2, divider = false, labelWidth }) => {
  const theme = useWidgetTheme();
  if (!Array.isArray(rows)) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: divider ? 0 : resolveGap(gap) }}>
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
            padding: divider ? "0.5rem 0" : undefined,
            borderBottom:
              divider && index < rows.length - 1
                ? "1px solid var(--widget-border-subtle)"
                : undefined
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.8rem",
              color: "var(--widget-text-secondary)",
              width: labelWidth ? sizeToCss(labelWidth) : undefined,
              flexShrink: 0
            }}
          >
            {row.icon ? <Icon name={row.icon} size="xs" color="tertiary" /> : null}
            {row.label}
          </span>
          <span
            className="wg-tabular"
            style={{
              fontSize: "0.85rem",
              fontWeight: row.emphasis ? 650 : 500,
              color: row.color
                ? resolveColor(row.color, theme)
                : row.emphasis
                ? "var(--widget-text-emphasis)"
                : "var(--widget-text-primary)",
              textAlign: "end",
              minWidth: 0,
              overflowWrap: "anywhere"
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------
   Steps — horizontal progress indicator for multi-step flows.
   ------------------------------------------------------------------ */

type StepItem = { label: string; description?: string };

type StepsProps = {
  items: StepItem[];
  current?: number;
  color?: Tone;
};

const Steps: React.FC<StepsProps> = ({ items, current = 0, color = "accent" }) => {
  if (!Array.isArray(items)) return null;
  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {items.map((item, index) => {
        const state = index < current ? "done" : index === current ? "active" : "upcoming";
        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              minWidth: 0
            }}
          >
            <span
              style={{
                height: "4px",
                borderRadius: "999px",
                background:
                  state === "upcoming" ? "var(--widget-surface-tertiary)" : toneSolid[color],
                opacity: state === "active" ? 0.9 : 1,
                transition: "background-color 200ms var(--widget-ease)"
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: state === "active" ? 600 : 500,
                color:
                  state === "active"
                    ? "var(--widget-text-primary)"
                    : state === "done"
                    ? "var(--widget-text-secondary)"
                    : "var(--widget-text-tertiary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
   EmptyState — friendly placeholder for empty lists / no results.
   ------------------------------------------------------------------ */

type EmptyStateProps = {
  icon?: WidgetIcon;
  title: string;
  description?: string;
  action?: { label: string; action: ActionConfig };
  padding?: number | string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  action: actionProp,
  padding = 6
}) => {
  const dispatch = useWidgetAction();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        padding: spaceToCss(padding),
        textAlign: "center"
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "var(--widget-surface-tertiary)",
          color: "var(--widget-text-tertiary)",
          marginBottom: "0.35rem"
        }}
      >
        <Icon name={icon} size="lg" color="currentColor" />
      </span>
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--widget-text-primary)" }}>
        {title}
      </span>
      {description ? (
        <span
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.45,
            color: "var(--widget-text-secondary)",
            maxWidth: "260px"
          }}
        >
          {description}
        </span>
      ) : null}
      {actionProp ? (
        <PlainButton
          variant="soft"
          size="sm"
          style={{ marginTop: "0.4rem" }}
          onClick={() => dispatch?.(actionProp.action)}
        >
          {actionProp.label}
        </PlainButton>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------
   Tabs — lightweight in-widget tab switcher. Panels register by id.
   ------------------------------------------------------------------ */

type TabsContextValue = { active: string };
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

type TabsProps = {
  tabs: { id: string; label: string; icon?: WidgetIcon }[];
  defaultTab?: string;
  name?: string;
  onChangeAction?: ActionConfig;
  children?: React.ReactNode;
};

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, name, onChangeAction, children }) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [active, setActive] = React.useState(defaultTab ?? tabs?.[0]?.id ?? "");

  if (!Array.isArray(tabs) || tabs.length === 0) return null;

  // Reconcile against the current tabs: a mismatched defaultTab (case typo in a
  // model-authored template) or a state-driven tabs change would otherwise
  // leave `active` pointing at a nonexistent id and every panel blank.
  const activeTab = tabs.some((tab) => tab.id === active) ? active : tabs[0]?.id ?? "";

  const select = (id: string) => {
    setActive(id);
    if (name && form) form.setValue(name, id);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, id, { tab: id }));
    }
  };

  return (
    <TabsContext.Provider value={{ active: activeTab }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: "1rem",
            borderBottom: "1px solid var(--widget-border-subtle)"
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className="wg-interactive"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.1rem 0.55rem",
                  marginBottom: "-1px",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--widget-text-emphasis)" : "var(--widget-text-secondary)",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? "var(--widget-accent)" : "transparent"}`,
                  cursor: "pointer"
                }}
                onClick={() => select(tab.id)}
              >
                {tab.icon ? <Icon name={tab.icon} size="sm" color="currentColor" /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabPanel: React.FC<{ id: string; children?: React.ReactNode }> = ({ id, children }) => {
  const context = React.useContext(TabsContext);
  if (!context || context.active !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

export {
  Callout,
  ChipGroup,
  EmptyState,
  KeyValue,
  Rating,
  Sparkline,
  Stat,
  Steps,
  TabPanel,
  Tabs,
  Timeline
};
export type {
  CalloutProps,
  ChipGroupProps,
  EmptyStateProps,
  KeyValueProps,
  RatingProps,
  SparklineProps,
  StatProps,
  StepsProps,
  TabsProps,
  TimelineProps
};
