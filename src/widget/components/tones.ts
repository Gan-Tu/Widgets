import type { Tone } from "../types";

export const toneSoftBg: Record<Tone, string> = {
  neutral: "var(--widget-surface-tertiary)",
  accent: "var(--widget-accent-soft)",
  info: "var(--widget-info-soft-bg)",
  success: "var(--widget-success-soft-bg)",
  warning: "var(--widget-warning-soft-bg)",
  danger: "var(--widget-danger-soft-bg)",
  discovery: "var(--widget-discovery-soft-bg)"
};

export const toneSoftFg: Record<Tone, string> = {
  neutral: "var(--widget-text-secondary)",
  accent: "var(--widget-accent)",
  info: "var(--widget-info-soft-fg)",
  success: "var(--widget-success-soft-fg)",
  warning: "var(--widget-warning-soft-fg)",
  danger: "var(--widget-danger-soft-fg)",
  discovery: "var(--widget-discovery-soft-fg)"
};

export const toneSolid: Record<Tone, string> = {
  neutral: "var(--widget-text-tertiary)",
  accent: "var(--widget-accent)",
  info: "var(--widget-info)",
  success: "var(--widget-success)",
  warning: "var(--widget-warning)",
  danger: "var(--widget-danger)",
  discovery: "var(--widget-discovery)"
};
