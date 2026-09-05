import assert from 'node:assert/strict';
import test from 'node:test';
import { getDefaultChartColors } from '../packages/widgets/dist/widget/chartPalette.js';

test('automatic chart combinations follow the selected complementary groups', () => {
  assert.deepEqual(getDefaultChartColors(2), ['var(--widget-chart-1)', 'var(--widget-chart-6)']);
  assert.deepEqual(getDefaultChartColors(3).slice(0, 3), ['var(--widget-chart-5)', 'var(--widget-chart-6)', 'var(--widget-chart-3)']);
  for (let count = 1; count <= 12; count++) {
    const palette = getDefaultChartColors(count);
    assert.ok(!(palette.includes('var(--widget-chart-1)') && palette.includes('var(--widget-chart-2)')), 'yellow and orange must not appear together automatically');
  }
});
