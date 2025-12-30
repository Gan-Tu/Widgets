import React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
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

type Series =
  | {
      type: "bar";
      label?: string;
      dataKey: string;
      color?: string | ThemeColor;
      stack?: string;
    }
  | {
      type: "area";
      label?: string;
      dataKey: string;
      color?: string | ThemeColor;
      curveType?: CurveType;
      stack?: string;
    }
  | {
      type: "line";
      label?: string;
      dataKey: string;
      color?: string | ThemeColor;
      curveType?: CurveType;
    };

type ChartProps = {
  data: Record<string, number | string>[];
  series: Series[];
  xAxis: XAxisConfig;
  showYAxis?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  barGap?: number;
  barCategoryGap?: number;
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

const defaultSeriesColors = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#facc15",
  "#ec4899"
];

const Chart: React.FC<ChartProps> = ({
  data,
  series,
  xAxis,
  showYAxis = false,
  showLegend = true,
  showTooltip = true,
  barGap,
  barCategoryGap,
  flex,
  height = 220,
  width,
  size,
  minSize,
  maxSize,
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  aspectRatio
}) => {
  const theme = useWidgetTheme();
  const resolvedHeight = size ? sizeToCss(size) : sizeToCss(height);
  const resolvedWidth = size ? sizeToCss(size) : sizeToCss(width);

  return (
    <div
      style={{
        flex,
        height: resolvedHeight,
        width: resolvedWidth,
        minWidth: sizeToCss(minWidth ?? minSize),
        minHeight: sizeToCss(minHeight ?? minSize),
        maxWidth: sizeToCss(maxWidth ?? maxSize),
        maxHeight: sizeToCss(maxHeight ?? maxSize),
        aspectRatio
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} barGap={barGap} barCategoryGap={barCategoryGap}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.35)" />
          <XAxis
            dataKey={xAxis.dataKey}
            hide={xAxis.hide}
            tickFormatter={(value) =>
              xAxis.labels ? xAxis.labels[value] ?? value : value
            }
          />
          {showYAxis ? <YAxis /> : null}
          {showTooltip ? <Tooltip /> : null}
          {showLegend ? <Legend /> : null}
          {series.map((item, index) => {
            const color =
              resolveColor(item.color ?? defaultSeriesColors[index % defaultSeriesColors.length], theme) ??
              defaultSeriesColors[index % defaultSeriesColors.length];
            if (item.type === "bar") {
              return (
                <Bar
                  key={`${item.type}-${item.dataKey}`}
                  dataKey={item.dataKey}
                  name={item.label ?? item.dataKey}
                  fill={color}
                  stackId={item.stack}
                  radius={[6, 6, 0, 0]}
                />
              );
            }
            if (item.type === "area") {
              return (
                <Area
                  key={`${item.type}-${item.dataKey}`}
                  dataKey={item.dataKey}
                  name={item.label ?? item.dataKey}
                  stroke={color}
                  fill={color}
                  stackId={item.stack}
                  type={item.curveType ?? "natural"}
                  fillOpacity={0.2}
                />
              );
            }
            return (
              <Line
                key={`${item.type}-${item.dataKey}`}
                dataKey={item.dataKey}
                name={item.label ?? item.dataKey}
                stroke={color}
                type={item.curveType ?? "natural"}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export { Chart };
export type { ChartProps };
