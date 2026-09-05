import React from "react";
import { Star } from "lucide-react";

import { buildChangePayload, getFormValue, useWidgetAction, useWidgetForm, useWidgetTheme } from "../context";
import type { ActionConfig, ThemeColor, Tone, WidgetIcon } from "../types";
import { resolveColor, resolveGap, sizeToCss, spaceToCss } from "../style";
import { Icon, PlainButton } from "./content";
import { toneSoftBg, toneSoftFg, toneSolid } from "./tones";
import { Stat, Sparkline, type StatProps, type SparklineProps } from "./metrics";
import { Tabs, TabPanel, type TabsProps } from "./tabs";

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
        borderRadius: "var(--widget-radius-control)",
        background: toneSoftBg[color]
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
                    width: "1px",
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
                paddingBottom: isLast ? 0 : "1.15rem",
                minWidth: 0,
                flex: 1,
                opacity: 1
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
                    fontWeight: state === "active" ? 500 : 400,
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
  React.useLayoutEffect(() => {
    defaultPayloadRef.current = type === "multiple" ? defaultValues : defaultValue;
  }, [type, defaultValues, defaultValue]);
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

  const chipHeight = size === "sm" ? "30px" : "36px";
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
            className="wg-interactive wg-choice"
            aria-pressed={active}
            disabled={disabled || option.disabled}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              height: chipHeight,
              padding: size === "sm" ? "0 0.45rem" : "0 0.7rem",
              borderRadius: "7px",
              fontSize: chipFont,
              fontWeight: 550,
              cursor: disabled || option.disabled ? "not-allowed" : "pointer",
              opacity: disabled || option.disabled ? 0.5 : 1,
              border: `1px solid ${active ? "var(--widget-accent)" : "var(--widget-border-default)"}`,
              background: active ? "var(--widget-accent)" : "var(--widget-surface)",
              color: active ? "var(--widget-on-accent)" : "var(--widget-text-secondary)"
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
                height: "3px",
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
                fontWeight: state === "active" ? 500 : 400,
                color:
                  state === "active"
                    ? "var(--widget-text-primary)"
                    : state === "done"
                    ? "var(--widget-text-secondary)"
                    : "var(--widget-text-tertiary)",
                lineHeight: 1.4,
                overflowWrap: "anywhere"
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
