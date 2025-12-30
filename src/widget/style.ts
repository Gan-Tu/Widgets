import type { CSSProperties } from "react";
import type {
  Border,
  Borders,
  Margin,
  Padding,
  RadiusValue,
  ThemeColor,
  ThemeMode
} from "./types";

const textColorTokens: Record<string, string> = {
  prose: "var(--widget-text-prose)",
  primary: "var(--widget-text-primary)",
  emphasis: "var(--widget-text-emphasis)",
  secondary: "var(--widget-text-secondary)",
  tertiary: "var(--widget-text-tertiary)",
  success: "var(--widget-text-success)",
  warning: "var(--widget-text-warning)",
  danger: "var(--widget-text-danger)"
};

const surfaceTokens: Record<string, string> = {
  surface: "var(--widget-surface)",
  "surface-secondary": "var(--widget-surface-secondary)",
  "surface-tertiary": "var(--widget-surface-tertiary)",
  "surface-elevated": "var(--widget-surface-elevated)",
  "surface-elevated-secondary": "var(--widget-surface-elevated-secondary)"
};

const borderTokens: Record<string, string> = {
  default: "var(--widget-border-default)",
  subtle: "var(--widget-border-subtle)",
  strong: "var(--widget-border-strong)"
};

const radiusMap: Record<RadiusValue, string> = {
  "2xs": "4px",
  xs: "6px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "28px",
  "4xl": "32px",
  full: "999px",
  "100%": "100%",
  none: "0px"
};

const primitiveColorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  yellow: "#facc15",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#64748b",
  white: "#ffffff",
  black: "#0f172a",
  "green-400": "#4ade80",
  "blue-100": "#dbeafe",
  "red-100": "#fee2e2",
  "blue-900": "#1e3a8a",
  "gray-500": "#64748b"
};

export function spaceToCss(value?: number | string) {
  if (value === undefined) return undefined;
  if (typeof value === "number") {
    return `${value * 0.25}rem`;
  }
  return value;
}

export function sizeToCss(value?: number | string) {
  if (value === undefined) return undefined;
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}

export function resolveThemeColor(
  color: string | ThemeColor,
  theme: ThemeMode
) {
  if (typeof color === "string") return color;
  return theme === "dark" ? color.dark : color.light;
}

export function resolveColor(
  color: string | ThemeColor | undefined,
  theme: ThemeMode
) {
  if (!color) return undefined;
  const raw = resolveThemeColor(color, theme);

  if (raw in textColorTokens) return textColorTokens[raw];
  if (raw in surfaceTokens) return surfaceTokens[raw];
  if (raw in borderTokens) return borderTokens[raw];

  if (raw === "alpha-70") return "var(--widget-alpha-70)";
  if (raw === "alpha-10") return "var(--widget-alpha-10)";

  if (raw in primitiveColorMap) return primitiveColorMap[raw];

  return raw;
}

export function resolveRadius(value?: RadiusValue) {
  if (!value) return undefined;
  return radiusMap[value] ?? value;
}

export function applyPadding(style: CSSProperties, padding?: number | string | Padding) {
  if (padding === undefined) return;
  if (typeof padding === "number" || typeof padding === "string") {
    style.padding = spaceToCss(padding);
    return;
  }
  if (padding.x !== undefined) {
    style.paddingLeft = spaceToCss(padding.x);
    style.paddingRight = spaceToCss(padding.x);
  }
  if (padding.y !== undefined) {
    style.paddingTop = spaceToCss(padding.y);
    style.paddingBottom = spaceToCss(padding.y);
  }
  if (padding.top !== undefined) style.paddingTop = spaceToCss(padding.top);
  if (padding.right !== undefined) style.paddingRight = spaceToCss(padding.right);
  if (padding.bottom !== undefined) style.paddingBottom = spaceToCss(padding.bottom);
  if (padding.left !== undefined) style.paddingLeft = spaceToCss(padding.left);
}

export function applyMargin(style: CSSProperties, margin?: number | string | Margin) {
  if (margin === undefined) return;
  if (typeof margin === "number" || typeof margin === "string") {
    style.margin = spaceToCss(margin);
    return;
  }
  if (margin.x !== undefined) {
    style.marginLeft = spaceToCss(margin.x);
    style.marginRight = spaceToCss(margin.x);
  }
  if (margin.y !== undefined) {
    style.marginTop = spaceToCss(margin.y);
    style.marginBottom = spaceToCss(margin.y);
  }
  if (margin.top !== undefined) style.marginTop = spaceToCss(margin.top);
  if (margin.right !== undefined) style.marginRight = spaceToCss(margin.right);
  if (margin.bottom !== undefined) style.marginBottom = spaceToCss(margin.bottom);
  if (margin.left !== undefined) style.marginLeft = spaceToCss(margin.left);
}

function borderToCss(border: Border | number | undefined, theme: ThemeMode) {
  if (border === undefined) return undefined;
  if (typeof border === "number") {
    return {
      width: `${border}px`,
      color: resolveColor("default", theme),
      style: "solid"
    };
  }
  return {
    width: `${border.size}px`,
    color: resolveColor(border.color ?? "default", theme),
    style: border.style ?? "solid"
  };
}

export function applyBorder(
  style: CSSProperties,
  border?: number | Border | Borders,
  theme: ThemeMode = "light"
) {
  if (border === undefined) return;
  if (typeof border === "number" || "size" in (border as Border)) {
    const resolved = borderToCss(border as Border | number, theme);
    if (!resolved) return;
    style.borderWidth = resolved.width;
    style.borderStyle = resolved.style;
    style.borderColor = resolved.color;
    return;
  }

  const sides = border as Borders;
  const applySide = (side: keyof Borders, cssPrefix: string) => {
    const value = sides[side];
    if (value === undefined) return;
    const resolved = borderToCss(value as Border | number, theme);
    if (!resolved) return;
    (style as Record<string, string>)[`${cssPrefix}Width`] = resolved.width;
    (style as Record<string, string>)[`${cssPrefix}Style`] = resolved.style;
    (style as Record<string, string>)[`${cssPrefix}Color`] =
      resolved.color ?? "transparent";
  };

  if (sides.x !== undefined) {
    applySide("x", "borderLeft");
    applySide("x", "borderRight");
  }
  if (sides.y !== undefined) {
    applySide("y", "borderTop");
    applySide("y", "borderBottom");
  }
  applySide("top", "borderTop");
  applySide("right", "borderRight");
  applySide("bottom", "borderBottom");
  applySide("left", "borderLeft");
}

export function resolveGap(gap?: number | string) {
  return gap === undefined ? "var(--widget-gap)" : spaceToCss(gap);
}

export const controlHeights: Record<string, string> = {
  "3xs": "22px",
  "2xs": "24px",
  xs: "26px",
  sm: "28px",
  md: "32px",
  lg: "36px",
  xl: "40px",
  "2xl": "44px",
  "3xl": "48px"
};

export const controlGutters: Record<string, string> = {
  "2xs": "6px",
  xs: "8px",
  sm: "10px",
  md: "12px",
  lg: "14px",
  xl: "16px"
};
