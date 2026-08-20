import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WidgetRenderer } from "../packages/widgets/dist/widget/index.js";

// Templates and data are model-authored, so every URL and CSS value in them is
// untrusted input. These cover the guards that keep a hostile template from
// reaching a navigable or network-fetching sink.

function render(template, data = {}) {
  return renderToStaticMarkup(
    React.createElement(WidgetRenderer, { template, data })
  );
}

test("YouTubeEmbed only ever frames a YouTube origin", () => {
  const hostile = [
    '<Card><YouTubeEmbed src="https://attacker.example/phish" /></Card>',
    '<Card><YouTubeEmbed src="http://www.youtube.com/embed/abc" /></Card>',
    '<Card><YouTubeEmbed src="//attacker.example/phish" /></Card>',
    '<Card><YouTubeEmbed src="https://www.youtube.com.attacker.example/embed/abc" /></Card>',
    '<Card><YouTubeEmbed src="not a url" /></Card>'
  ];

  for (const template of hostile) {
    const html = render(template);
    assert.ok(
      !html.includes("<iframe"),
      `expected no iframe for hostile embed: ${template}\n${html}`
    );
  }
});

test("YouTubeEmbed normalizes legitimate YouTube forms and sandboxes the frame", () => {
  const cases = [
    ['<Card><YouTubeEmbed videoId="dQw4w9WgXcQ" /></Card>', "https://www.youtube.com/embed/dQw4w9WgXcQ"],
    ['<Card><YouTubeEmbed src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" /></Card>', "https://www.youtube.com/embed/dQw4w9WgXcQ"],
    ['<Card><YouTubeEmbed src="https://youtu.be/dQw4w9WgXcQ" /></Card>', "https://www.youtube.com/embed/dQw4w9WgXcQ"]
  ];

  for (const [template, expectedSrc] of cases) {
    const html = render(template);
    assert.ok(html.includes(`src="${expectedSrc}"`), `expected ${expectedSrc} in:\n${html}`);
    assert.ok(html.includes("sandbox="), `expected a sandbox attribute in:\n${html}`);
  }

  // An existing embed URL keeps its player params.
  const withParams = render(
    '<Card><YouTubeEmbed src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=30" /></Card>'
  );
  assert.ok(withParams.includes("youtube-nocookie.com/embed/dQw4w9WgXcQ?start=30"), withParams);
});

test("links reject non-http(s) targets", () => {
  // javascript: is already neutralized by React's own URL sanitizing; data:
  // and blob: are not, and a data: link under the host origin is a phishing
  // primitive — especially as a download.
  const hostileHrefs = ["data:text/html,<script>alert(1)</script>", "blob:https://example.com/x", "javascript:alert(1)"];

  for (const href of hostileHrefs) {
    const link = render(`<Card><CardLinkItem href="{href}">x</CardLinkItem></Card>`.replace("{href}", href));
    assert.ok(!link.includes("<a "), `CardLinkItem emitted an anchor for ${href}:\n${link}`);

    const audio = render(
      `<Card><AudioPlayer src="https://cdn.example.com/a.mp3" title="Track" downloadUrl="${href}" /></Card>`
    );
    assert.ok(
      !audio.includes("download="),
      `AudioPlayer offered a download for ${href}:\n${audio}`
    );

    const context = render(
      `<Card><ContextCards items={[{ title: "Source", excerpt: "Summary", source: { label: "Reference", url: "${href}" } }]} /></Card>`
    );
    assert.ok(
      !context.includes("<a "),
      `ContextCards emitted a source link for ${href}:\n${context}`
    );
  }

  // Legitimate https targets still render.
  const okLink = render('<Card><CardLinkItem href="https://example.com/a">x</CardLinkItem></Card>');
  assert.ok(okLink.includes('href="https://example.com/a"'), okLink);

  const okAudio = render(
    '<Card><AudioPlayer src="https://cdn.example.com/a.mp3" title="Track" downloadUrl="https://cdn.example.com/a.mp3" /></Card>'
  );
  assert.ok(okAudio.includes("download="), okAudio);

  // Root-relative paths are same-origin by construction — self-hosted
  // consumers serve widget assets this way, so they must survive the guard.
  const relative = render('<Card><CardLinkItem href="/docs">x</CardLinkItem></Card>');
  assert.ok(relative.includes('href="/docs"'), relative);

  const contextLink = render(
    '<Card><ContextCards items={[{ title: "Source", excerpt: "Summary", source: { label: "Reference", url: "https://example.com/reference" } }]} /></Card>'
  );
  assert.ok(contextLink.includes('href="https://example.com/reference"'), contextLink);

  // Protocol-relative is not same-origin and must not get the shortcut.
  const protocolRelative = render('<Card><CardLinkItem href="//attacker.example/x">x</CardLinkItem></Card>');
  assert.ok(!protocolRelative.includes("attacker.example"), protocolRelative);
});

test("ImageGeneration only renders safe image sources", () => {
  const hostile = [
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>",
    "blob:https://example.com/generated",
    "javascript:alert(1)",
    "//attacker.example/generated.png"
  ];

  for (const image of hostile) {
    const html = render(
      `<Card><ImageGeneration image="${image}" prompt="Generated preview" /></Card>`
    );
    assert.ok(!html.includes("<img"), `ImageGeneration emitted an image for ${image}:\n${html}`);
  }

  const remote = render(
    '<Card><ImageGeneration image="https://images.example.com/generated.png" alt="Generated landscape" /></Card>'
  );
  assert.ok(remote.includes('src="https://images.example.com/generated.png"'), remote);
  assert.ok(remote.includes('alt="Generated landscape"'), remote);

  const relative = render(
    '<Card><ImageGeneration image="/generated/preview.png" alt="Generated preview" /></Card>'
  );
  assert.ok(relative.includes('src="/generated/preview.png"'), relative);
});

test("color props cannot smuggle a network fetch into inline CSS", () => {
  const beacon = render(
    '<Card><Text value="hi" color="url(https://attacker.example/pixel.png)" /></Card>'
  );
  assert.ok(!beacon.includes("attacker.example"), `color leaked a URL:\n${beacon}`);

  const boxBeacon = render(
    '<Card><Box background="image-set(&quot;https://attacker.example/p.png&quot;)" /></Card>'
  );
  assert.ok(!boxBeacon.includes("attacker.example"), `background leaked a URL:\n${boxBeacon}`);

  // Real color values are untouched.
  const hex = render('<Card><Text value="hi" color="#34d399" /></Card>');
  assert.ok(hex.includes("#34d399"), hex);

  const cssVar = render('<Card><Text value="hi" color="var(--widget-accent)" /></Card>');
  assert.ok(cssVar.includes("var(--widget-accent)"), cssVar);

  const rgb = render('<Card><Text value="hi" color="rgb(52, 211, 153)" /></Card>');
  assert.ok(rgb.includes("rgb(52"), rgb);
});
