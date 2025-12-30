import React from "react";

import { useWidgetTheme } from "../context";
import type {
  Alignment,
  BlockProps,
  Border,
  Borders,
  Justification,
  Padding,
  ThemeColor
} from "../types";
import {
  applyBorder,
  applyMargin,
  applyPadding,
  resolveColor,
  resolveGap,
  resolveRadius,
  sizeToCss,
  spaceToCss
} from "../style";

type BoxProps = BlockProps & {
  children?: React.ReactNode;
  direction?: "row" | "col";
  align?: Alignment;
  justify?: Justification;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  flex?: number | string;
  gap?: number | string;
  padding?: number | string | Padding;
  border?: number | Border | Borders;
  background?: string | ThemeColor;
};

function buildBlockStyles(props: BoxProps, theme: "light" | "dark") {
  const style: React.CSSProperties = {};

  if (props.size !== undefined) {
    const size = sizeToCss(props.size);
    style.width = size;
    style.height = size;
  }
  if (props.width !== undefined) style.width = sizeToCss(props.width);
  if (props.height !== undefined) style.height = sizeToCss(props.height);
  if (props.minSize !== undefined) {
    const value = sizeToCss(props.minSize);
    style.minWidth = value;
    style.minHeight = value;
  }
  if (props.maxSize !== undefined) {
    const value = sizeToCss(props.maxSize);
    style.maxWidth = value;
    style.maxHeight = value;
  }
  if (props.minWidth !== undefined) style.minWidth = sizeToCss(props.minWidth);
  if (props.minHeight !== undefined) style.minHeight = sizeToCss(props.minHeight);
  if (props.maxWidth !== undefined) style.maxWidth = sizeToCss(props.maxWidth);
  if (props.maxHeight !== undefined) style.maxHeight = sizeToCss(props.maxHeight);
  if (props.aspectRatio !== undefined) style.aspectRatio = props.aspectRatio;
  if (props.radius) style.borderRadius = resolveRadius(props.radius);

  applyPadding(style, props.padding);
  applyMargin(style, props.margin);
  applyBorder(style, props.border, theme);

  if (props.background) {
    style.background = resolveColor(props.background, theme);
  }

  return style;
}

function resolveAlign(align?: Alignment) {
  if (!align) return undefined;
  const map: Record<Alignment, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    baseline: "baseline",
    stretch: "stretch"
  };
  return map[align];
}

function resolveJustify(justify?: Justification) {
  if (!justify) return undefined;
  const map: Record<Justification, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
    stretch: "stretch"
  };
  return map[justify];
}

const Box: React.FC<BoxProps> = ({
  children,
  direction = "col",
  align,
  justify,
  wrap = "nowrap",
  flex,
  gap,
  ...props
}) => {
  const theme = useWidgetTheme();
  const style = buildBlockStyles(
    { direction, align, justify, wrap, flex, gap, ...props },
    theme
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "row" ? "row" : "column",
        alignItems: resolveAlign(align),
        justifyContent: resolveJustify(justify),
        flexWrap: wrap,
        flex,
        gap: resolveGap(gap),
        ...style
      }}
    >
      {children}
    </div>
  );
};

const Row: React.FC<BoxProps> = ({ align = "center", ...props }) => (
  <Box {...props} direction="row" align={align} />
);

const Col: React.FC<BoxProps> = ({ align, ...props }) => (
  <Box {...props} direction="col" align={align} />
);

const Spacer: React.FC<{ minSize?: number | string }> = ({ minSize }) => (
  <div style={{ flex: 1, minWidth: spaceToCss(minSize), minHeight: spaceToCss(minSize) }} />
);

const Divider: React.FC<{
  color?: string | ThemeColor;
  size?: number | string;
  spacing?: number | string;
  flush?: boolean;
}> = ({ color, size = 1, spacing, flush = false }) => {
  const theme = useWidgetTheme();
  const resolvedColor = resolveColor(color ?? "default", theme);
  const marginValue = spacing !== undefined ? spaceToCss(spacing) : spaceToCss(3);
  const style: React.CSSProperties = {
    height: sizeToCss(size),
    width: "100%",
    background: resolvedColor,
    marginTop: marginValue,
    marginBottom: marginValue
  };

  if (flush) {
    style.marginLeft = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.marginRight = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.width = "calc(100% + var(--widget-card-padding, 1rem) * 2)";
  }

  return <div style={style} />;
};

export { Box, Row, Col, Spacer, Divider, buildBlockStyles, resolveAlign, resolveJustify };
export type { BoxProps };
