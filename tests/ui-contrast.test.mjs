import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../src/widget/widget.css', import.meta.url), 'utf8');
const lightBlock = css.slice(css.indexOf(':root,'), css.indexOf('\n.widget-root {', css.indexOf(':root,') + 20));
const darkStart = css.indexOf('.widget-root[data-theme="dark"]');
const darkBlock = css.slice(darkStart, css.indexOf('\n}', darkStart));
const tokens = block => Object.fromEntries([...block.matchAll(/--widget-([\w-]+):\s*(#[\da-f]{6});/gi)].map(m => [m[1], m[2]]));
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) {
  const l = [luminance(a), luminance(b)].sort((a,b) => b-a);
  return (l[0]+.05)/(l[1]+.05);
}
for (const [theme, palette] of [['light', tokens(lightBlock)], ['dark', {...tokens(lightBlock), ...tokens(darkBlock)}]]) {
  test(`${theme} chart colors preserve the selected vivid palette`, () => {
    const colors = Array.from({length: 6}, (_, index) => palette[`chart-${index + 1}`]);
    assert.equal(new Set(colors).size, 6);
    assert.deepEqual(colors, ["#ffcf03", "#ffa003", "#ff5248", "#ba5cd2", "#1399f5", "#53cc28"]);
    for (const color of colors) {
      assert.match(color, /^#[0-9a-f]{6}$/i);
      const channels = color.slice(1).match(/../g).map(v => parseInt(v, 16));
      assert.ok(Math.max(...channels) - Math.min(...channels) >= 80, `${color} must not become monochrome`);
    }
  });
  test(`${theme} text and solid action palettes retain readable contrast`, () => {
    for (const tone of ['success','info','danger','discovery','accent']) {
      const ratio = contrast(palette[tone], palette[`on-${tone}`]);
      assert.ok(ratio >= 4.5, `${tone}: ${ratio.toFixed(2)}:1`);
    }
    for (const surface of ['surface','surface-secondary','surface-tertiary']) {
      for (const text of ['text-primary','text-secondary','text-tertiary']) {
        const ratio = contrast(palette[text], palette[surface]);
        assert.ok(ratio >= 4.5, `${text} on ${surface}: ${ratio.toFixed(2)}:1`);
      }
    }
  });
}
