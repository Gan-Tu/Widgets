/** Automatic combinations use the supplied palette without pairing yellow and orange. */
export function getDefaultChartColors(seriesCount: number): string[] {
  const indices = seriesCount === 1 ? [5] : seriesCount === 2 ? [1, 6] : [5, 6, 3, 4, 2];
  return indices.map(index => `var(--widget-chart-${index})`);
}
