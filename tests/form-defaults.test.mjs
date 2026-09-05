import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WidgetRenderer } from '../packages/widgets/dist/widget/index.js';

test('checked and pressed defaults are visible on the first form render', () => {
  const html = renderToStaticMarkup(React.createElement(WidgetRenderer, {
    template: '<Card><Form><Checkbox name="notifications" label="Notifications" defaultChecked /><Toggle name="enabled" label="Enabled" defaultPressed /><Toggle variant="switch" name="sync" label="Sync" defaultPressed /></Form></Card>',
    data: {},
  }));
  assert.match(html, /role="checkbox"[^>]*aria-checked="true"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /role="switch"[^>]*aria-checked="true"/);
});

test('verification inputs have a usable accessible name by default', () => {
  const html = renderToStaticMarkup(React.createElement(WidgetRenderer, {
    template: '<Card><InputOTP name="code" length={6} /></Card>', data: {},
  }));
  assert.match(html, /aria-label="Verification code"/);
});
