import React from "react";

import { useWidgetTheme } from "../context";
import type { RadiusValue, ThemeColor } from "../types";
import { resolveColor, resolveRadius, sizeToCss } from "../style";

type AvatarProps = {
  src?: string;
  name: string;
  size?: number | string;
  radius?: RadiusValue;
  status?: "online" | "offline" | "away";
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
  const statusColor =
    status === "online" ? "#22c55e" : status === "away" ? "#f59e0b" : "#94a3b8";

  return (
    <div style={{ position: "relative", width: dimension, height: dimension }}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: resolveRadius(radius)
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: resolveRadius(radius),
            background: "#e2e8f0",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.9rem"
          }}
        >
          {initials}
        </div>
      )}
      {status ? (
        <span
          style={{
            position: "absolute",
            right: "-2px",
            bottom: "-2px",
            width: "10px",
            height: "10px",
            background: statusColor,
            borderRadius: "999px",
            border: "2px solid white"
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
};

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  color = "#0f172a",
  size = "md"
}) => {
  const theme = useWidgetTheme();
  const clamped = Math.min(Math.max(value, 0), max);
  const percentage = (clamped / max) * 100;
  const height = size === "sm" ? 6 : size === "lg" ? 12 : 8;

  return (
    <div style={{ width: "100%" }}>
      {label ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.35rem",
            fontSize: "0.75rem",
            color: "var(--widget-text-secondary)"
          }}
        >
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      ) : null}
      <div
        style={{
          height,
          borderRadius: "999px",
          background: "var(--widget-surface-secondary)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: resolveColor(color, theme) ?? "#0f172a",
            borderRadius: "999px",
            transition: "width 0.2s ease"
          }}
        />
      </div>
    </div>
  );
};

export { Avatar, Progress };
export type { AvatarProps, ProgressProps };
