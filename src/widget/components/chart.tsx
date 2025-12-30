import React from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart as ReAreaChart,
  Bar,
  BarChart as ReBarChart,
  ComposedChart as ReComposedChart,
  Line,
  LineChart as ReLineChart,
  PieChart as RePieChart
} from "recharts";

import { useWidgetTheme } from "../context";
import type { ThemeColor } from "../types";
import { resolveColor, sizeToCss } from "../style";

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

const defaultSeriesColors = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#facc15",
  "#ec4899"
];

function ensureArrayData<T>(componentName: string, data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  // Recharts expects `data` to be an array (uses `.slice()` internally).
  // If template evaluation or user-provided data passes the wrong shape, fail gracefully.
  console.warn(`[WidgetRenderer] ${componentName}: expected 'data' to be an array.`, data);
  return [];
}

function makeDefaultTooltipStyle(theme: ReturnType<typeof useWidgetTheme>) {
  const bg = resolveColor({ light: "white", dark: "rgb(15 23 42)" }, theme) ?? "white";
  const border = resolveColor({ light: "rgba(15, 23, 42, 0.14)", dark: "rgba(148, 163, 184, 0.24)" }, theme);
  const text = resolveColor({ light: "rgb(15 23 42)", dark: "rgb(226 232 240)" }, theme);
  return {
    backgroundColor: bg,
    border: `1px solid ${border ?? "rgba(0,0,0,0.1)"}`,
    borderRadius: 10,
    color: text ?? "inherit",
    padding: "10px 12px",
    boxShadow:
      theme === "dark"
        ? "0 10px 25px rgba(0,0,0,0.45)"
        : "0 10px 25px rgba(2,6,23,0.12)"
  } as React.CSSProperties;
}

function normalizeCssSize(value: number | string | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  // Help prevent invalid CSS like height="240" (string) which would become `height: 240` (invalid)
  // and can make ResponsiveContainer measure -1/-1.
  if (/^\d+(\.\d+)?$/.test(value)) return `${value}px`;
  return value;
}

function ChartFrame({
  children,
  ...frame
}: ChartFrameProps & { children: React.ReactNode }) {
  const resolvedHeight = normalizeCssSize(frame.size ?? frame.height ?? 220) ?? "220px";
  const resolvedWidth = normalizeCssSize(frame.size ?? frame.width) ?? "100%";

  return (
    <div
      style={{
        flex: frame.flex,
        height: resolvedHeight,
        width: resolvedWidth,
        // In flex layouts, `min-width: auto` can cause children to overflow / measure weirdly.
        // `minWidth: 0` ensures ResponsiveContainer can shrink and still compute a width.
        minWidth: normalizeCssSize(frame.minWidth ?? frame.minSize) ?? 0,
        minHeight: normalizeCssSize(frame.minHeight ?? frame.minSize),
        maxWidth: sizeToCss(frame.maxWidth ?? frame.maxSize),
        maxHeight: sizeToCss(frame.maxHeight ?? frame.maxSize),
        aspectRatio: frame.aspectRatio
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function defaultXAxisTickFormatter(xAxis: XAxisConfig) {
  // Recharts expects tickFormatter to return a string.
  // Also, its typing is `(value: any, index: number) => string`.
  return (value: unknown, _index: number) =>
    String(xAxis.labels ? xAxis.labels[value as string | number] ?? value : value);
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  xAxis,
  showYAxis = false,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  barGap,
  barCategoryGap,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipStyle = makeDefaultTooltipStyle(theme);
  const safeData = ensureArrayData<Record<string, number | string>>("BarChart", data);
  // For stacked bars, only round the top segment in each stack.
  // Otherwise inner segments have rounded corners which creates a visible "gap" between stacks.
  const topBarDataKeyByStack = React.useMemo(() => {
    const map = new Map<string, string>();
    series.forEach((s) => {
      if (s.stack) map.set(s.stack, s.dataKey);
    });
    return map;
  }, [series]);

  return (
    <ChartFrame {...frame}>
      <ReBarChart data={safeData} barGap={barGap} barCategoryGap={barCategoryGap}>
        {showGrid ? (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
        ) : null}
        <XAxis
          dataKey={xAxis.dataKey}
          hide={xAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(xAxis)}
        />
        {showYAxis ? <YAxis /> : null}
        {showTooltip ? <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 80 }} /> : null}
        {showLegend ? <Legend /> : null}
        {series.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          const defaultRadius: [number, number, number, number] = [6, 6, 0, 0];
          const isStacked = Boolean(s.stack);
          const isTopOfStack =
            typeof s.stack === "string" ? topBarDataKeyByStack.get(s.stack) === s.dataKey : false;
          const radius = isStacked && !isTopOfStack ? 0 : (s.radius ?? defaultRadius);
          return (
            <Bar
              key={`bar-${s.dataKey}`}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              fill={color}
              stackId={s.stack}
              radius={radius}
            />
          );
        })}
      </ReBarChart>
    </ChartFrame>
  );
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  xAxis,
  showYAxis = false,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipStyle = makeDefaultTooltipStyle(theme);
  const safeData = ensureArrayData<Record<string, number | string>>("LineChart", data);

  return (
    <ChartFrame {...frame}>
      <ReLineChart data={safeData}>
        {showGrid ? (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
        ) : null}
        <XAxis
          dataKey={xAxis.dataKey}
          hide={xAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(xAxis)}
        />
        {showYAxis ? <YAxis /> : null}
        {showTooltip ? <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 80 }} /> : null}
        {showLegend ? <Legend /> : null}
        {series.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          return (
            <Line
              key={`line-${s.dataKey}`}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={color}
              type={s.curveType ?? "natural"}
              strokeWidth={s.strokeWidth ?? 2}
              dot={s.dot ?? false}
            />
          );
        })}
      </ReLineChart>
    </ChartFrame>
  );
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  series,
  xAxis,
  showYAxis = false,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipStyle = makeDefaultTooltipStyle(theme);
  const safeData = ensureArrayData<Record<string, number | string>>("AreaChart", data);

  return (
    <ChartFrame {...frame}>
      <ReAreaChart data={safeData}>
        {showGrid ? (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
        ) : null}
        <XAxis
          dataKey={xAxis.dataKey}
          hide={xAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(xAxis)}
        />
        {showYAxis ? <YAxis /> : null}
        {showTooltip ? <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 80 }} /> : null}
        {showLegend ? <Legend /> : null}
        {series.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          return (
            <Area
              key={`area-${s.dataKey}`}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={color}
              fill={color}
              stackId={s.stack}
              type={s.curveType ?? "natural"}
              fillOpacity={s.fillOpacity ?? 0.2}
            />
          );
        })}
      </ReAreaChart>
    </ChartFrame>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  series,
  showLegend = true,
  showTooltip = true,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipStyle = makeDefaultTooltipStyle(theme);
  const safeData = ensureArrayData<Record<string, number | string>>("PieChart", data);

  return (
    <ChartFrame {...frame}>
      <RePieChart>
        {showTooltip ? <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 80 }} /> : null}
        {showLegend ? <Legend /> : null}
        {series.map((s, seriesIndex) => {
          const defaultColor =
            resolveColor(s.color ?? defaultSeriesColors[seriesIndex % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[seriesIndex % defaultSeriesColors.length];

          const outerRadius = s.outerRadius ?? "80%";
          const nameKey = s.nameKey ?? "name";

          return (
            <Pie
              key={`pie-${s.dataKey}-${seriesIndex}`}
              data={safeData}
              dataKey={s.dataKey}
              nameKey={nameKey}
              innerRadius={s.innerRadius}
              outerRadius={outerRadius}
              paddingAngle={s.paddingAngle}
              cornerRadius={s.cornerRadius}
              label={false}
            >
              {safeData.map((row, sliceIndex) => {
                const rowFill = (row as Record<string, unknown>)?.fill;
                const sliceColor =
                  typeof rowFill === "string"
                    ? resolveColor(rowFill, theme) ?? rowFill
                    : resolveColor(defaultSeriesColors[sliceIndex % defaultSeriesColors.length], theme) ??
                      defaultColor;
                return <Cell key={`cell-${sliceIndex}`} fill={sliceColor} />;
              })}
            </Pie>
          );
        })}
      </RePieChart>
    </ChartFrame>
  );
};

// Internal implementation used by <Chart />.
const ChartImpl: React.FC<ChartProps> = ({
  data,
  series,
  xAxis,
  showYAxis = false,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  barGap,
  barCategoryGap,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipStyle = makeDefaultTooltipStyle(theme);
  const safeData = ensureArrayData<Record<string, number | string>>("Chart", data);
  const topBarDataKeyByStack = React.useMemo(() => {
    const map = new Map<string, string>();
    series.forEach((s) => {
      if (s.type === "bar" && s.stack) map.set(s.stack, s.dataKey);
    });
    return map;
  }, [series]);

  return (
    <ChartFrame {...frame}>
      <ReComposedChart data={safeData} barGap={barGap} barCategoryGap={barCategoryGap}>
        {showGrid ? (
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
        ) : null}
        <XAxis
          dataKey={xAxis.dataKey}
          hide={xAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(xAxis)}
        />
        {showYAxis ? <YAxis /> : null}
        {showTooltip ? <Tooltip contentStyle={tooltipStyle} wrapperStyle={{ zIndex: 80 }} /> : null}
        {showLegend ? <Legend /> : null}
        {series.map((item, index) => {
          const baseColor =
            resolveColor(
              item.color ?? defaultSeriesColors[index % defaultSeriesColors.length],
              theme
            ) ?? defaultSeriesColors[index % defaultSeriesColors.length];

          if (item.type === "bar") {
            const defaultRadius: [number, number, number, number] = [6, 6, 0, 0];
            const isStacked = Boolean(item.stack);
            const isTopOfStack =
              typeof item.stack === "string"
                ? topBarDataKeyByStack.get(item.stack) === item.dataKey
                : false;
            const radius = isStacked && !isTopOfStack ? 0 : (item.radius ?? defaultRadius);
            return (
              <Bar
                key={`bar-${item.dataKey}`}
                dataKey={item.dataKey}
                name={item.label ?? item.dataKey}
                fill={baseColor}
                stackId={item.stack}
                radius={radius}
              />
            );
          }
          if (item.type === "area") {
            return (
              <Area
                key={`area-${item.dataKey}`}
                dataKey={item.dataKey}
                name={item.label ?? item.dataKey}
                stroke={baseColor}
                fill={baseColor}
                stackId={item.stack}
                type={item.curveType ?? "natural"}
                fillOpacity={item.fillOpacity ?? 0.2}
              />
            );
          }
          return (
            <Line
              key={`line-${item.dataKey}`}
              dataKey={item.dataKey}
              name={item.label ?? item.dataKey}
              stroke={baseColor}
              type={item.curveType ?? "natural"}
              strokeWidth={item.strokeWidth ?? 2}
              dot={item.dot ?? false}
            />
          );
        })}
      </ReComposedChart>
    </ChartFrame>
  );
};

/**
 * Mixed cartesian chart that can combine bars/lines/areas via a `series` array.
 * This is the single supported "composed" chart entry point in the Widget UI.
 */
export const Chart: React.FC<ChartProps> = (props) => <ChartImpl {...props} />;

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
