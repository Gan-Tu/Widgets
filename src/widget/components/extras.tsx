import React from "react";

import { useWidgetTheme } from "../context";
import type { RadiusValue, ThemeColor } from "../types";
import { resolveColor, resolveRadius, sizeToCss } from "../style";

type AvatarProps = {
  src?: string;
  name: string;
  size?: number | string;
  radius?: RadiusValue;
  status?: "online" | "offline" | "away" | "busy";
};

const avatarStatusColors: Record<string, string> = {
  online: "var(--widget-success)",
  away: "var(--widget-warning)",
  busy: "var(--widget-danger)",
  offline: "var(--widget-text-tertiary)"
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 40,
  radius = "full",
  status
}) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const dimension = sizeToCss(size);
  const numericSize = typeof size === "number" ? size : 40;
  const statusSize = Math.max(8, Math.round(numericSize * 0.28));

  return (
    <div style={{ position: "relative", width: dimension, height: dimension, flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: resolveRadius(radius),
            boxShadow: "inset 0 0 0 1px var(--widget-border-subtle)"
          }}
        />
      ) : (
        <div
          className="wg-avatar-fallback"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: resolveRadius(radius),
            fontSize: `${Math.max(10, Math.round(numericSize * 0.38))}px`,
            letterSpacing: "0.02em"
          }}
        >
          {initials}
        </div>
      )}
      {status ? (
        <span
          style={{
            position: "absolute",
            right: "-1px",
            bottom: "-1px",
            width: `${statusSize}px`,
            height: `${statusSize}px`,
            background: avatarStatusColors[status] ?? avatarStatusColors.offline,
            borderRadius: "999px",
            border: "2px solid var(--widget-surface-elevated)"
          }}
        />
      ) : null}
    </div>
  );
};

type ProgressProps = {
  value: number;
  max?: number;
  label?: string;
  color?: string | ThemeColor;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
};

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  color,
  size = "md",
  showValue = true
}) => {
  const theme = useWidgetTheme();
  const safeMax = typeof max === "number" && max > 0 ? max : 0;
  const clamped = Math.min(Math.max(value, 0), safeMax || 0);
  // Guard 0/0 ("0 of 0 items"): NaN% would render a full bar plus "NaN%" text.
  const percentage = safeMax > 0 ? (clamped / safeMax) * 100 : 0;
  const height = size === "sm" ? 5 : size === "lg" ? 10 : 7;

  return (
    <div style={{ width: "100%" }} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={max}>
      {label ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.35rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "var(--widget-text-secondary)"
          }}
        >
          <span>{label}</span>
          {showValue ? <span className="wg-tabular">{Math.round(percentage)}%</span> : null}
        </div>
      ) : null}
      <div className="wg-progress-track" style={{ height }}>
        <div
          className="wg-progress-fill"
          style={{
            width: `${percentage}%`,
            background: color ? resolveColor(color, theme) : undefined
          }}
        />
      </div>
    </div>
  );
};

export { Avatar, Progress };
export type { AvatarProps, ProgressProps };
