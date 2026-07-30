import React from "react";

import { normalizeCssSize } from "../style";
import type { ThemeColor } from "../types";

/**
 * Chart components lazy-load the recharts implementation so widgets without
 * charts never download it (~270KB). While loading, a skeleton with the
 * chart's final dimensions renders to avoid layout shift.
 */

type XAxisConfig = {
  dataKey: string;
  hide?: boolean;
  labels?: Record<string | number, string>;
};

type CurveType =
  | "basis"
  | "basisClosed"
  | "basisOpen"
  | "bumpX"
  | "bumpY"
  | "bump"
  | "linear"
  | "linearClosed"
  | "natural"
  | "monotoneX"
  | "monotoneY"
  | "monotone"
  | "step"
  | "stepBefore"
  | "stepAfter";

type ChartFrameProps = {
  flex?: number | string;
  height?: number | string;
  width?: number | string;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  aspectRatio?: number | string;
};

type BaseCartesianChartProps = ChartFrameProps & {
  data: Record<string, number | string>[];
  xAxis: XAxisConfig;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  /**
   * Render a subtle cartesian grid.
   * @default true
   */
  showGrid?: boolean;
};

type BarSeries = {
  dataKey: string;
  label?: string;
  color?: string | ThemeColor;
  stack?: string;
  radius?: number | [number, number, number, number];
};

type LineSeries = {
  dataKey: string;
  label?: string;
  color?: string | ThemeColor;
  curveType?: CurveType;
  strokeWidth?: number;
  dot?: boolean;
};

type AreaSeries = {
  dataKey: string;
  label?: string;
  color?: string | ThemeColor;
  curveType?: CurveType;
  stack?: string;
  fillOpacity?: number;
};

type PieSeries = {
  /**
   * Reads the numeric value from each row.
   */
  dataKey: string;
  /**
   * Reads the label from each row.
   *
   * @default "name"
   */
  nameKey?: string;
  /**
   * Default slice color. Can be overridden per row by adding a `fill` field to the row data.
   */
  color?: string | ThemeColor;
  /**
   * Donut charts: set an inner radius.
   * Accepts a number (px) or a percent string (e.g. "60%").
   */
  innerRadius?: number | string;
  /**
   * Accepts a number (px) or a percent string.
   * @default "80%"
   */
  outerRadius?: number | string;
  /**
   * Adds spacing between slices.
   */
  paddingAngle?: number;
  /**
   * Rounds slice corners.
   */
  cornerRadius?: number | string;
};

type ComposedSeries =
  | ({ type: "bar" } & BarSeries)
  | ({ type: "line" } & LineSeries)
  | ({ type: "area" } & AreaSeries);

type BarChartProps = BaseCartesianChartProps & {
  series: BarSeries[];
  barGap?: number;
  barCategoryGap?: number;
};

type LineChartProps = BaseCartesianChartProps & {
  series: LineSeries[];
};

type AreaChartProps = BaseCartesianChartProps & {
  series: AreaSeries[];
};

type PieChartProps = ChartFrameProps & {
  data: Record<string, number | string>[];
  /**
   * One or more pies (rarely more than one in compact widgets).
   */
  series: PieSeries[];
  showLegend?: boolean;
  showTooltip?: boolean;
};

type ChartProps = BaseCartesianChartProps & {
  series: ComposedSeries[];
  barGap?: number;
  barCategoryGap?: number;
};

function ChartSkeleton(frame: ChartFrameProps) {
  // Must mirror ChartFrame's size resolution (chartImpl.tsx) so the skeleton
  // reserves exactly the box the chart will occupy.
  return (
    <div
      className="wg-skeleton"
      style={{
        flex: frame.flex,
        height: normalizeCssSize(frame.size ?? frame.height ?? 220),
        width: normalizeCssSize(frame.size ?? frame.width) ?? "100%",
        minWidth: normalizeCssSize(frame.minWidth ?? frame.minSize) ?? 0,
        minHeight: normalizeCssSize(frame.minHeight ?? frame.minSize),
        maxWidth: normalizeCssSize(frame.maxWidth ?? frame.maxSize),
        maxHeight: normalizeCssSize(frame.maxHeight ?? frame.maxSize),
        aspectRatio: frame.aspectRatio,
        borderRadius: "12px"
      }}
      aria-hidden
    />
  );
}

const LazyBarChart = React.lazy(() =>
  import("./chartImpl").then((m) => ({ default: m.BarChartImpl }))
);
const LazyLineChart = React.lazy(() =>
  import("./chartImpl").then((m) => ({ default: m.LineChartImpl }))
);
const LazyAreaChart = React.lazy(() =>
  import("./chartImpl").then((m) => ({ default: m.AreaChartImpl }))
);
const LazyPieChart = React.lazy(() =>
  import("./chartImpl").then((m) => ({ default: m.PieChartImpl }))
);
const LazyComposedChart = React.lazy(() =>
  import("./chartImpl").then((m) => ({ default: m.ComposedChartImpl }))
);

export const BarChart: React.FC<BarChartProps> = (props) => (
  <React.Suspense fallback={<ChartSkeleton {...props} />}>
    <LazyBarChart {...props} />
  </React.Suspense>
);

export const LineChart: React.FC<LineChartProps> = (props) => (
  <React.Suspense fallback={<ChartSkeleton {...props} />}>
    <LazyLineChart {...props} />
  </React.Suspense>
);

export const AreaChart: React.FC<AreaChartProps> = (props) => (
  <React.Suspense fallback={<ChartSkeleton {...props} />}>
    <LazyAreaChart {...props} />
  </React.Suspense>
);

export const PieChart: React.FC<PieChartProps> = (props) => (
  <React.Suspense fallback={<ChartSkeleton {...props} />}>
    <LazyPieChart {...props} />
  </React.Suspense>
);

/**
 * Mixed cartesian chart that can combine bars/lines/areas via a `series` array.
 * This is the single supported "composed" chart entry point in the Widget UI.
 */
export const Chart: React.FC<ChartProps> = (props) => (
  <React.Suspense fallback={<ChartSkeleton {...props} />}>
    <LazyComposedChart {...props} />
  </React.Suspense>
);

export type {
  XAxisConfig,
  CurveType,
  ChartFrameProps,
  BaseCartesianChartProps,
  BarSeries,
  LineSeries,
  AreaSeries,
  PieSeries,
  ComposedSeries,
  BarChartProps,
  LineChartProps,
  AreaChartProps,
  PieChartProps,
  ChartProps
};
