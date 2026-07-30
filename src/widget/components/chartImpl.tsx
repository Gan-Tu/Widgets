import React from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
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
import { useResizeObserver } from "../hooks";
import { normalizeCssSize, resolveColor } from "../style";
import type {
  AreaChartProps,
  BarChartProps,
  ChartFrameProps,
  ChartProps,
  LineChartProps,
  PieChartProps,
  XAxisConfig
} from "./chart";

const defaultSeriesColors = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#8b5cf6",
  "#14b8a6"
];

const axisTickStyle = {
  fill: "var(--widget-text-tertiary)",
  fontSize: 11,
  fontWeight: 500
} as const;

const sharedAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: axisTickStyle,
  tickMargin: 8
} as const;

const gridProps = {
  strokeDasharray: "3 4",
  stroke: "var(--widget-border-subtle)",
  vertical: false
} as const;

const legendStyle = {
  fontSize: "0.75rem",
  color: "var(--widget-text-secondary)"
} as const;

const legendProps = {
  iconType: "circle",
  iconSize: 7,
  wrapperStyle: legendStyle,
  formatter: (value: string) => (
    <span style={{ color: "var(--widget-text-secondary)" }}>{value}</span>
  )
} as const;

function ensureArrayData<T>(componentName: string, data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  // Recharts expects `data` to be an array (uses `.slice()` internally).
  // If template evaluation or user-provided data passes the wrong shape, fail gracefully.
  console.warn(`[WidgetRenderer] ${componentName}: expected 'data' to be an array.`, data);
  return [];
}

// Model-authored templates can omit or mis-shape `series`/`xAxis`; a throw here
// happens during React's render phase where WidgetRenderer's try/catch can't
// reach, so degrade gracefully instead.
function ensureSeries<T>(componentName: string, series: unknown): T[] {
  if (Array.isArray(series)) return series as T[];
  console.warn(`[WidgetRenderer] ${componentName}: expected 'series' to be an array.`, series);
  return [];
}

function ensureXAxis(xAxis: unknown): XAxisConfig {
  if (xAxis && typeof xAxis === "object" && !Array.isArray(xAxis)) {
    return xAxis as XAxisConfig;
  }
  return { dataKey: "" };
}

function makeDefaultTooltipStyle(theme: ReturnType<typeof useWidgetTheme>) {
  const bg = resolveColor({ light: "#ffffff", dark: "#1a2133" }, theme) ?? "white";
  const border = resolveColor(
    { light: "rgba(23, 28, 38, 0.1)", dark: "rgba(226, 232, 240, 0.16)" },
    theme
  );
  const text = resolveColor({ light: "#171c26", dark: "#e6e9ef" }, theme);
  return {
    backgroundColor: bg,
    border: `1px solid ${border ?? "rgba(0,0,0,0.1)"}`,
    borderRadius: 12,
    color: text ?? "inherit",
    fontSize: "0.75rem",
    padding: "8px 12px",
    boxShadow:
      theme === "dark"
        ? "0 2px 4px rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.5)"
        : "0 2px 4px rgba(16,20,28,0.05), 0 12px 32px rgba(16,20,28,0.12)"
  } as React.CSSProperties;
}

function makeTooltipProps(theme: ReturnType<typeof useWidgetTheme>) {
  return {
    contentStyle: makeDefaultTooltipStyle(theme),
    labelStyle: { fontWeight: 600, marginBottom: 4 } as React.CSSProperties,
    itemStyle: { padding: "1px 0" } as React.CSSProperties,
    cursor: { fill: "var(--widget-surface-hover)", stroke: "var(--widget-border-subtle)" },
    wrapperStyle: { zIndex: 80 } as React.CSSProperties
  };
}

// Hoisted per theme: stable object identities keep Recharts' internal
// prop-equality checks effective across parent re-renders.
const tooltipPropsByTheme = {
  light: makeTooltipProps("light"),
  dark: makeTooltipProps("dark")
} as const;

// Recharts needs numeric pixel dimensions; if the frame resolves to a
// content-dependent height (e.g. height="100%" in an auto-height parent, which
// measures 0 because the chart itself renders nothing yet), fall back to this
// so the chart appears instead of staying blank forever.
const CHART_FALLBACK_HEIGHT = 220;

function ChartFrame({
  children,
  ...frame
}: ChartFrameProps & { children: React.ReactNode }) {
  const resolvedHeight = normalizeCssSize(frame.size ?? frame.height ?? 220) ?? "220px";
  const resolvedWidth = normalizeCssSize(frame.size ?? frame.width) ?? "100%";
  const frameRef = React.useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  const fallbackHeight = /^\d+(\.\d+)?px$/.test(resolvedHeight)
    ? Math.max(1, Math.floor(parseFloat(resolvedHeight)))
    : CHART_FALLBACK_HEIGHT;

  useResizeObserver(frameRef, (node) => {
    const rect = node.getBoundingClientRect();
    const next =
      rect.width > 0
        ? {
            width: Math.max(1, Math.floor(rect.width)),
            height: rect.height > 0 ? Math.max(1, Math.floor(rect.height)) : fallbackHeight
          }
        : null;
    // Bail out on unchanged size so ResizeObserver ticks (any layout change
    // near the frame) don't re-render the whole Recharts subtree.
    setDimensions((previous) =>
      previous && next && previous.width === next.width && previous.height === next.height
        ? previous
        : next
    );
  });

  return (
    <div
      ref={frameRef}
      style={{
        flex: frame.flex,
        height: resolvedHeight,
        width: resolvedWidth,
        // In flex layouts, `min-width: auto` lets content force overflow;
        // `minWidth: 0` keeps the measured frame able to shrink with its row.
        minWidth: normalizeCssSize(frame.minWidth ?? frame.minSize) ?? 0,
        minHeight: normalizeCssSize(frame.minHeight ?? frame.minSize),
        maxWidth: normalizeCssSize(frame.maxWidth ?? frame.maxSize),
        maxHeight: normalizeCssSize(frame.maxHeight ?? frame.maxSize),
        aspectRatio: frame.aspectRatio
      }}
    >
      {dimensions && React.isValidElement(children)
        ? React.cloneElement(children, dimensions)
        : null}
    </div>
  );
}

function defaultXAxisTickFormatter(xAxis: XAxisConfig) {
  // Recharts expects tickFormatter to return a string.
  // Also, its typing is `(value: any, index: number) => string`.
  return (value: unknown) =>
    String(xAxis.labels ? xAxis.labels[value as string | number] ?? value : value);
}

export const BarChartImpl: React.FC<BarChartProps> = ({
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
  const tooltipProps = tooltipPropsByTheme[theme];
  const safeData = ensureArrayData<Record<string, number | string>>("BarChart", data);
  const safeSeries = ensureSeries<BarChartProps["series"][number]>("BarChart", series);
  const safeXAxis = ensureXAxis(xAxis);
  // For stacked bars, only round the top segment in each stack.
  // Otherwise inner segments have rounded corners which creates a visible "gap" between stacks.
  const topBarDataKeyByStack = React.useMemo(() => {
    const map = new Map<string, string>();
    safeSeries.forEach((s) => {
      if (s.stack) map.set(s.stack, s.dataKey);
    });
    return map;
  }, [safeSeries]);

  return (
    <ChartFrame {...frame}>
      <ReBarChart data={safeData} barGap={barGap} barCategoryGap={barCategoryGap}>
        {showGrid ? <CartesianGrid {...gridProps} /> : null}
        <XAxis
          dataKey={safeXAxis.dataKey}
          hide={safeXAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(safeXAxis)}
          {...sharedAxisProps}
        />
        {showYAxis ? <YAxis width={36} {...sharedAxisProps} /> : null}
        {showTooltip ? <Tooltip {...tooltipProps} /> : null}
        {showLegend ? <Legend {...legendProps} /> : null}
        {safeSeries.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          const defaultRadius: [number, number, number, number] = [5, 5, 0, 0];
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
              maxBarSize={44}
            />
          );
        })}
      </ReBarChart>
    </ChartFrame>
  );
};

export const LineChartImpl: React.FC<LineChartProps> = ({
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
  const tooltipProps = tooltipPropsByTheme[theme];
  const safeData = ensureArrayData<Record<string, number | string>>("LineChart", data);
  const safeSeries = ensureSeries<LineChartProps["series"][number]>("LineChart", series);
  const safeXAxis = ensureXAxis(xAxis);

  return (
    <ChartFrame {...frame}>
      <ReLineChart data={safeData}>
        {showGrid ? <CartesianGrid {...gridProps} /> : null}
        <XAxis
          dataKey={safeXAxis.dataKey}
          hide={safeXAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(safeXAxis)}
          {...sharedAxisProps}
        />
        {showYAxis ? <YAxis width={36} {...sharedAxisProps} /> : null}
        {showTooltip ? (
          <Tooltip {...tooltipProps} cursor={{ stroke: "var(--widget-border-default)", strokeDasharray: "3 3" }} />
        ) : null}
        {showLegend ? <Legend {...legendProps} /> : null}
        {safeSeries.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          return (
            <Line
              key={`line-${s.dataKey}`}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={color}
              type={s.curveType ?? "monotone"}
              strokeWidth={s.strokeWidth ?? 2}
              strokeLinecap="round"
              dot={s.dot ?? false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--widget-surface-elevated)" }}
            />
          );
        })}
      </ReLineChart>
    </ChartFrame>
  );
};

export const AreaChartImpl: React.FC<AreaChartProps> = ({
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
  const tooltipProps = tooltipPropsByTheme[theme];
  const gradientId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const safeData = ensureArrayData<Record<string, number | string>>("AreaChart", data);
  const safeSeries = ensureSeries<AreaChartProps["series"][number]>("AreaChart", series);
  const safeXAxis = ensureXAxis(xAxis);

  return (
    <ChartFrame {...frame}>
      <ReAreaChart data={safeData}>
        <defs>
          {safeSeries.map((s, index) => {
            const color =
              resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
              defaultSeriesColors[index % defaultSeriesColors.length];
            return (
              <linearGradient
                key={`grad-${s.dataKey}`}
                id={`wgArea${gradientId}${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={s.fillOpacity ?? 0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid ? <CartesianGrid {...gridProps} /> : null}
        <XAxis
          dataKey={safeXAxis.dataKey}
          hide={safeXAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(safeXAxis)}
          {...sharedAxisProps}
        />
        {showYAxis ? <YAxis width={36} {...sharedAxisProps} /> : null}
        {showTooltip ? (
          <Tooltip {...tooltipProps} cursor={{ stroke: "var(--widget-border-default)", strokeDasharray: "3 3" }} />
        ) : null}
        {showLegend ? <Legend {...legendProps} /> : null}
        {safeSeries.map((s, index) => {
          const color =
            resolveColor(s.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
            defaultSeriesColors[index % defaultSeriesColors.length];
          return (
            <Area
              key={`area-${s.dataKey}`}
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#wgArea${gradientId}${index})`}
              stackId={s.stack}
              type={s.curveType ?? "monotone"}
              fillOpacity={1}
            />
          );
        })}
      </ReAreaChart>
    </ChartFrame>
  );
};

export const PieChartImpl: React.FC<PieChartProps> = ({
  data,
  series,
  showLegend = true,
  showTooltip = true,
  ...frame
}) => {
  const theme = useWidgetTheme();
  const tooltipProps = tooltipPropsByTheme[theme];
  const safeData = ensureArrayData<Record<string, number | string>>("PieChart", data);
  const safeSeries = ensureSeries<PieChartProps["series"][number]>("PieChart", series);

  return (
    <ChartFrame {...frame}>
      <RePieChart>
        {showTooltip ? <Tooltip {...tooltipProps} cursor={false} /> : null}
        {showLegend ? <Legend {...legendProps} /> : null}
        {safeSeries.map((s, seriesIndex) => {
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
              paddingAngle={s.paddingAngle ?? (s.innerRadius ? 2 : 0)}
              cornerRadius={s.cornerRadius ?? (s.innerRadius ? 4 : 0)}
              stroke="var(--widget-surface-elevated)"
              strokeWidth={1}
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
export const ComposedChartImpl: React.FC<ChartProps> = ({
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
  const tooltipProps = tooltipPropsByTheme[theme];
  const gradientId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const safeData = ensureArrayData<Record<string, number | string>>("Chart", data);
  const safeSeries = ensureSeries<ChartProps["series"][number]>("Chart", series);
  const safeXAxis = ensureXAxis(xAxis);
  const topBarDataKeyByStack = React.useMemo(() => {
    const map = new Map<string, string>();
    safeSeries.forEach((s) => {
      if (s.type === "bar" && s.stack) map.set(s.stack, s.dataKey);
    });
    return map;
  }, [safeSeries]);

  return (
    <ChartFrame {...frame}>
      <ReComposedChart data={safeData} barGap={barGap} barCategoryGap={barCategoryGap}>
        <defs>
          {safeSeries.map((item, index) => {
            if (item.type !== "area") return null;
            const color =
              resolveColor(item.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
              defaultSeriesColors[index % defaultSeriesColors.length];
            return (
              <linearGradient
                key={`grad-${item.dataKey}`}
                id={`wgComposed${gradientId}${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={item.fillOpacity ?? 0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid ? <CartesianGrid {...gridProps} /> : null}
        <XAxis
          dataKey={safeXAxis.dataKey}
          hide={safeXAxis.hide}
          tickFormatter={defaultXAxisTickFormatter(safeXAxis)}
          {...sharedAxisProps}
        />
        {showYAxis ? <YAxis width={36} {...sharedAxisProps} /> : null}
        {showTooltip ? <Tooltip {...tooltipProps} /> : null}
        {showLegend ? <Legend {...legendProps} /> : null}
        {safeSeries.map((item, index) => {
          const baseColor =
            resolveColor(
              item.color ?? defaultSeriesColors[index % defaultSeriesColors.length],
              theme
            ) ?? defaultSeriesColors[index % defaultSeriesColors.length];

          if (item.type === "bar") {
            const defaultRadius: [number, number, number, number] = [5, 5, 0, 0];
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
                maxBarSize={44}
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
                strokeWidth={2}
                fill={`url(#wgComposed${gradientId}${index})`}
                stackId={item.stack}
                type={item.curveType ?? "monotone"}
                fillOpacity={1}
              />
            );
          }
          return (
            <Line
              key={`line-${item.dataKey}`}
              dataKey={item.dataKey}
              name={item.label ?? item.dataKey}
              stroke={baseColor}
              type={item.curveType ?? "monotone"}
              strokeWidth={item.strokeWidth ?? 2}
              strokeLinecap="round"
              dot={item.dot ?? false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--widget-surface-elevated)" }}
            />
          );
        })}
      </ReComposedChart>
    </ChartFrame>
  );
};

