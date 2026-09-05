import React from "react";
import { useWidgetTheme } from "../context";
import type { TextAlign, ThemeColor, Tone, WidgetIcon } from "../types";
import { resolveColor, sizeToCss } from "../style";
import { Icon } from "./content";
import { toneSoftFg } from "./tones";

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

const statValueSizes = { sm: "1.3rem", md: "1.9rem", lg: "2.75rem" };

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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems, minWidth: 0 }}>
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
          fontWeight: 550,
          letterSpacing: "-0.045em",
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
                fontWeight: 500,
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
  const resolved = (color ? resolveColor(color, theme) : undefined) ?? "var(--widget-chart-5)";

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
              <stop offset="0%" stopColor={resolved} stopOpacity={0.10} />
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

export { Stat, Sparkline };
export type { StatProps, SparklineProps };
