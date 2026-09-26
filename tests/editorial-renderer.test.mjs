import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WidgetRenderer } from '../packages/widgets/dist/widget/index.js';

const render = (template, data = {}) => renderToStaticMarkup(React.createElement(WidgetRenderer, { template, data }));

test('markerless lists omit both marker column and gap, including item overrides', () => {
  for (const marker of ['none', '', '   ']) {
    for (const template of [
      `<List marker="${marker}"><List.Item label="Aligned" /></List>`,
      `<List marker="disc"><List.Item marker="${marker}" label="Aligned" /></List>`,
    ]) {
      const html = render(template);
      assert.match(html, /widget-list-item grid grid-cols-1/);
      assert.doesNotMatch(html, /grid-cols-\[1\.5rem|gap-2|<span/);
    }
  }
  for (const marker of ['disc', 'circle', 'square', 'decimal', 'check', 'custom']) {
    assert.match(render(`<List marker="${marker}"><List.Item label="Marked" /></List>`), /grid-cols-\[1\.5rem_minmax\(0,1fr\)\] gap-2/);
  }
});

test('citations attach to the preceding word and group consecutive markers without changing following text', () => {
  const html = render('<InlineCitations text={text} sources={sources} />', {
    text: '8 of 12 [1][2]; the room is possible [2].',
    sources: [{id: 1, label: 'Survey'}, {id: 2, label: 'Room'}],
  });
  assert.match(html, /8 of <span style="white-space:nowrap">12<sup[^>]*title="Survey">1<\/sup><sup[^>]*title="Room">2<\/sup><\/span>; the room is <span style="white-space:nowrap">possible<sup/);
  assert.doesNotMatch(html, /\s<sup/);
  assert.match(html, /wg-citation-sources/);
  assert.match(render('<InlineCitations text="[2] First" />'), /<p><sup[^>]*>2<\/sup> First<\/p>/);
  assert.match(render('<InlineCitations text="Word [1] [2] after" />'), /nowrap">Word<sup[^>]*>1<\/sup><sup[^>]*>2<\/sup><\/span> after/);
  assert.match(render('<InlineCitations text="No markers here." />'), /<p>No markers here\.<\/p>/);
});

test('Combobox sizes match Select heights, including md default', () => {
  for (const [size, height] of [['3xs',22],['2xs',24],['xs',26],['sm',28],['md',32],['lg',36],['xl',40],['2xl',44],['3xl',48]]) {
    const combo = render(`<Combobox size="${size}" options={[]} />`);
    assert.match(combo, new RegExp(`height:${height}px`));
    assert.match(render(`<Select size="${size}" options={[]} />`), new RegExp(`height:${height}px`));
    assert.match(combo, /border-radius:var\(--widget-radius-control\)/);
    assert.match(combo, /font-normal/);
    assert.match(combo, /lucide-chevron-down/);
    assert.doesNotMatch(combo, /⌄/);
  }
  assert.match(render('<Combobox options={[]} />'), /height:32px/);
});

test('audio has one custom transport, accessible seeking and mute, and preserves media props', () => {
  const html = render('<AudioPlayer src="https://example.com/audio.mp3" title="Briefing" subtitle="A useful description" durationSeconds={125} muted autoPlay loop preload="none" />');
  assert.match(html, /aria-label="Unmute" aria-pressed="true"/);
  assert.match(html, /0:00 \/ 2:05/);
  assert.match(html, /type="range"[^>]*aria-label="Seek"[^>]*max="125"[^>]*step="0.1"/);
  assert.match(html, /<audio[^>]*autoPlay=""[^>]*loop=""[^>]*muted=""[^>]*preload="none"[^>]*hidden=""/);
  assert.doesNotMatch(html, /\scontrols(?:=|\s|>)/);
  const compact = render('<AudioPlayer src="data:audio/wav;base64,AA" title="Tone" compact />');
  assert.doesNotMatch(compact, /aria-label="Seek"|aria-label="Download audio"|\scontrols(?:=|\s|>)/);
  assert.match(compact, /aria-label="Mute" aria-pressed="false"/);
  assert.match(compact, /aria-label="Play audio"/);
});
