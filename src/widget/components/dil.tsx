import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import React from "react";
import { useControlValue, fieldId } from "../binding";
import { AnimatePresence, motion } from "motion/react";
import {
  Download,
  MapPin,
  Pause,
  Play,
  Volume2,
  VolumeX
} from "lucide-react";

import {
  buildChangePayload,
  useWidgetAction,
  useWidgetTheme,
  WidgetThemeProvider
} from "../context";
import { useActionHandler, useResizeObserver, useVisibleAction } from "../hooks";
import { safeHttpHref } from "../url";
import type {
  ActionConfig,
  Alignment,
  Border,
  ControlSize,
  Padding,
  RadiusValue,
  TextSize,
  ThemeColor,
  WidgetIcon
} from "../types";
import { iconNames } from "../iconNames";
import {
  applyPadding,
  controlHeights,
  resolveColor,
  resolveGap,
  resolveRadius,
  sizeToCss
} from "../style";
import { Box, Row } from "./layout";
import { Badge, Icon, Image } from "./content";
import { Text, Caption } from "./text";
import { BaseCarousel, BaseCarouselItem, BaseCarouselMediaItem, CardCarousel, CardLinkItem } from "./carousel";
import { useWidgetAppearance } from "../theme";
import { useLiquidGlassRoot } from "../liquidGlass/useLiquidGlass";

type ChildrenProps = { children?: React.ReactNode };

function toCssSize(value: number | string | undefined, fallback?: string) {
  return sizeToCss(value) ?? fallback;
}

function textSizeToCss(size: TextSize | undefined) {
  const map: Record<TextSize, string> = {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem"
  };
  return map[size ?? "md"];
}

const Response: React.FC<
  ChildrenProps & {
    gap?: number | string;
    padding?: number | string | Padding;
    theme?: "light" | "dark";
    onVisibleAction?: ActionConfig;
  }
> = ({ children, gap, padding, theme, onVisibleAction }) => {
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const visibleRef = useVisibleAction<HTMLDivElement>(onVisibleAction);
  useLiquidGlassRoot(visibleRef);
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    // Root container parity with Basic: fill the width so auto-fit grids
    // inside don't collapse in shrink-to-fit hosts.
    width: "100%",
    gap: resolveGap(gap ?? 3)
  };
  applyPadding(style, padding);

  // Response is a valid template root, so it must establish the .widget-root
  // scope (tokens, font, cursor/focus rules) and the theme like Basic does.
  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div ref={visibleRef} className="widget-root" data-theme={resolvedTheme} data-appearance={useWidgetAppearance()} style={style}>
        {children}
      </div>
    </WidgetThemeProvider>
  );
};

const Debug: React.FC<ChildrenProps & { value?: unknown; label?: string; onVisibleAction?: ActionConfig }> = ({
  children,
  value,
  label = "Debug",
  onVisibleAction
}) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  return (
    <div
      ref={ref}
      className="rounded-lg border border-dashed p-3 font-mono text-xs"
      style={{
        borderColor: "var(--widget-border-strong)",
        background: "var(--widget-surface-secondary)",
        color: "var(--widget-text-secondary)"
      }}
    >
      <div className="mb-2 font-semibold" style={{ color: "var(--widget-text-secondary)" }}>
        {label}
      </div>
      {value !== undefined ? <pre className="wg-debug-value">{JSON.stringify(value, null, 2)}</pre> : children}
    </div>
  );
};

type InlineWrap = "nowrap" | "wrap" | "wrap-reverse";

const Inline: React.FC<
  ChildrenProps & { gap?: number | string; align?: Alignment; wrap?: InlineWrap; onVisibleAction?: ActionConfig }
> = ({
  children,
  gap = 1,
  align = "center",
  wrap = "wrap",
  onVisibleAction
}) => {
  const ref = useVisibleAction<HTMLSpanElement>(onVisibleAction);
  return (
    <span
      ref={ref}
      style={{
        display: "inline-flex",
        alignItems: align === "center" ? "center" : align,
        flexWrap: wrap,
        gap: resolveGap(gap),
        maxWidth: "100%",
        minWidth: 0,
        verticalAlign: "middle"
      }}
    >
      {children}
    </span>
  );
};

const Emphasis: React.FC<ChildrenProps & { value?: string; color?: string | ThemeColor; size?: TextSize }> = ({
  children,
  value,
  color,
  size
}) => {
  const theme = useWidgetTheme();
  return (
    <span style={{ color: resolveColor(color, theme), fontSize: size ? textSizeToCss(size) : undefined }}>
      {value ?? children}
    </span>
  );
};

const Bold: React.FC<React.ComponentProps<typeof Emphasis>> = (props) => (
  <strong style={{ fontWeight: 700 }}>
    <Emphasis {...props} />
  </strong>
);

const Italic: React.FC<React.ComponentProps<typeof Emphasis>> = (props) => (
  <em>
    <Emphasis {...props} />
  </em>
);

const Underline: React.FC<React.ComponentProps<typeof Emphasis>> = (props) => (
  <span style={{ textDecoration: "underline", textUnderlineOffset: "0.12em" }}>
    <Emphasis {...props} />
  </span>
);

const Code: React.FC<React.ComponentProps<typeof Emphasis>> = ({ value, children }) => (
  <code
    className="rounded-md px-1.5 py-0.5 text-[0.86em]"
    style={{
      fontFamily: "var(--widget-font-mono)",
      background: "var(--widget-surface-tertiary)",
      color: "var(--widget-text-primary)",
      border: "1px solid var(--widget-border-subtle)"
    }}
  >
    {value ?? children}
  </code>
);

const MathText: React.FC<React.ComponentProps<typeof Emphasis>> = ({ value, children }) => (
  <span className="font-serif italic" style={{ color: "var(--widget-text-primary)" }}>
    {value ?? children}
  </span>
);

const Highlight: React.FC<React.ComponentProps<typeof Emphasis> & { color?: string | ThemeColor }> = ({
  value,
  children,
  color
}) => {
  const theme = useWidgetTheme();
  return (
    <mark className="wg-highlight"
      style={color ? { background: resolveColor(color, theme) } : undefined}
    >
      {value ?? children}
    </mark>
  );
};

const ShimmerText: React.FC<{ value: string; size?: TextSize }> = ({ value, size = "md" }) => (
  <span
    className="bg-[linear-gradient(100deg,var(--widget-text-tertiary)_20%,var(--widget-text-emphasis)_40%,var(--widget-text-tertiary)_60%)] bg-[length:200%_100%] bg-clip-text font-medium text-transparent animate-pulse"
    style={{ fontSize: textSizeToCss(size) }}
  >
    {value}
  </span>
);

const LoadingDot: React.FC<{ size?: number | string; color?: string | ThemeColor }> = ({
  size = 8,
  color = "secondary"
}) => {
  const theme = useWidgetTheme();
  return (
    <span
      className="inline-block animate-pulse rounded-full"
      style={{
        width: toCssSize(size),
        height: toCssSize(size),
        background: resolveColor(color, theme)
      }}
    />
  );
};

const LoadingIndicator: React.FC<{ label?: string }> = ({ label = "Loading" }) => (
  <Row gap={2}>
    <LoadingDot />
    <LoadingDot />
    <LoadingDot />
    <Caption value={label} />
  </Row>
);

const LoadingBlock: React.FC<{ height?: number | string; width?: number | string; radius?: RadiusValue }> = ({
  height = 64,
  width = "100%",
  radius = "md"
}) => (
  <div
    className="wg-skeleton"
    style={{ height: toCssSize(height), width: toCssSize(width), borderRadius: resolveRadius(radius) }}
  />
);

const PulseIndicator: React.FC<{ color?: string | ThemeColor; label?: string }> = ({
  color = "success",
  label
}) => {
  const theme = useWidgetTheme();
  const resolved = resolveColor(color, theme);
  return (
    <Row gap={2}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: resolved }} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: resolved }} />
      </span>
      {label ? <Caption value={label} /> : null}
    </Row>
  );
};

const CotResolvedIcon: React.FC<{ resolved?: boolean; label?: string }> = ({
  resolved = true,
  label = resolved ? "Resolved" : "Pending"
}) => (
  <Badge label={label} color={resolved ? "success" : "warning"} variant="soft" />
);

const FootballLocationIndicator: React.FC<{ label?: string; side?: "home" | "away" | "neutral" }> = ({
  label = "Location",
  side = "neutral"
}) => (
  <Badge
    label={label}
    color={side === "home" ? "success" : side === "away" ? "info" : "secondary"}
    variant="soft"
  />
);

const Favicon: React.FC<{ url?: string; src?: string; size?: number | string; frame?: boolean; alt?: string }> = ({
  url,
  src,
  size = 20,
  frame = true,
  alt
}) => <Image src={src ?? url ?? ""} alt={alt ?? ""} size={size} radius="full" frame={frame} />;

type MediaImageData = {
  url?: string;
  content_url?: string;
  thumbnail_url?: string;
  title?: string;
};

const AudioPlayer: React.FC<{
  src: string;
  title: string;
  subtitle?: string;
  durationSeconds?: number;
  compact?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  defaultPlaybackRate?: number;
  downloadUrl?: string;
  downloadFilename?: string;
}> = ({
  src,
  title,
  subtitle,
  durationSeconds = 0,
  compact,
  autoPlay,
  loop,
  muted,
  preload = "metadata",
  defaultPlaybackRate = 1,
  downloadUrl,
  downloadFilename
}) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [isMuted, setMuted] = React.useState(Boolean(muted));
  const [elapsed, setElapsed] = React.useState(0);
  const [mediaDuration, setMediaDuration] = React.useState<number | null>(null);
  const duration = mediaDuration ?? (Number.isFinite(durationSeconds) ? Math.max(0, durationSeconds) : 0);
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  // The time sits beside the seek bar; compact players, which have none, show it in the header.
  const time = <span className="wg-audio-time">{formatTime(elapsed)} / {formatTime(duration)}</span>;
  const updateDuration = (audio: HTMLAudioElement) => {
    setMediaDuration(Number.isFinite(audio.duration) ? Math.max(0, audio.duration) : null);
  };

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = defaultPlaybackRate;
  }, [defaultPlaybackRate]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  // A `download` link renders under the host's origin, so an unconstrained
  // href would let a template hand the user a `data:`/`blob:` file that looks
  // like it came from the app. Only offer the download for real http(s) URLs.
  const downloadHref = safeHttpHref(downloadUrl ?? src);

  return (
    <Box border={{ size: 1, color: "subtle" }} radius="lg" padding={3} background="surface-secondary" gap={2}>
      <div className="wg-audio-header">
        <button
          type="button"
          className="wg-interactive wg-audio-play flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
          style={{ background: "var(--widget-accent)", color: "var(--widget-on-accent)" }}
          onClick={toggle}
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="wg-audio-text">
          <div className="wg-audio-title">{title}</div>
          {subtitle ? <div className="wg-audio-subtitle">{subtitle}</div> : null}
        </div>
        {compact ? time : null}
        <button type="button" className="wg-interactive wg-audio-action" aria-label={isMuted ? "Unmute" : "Mute"}
          aria-pressed={isMuted} onClick={() => {
            const next = !isMuted;
            setMuted(next);
            if (audioRef.current) audioRef.current.muted = next;
          }}>
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        {downloadHref ? (
          <a
            className="wg-interactive wg-audio-action"
            href={downloadHref}
            download={downloadFilename ?? title}
            aria-label="Download audio"
          >
            <Download size={16} />
          </a>
        ) : null}
      </div>
      {!compact ? <div className="wg-audio-progress"><input type="range" className="wg-audio-seek" aria-label="Seek" min={0} max={duration} step={0.1}
        value={Math.min(elapsed, duration)} disabled={duration <= 0}
        style={{ "--wg-audio-progress": `${duration > 0 ? Math.min(elapsed / duration, 1) * 100 : 0}%` } as React.CSSProperties}
        onChange={(event) => {
          const audio = audioRef.current;
          if (!audio) return;
          audio.currentTime = Number(event.currentTarget.value);
          setElapsed(audio.currentTime);
        }} />{time}</div> : null}
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        preload={preload}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => updateDuration(event.currentTarget)}
        onDurationChange={(event) => updateDuration(event.currentTarget)}
        onEmptied={() => { setElapsed(0); setMediaDuration(null); setPlaying(false); }}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        hidden
      />
    </Box>
  );
};

type SvgPath = string | { d: string; fill?: string; stroke?: string; strokeWidth?: number };

const Svg: React.FC<{
  viewBox?: string;
  paths?: SvgPath[];
  width?: number | string;
  height?: number | string;
  size?: number | string;
  title?: string;
}> = ({ viewBox = "0 0 24 24", paths = [], width, height, size = 24, title }) => (
  <svg
    viewBox={viewBox}
    width={toCssSize(width ?? size)}
    height={toCssSize(height ?? size)}
    role={title ? "img" : "presentation"}
    aria-label={title}
  >
    {paths.map((path, index) =>
      typeof path === "string" ? (
        <path key={index} d={path} fill="currentColor" />
      ) : (
        <path
          key={index}
          d={path.d}
          fill={path.fill ?? "none"}
          stroke={path.stroke ?? "currentColor"}
          strokeWidth={path.strokeWidth ?? 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    )}
  </svg>
);

// Templates are authored by a model, so `src` is untrusted input. An
// unconstrained iframe src lets a widget composite an arbitrary third-party
// page inside the host app — a ready-made phishing/clickjacking surface — so
// resolve every form down to an embed URL on a YouTube origin, or render
// nothing. Watch and youtu.be links are converted rather than rejected because
// models emit them constantly.
const YOUTUBE_EMBED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com"
]);

function toEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
}

function resolveYouTubeEmbedSrc(src?: string, videoId?: string) {
  if (!src) return videoId ? toEmbedUrl(videoId) : "";

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return "";
  }

  if (url.protocol !== "https:") return "";

  if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
    const shortId = url.pathname.slice(1);
    return shortId ? toEmbedUrl(shortId) : "";
  }

  if (!YOUTUBE_EMBED_HOSTS.has(url.hostname)) return "";

  // Already an embed URL: keep it as-is so player params (start, autoplay,
  // the nocookie origin) survive.
  if (url.pathname.startsWith("/embed/")) return url.toString();

  const watchId = url.searchParams.get("v");
  return watchId ? toEmbedUrl(watchId) : "";
}

const YouTubeEmbed: React.FC<{ videoId?: string; src?: string; title?: string; height?: number | string; aspectRatio?: number | string }> = ({
  videoId,
  src,
  title = "YouTube video",
  height = 220,
  aspectRatio
}) => {
  const embedSrc = resolveYouTubeEmbedSrc(src, videoId);
  if (!embedSrc) return null;
  return (
    <iframe
      src={embedSrc}
      title={title}
      className="w-full rounded-xl border"
      style={{ height: aspectRatio === undefined ? toCssSize(height) : undefined, aspectRatio, borderColor: "var(--widget-border-default)" }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      // allow-same-origin is safe here only because the frame is always a
      // cross-origin YouTube document; the pair would be an escape hatch if the
      // host allowlist ever admitted a same-origin URL.
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      allowFullScreen
    />
  );
};

type MapPoint = { latitude: number; longitude: number; label?: string; color?: string; style?: "dot" | "pin" };
type MapRoute = { coordinates: [number, number][]; color?: string };

const Map: React.FC<{
  markers?: MapPoint[];
  routes?: MapRoute[];
  height?: number | string;
  width?: number | string;
  radius?: RadiusValue;
  frame?: boolean;
  background?: string | ThemeColor;
}> = ({ markers = [], routes = [], height = 220, width = "100%", radius = "lg", frame = true, background = "surface-secondary" }) => {
  const theme = useWidgetTheme();
  const points = [
    ...markers.map((marker) => [marker.longitude, marker.latitude] as [number, number]),
    ...routes.flatMap((route) => route.coordinates)
  ];
  const longs = points.map(([longitude]) => longitude);
  const lats = points.map(([, latitude]) => latitude);
  const minLong = Math.min(...longs, -122.52);
  const maxLong = Math.max(...longs, -122.35);
  const minLat = Math.min(...lats, 37.7);
  const maxLat = Math.max(...lats, 37.82);
  const xFor = (longitude: number) => ((longitude - minLong) / Math.max(maxLong - minLong, 0.01)) * 84 + 8;
  const yFor = (latitude: number) => (1 - (latitude - minLat) / Math.max(maxLat - minLat, 0.01)) * 74 + 13;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: toCssSize(height),
        width: toCssSize(width),
        borderRadius: resolveRadius(radius),
        border: frame ? "1px solid var(--widget-border-default)" : undefined,
        background: resolveColor(background, theme)
      }}
    >
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px), linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
      {/* viewBox 0-100 + preserveAspectRatio="none" keeps route coordinates in the
          same percentage space markers use, so routes and pins stay aligned. */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {routes.map((route, index) => (
          <polyline
            key={index}
            points={route.coordinates.map(([longitude, latitude]) => `${xFor(longitude)},${yFor(latitude)}`).join(" ")}
            fill="none"
            stroke={route.color ?? "var(--widget-accent)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {markers.map((marker, index) => (
        <div
          key={index}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${xFor(marker.longitude)}%`, top: `${yFor(marker.latitude)}%`, color: marker.color ?? "#dc2626" }}
          title={marker.label}
        >
          {marker.style === "dot" ? (
            <span className="block h-3 w-3 rounded-full border-2 border-white bg-current shadow" />
          ) : (
            <MapPin size={24} fill="currentColor" className="drop-shadow" />
          )}
        </div>
      ))}
    </div>
  );
};

// Models often quote numeric props (`columns="3"`), which would emit invalid
// CSS like `grid-template-columns: 3`; coerce bare numeric strings.
function toTrackCount(value: number | string | undefined) {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return value;
}

const Grid: React.FC<ChildrenProps & {
  minChildWidth?: number;
  rows?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  columns?: number | string;
  gap?: number | string;
  padding?: number | string | Padding;
  onVisibleAction?: ActionConfig;
}> = ({ children, columns = 2, gap = 2, padding, onVisibleAction, minChildWidth, rows, rowGap, columnGap }) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const resolvedColumns = toTrackCount(columns);
  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: minChildWidth !== undefined ? `repeat(auto-fit, minmax(min(100%, ${minChildWidth}px), 1fr))` :
      typeof resolvedColumns === "number"
        ? `repeat(${resolvedColumns}, minmax(0, 1fr))`
        : resolvedColumns,
    // Fill the parent: `repeat(auto-fit, ...)` templates collapse to one
    // column when the grid is sized by its contents (e.g. inside centered
    // flex parents).
    width: "100%",
    gap: resolveGap(gap),
    ...(rowGap != null ? { rowGap: resolveGap(rowGap) } : {}),
    ...(columnGap != null ? { columnGap: resolveGap(columnGap) } : {}),
    ...(rows != null ? { gridTemplateRows: typeof rows === "number" ? `repeat(${rows}, auto)` : rows } : {})
  };
  applyPadding(style, padding);
  return <div ref={ref} style={style}>{children}</div>;
};

const GridItem: React.FC<ChildrenProps & { span?: number; columnSpan?: number; colSpan?: number; rowSpan?: number; padding?: number | string | Padding; background?: string | ThemeColor; radius?: RadiusValue }> = ({
  children,
  span,
  columnSpan,
  colSpan,
  rowSpan,
  padding,
  background,
  radius
}) => {
  const theme = useWidgetTheme();
  const resolvedColumnSpan = span ?? columnSpan ?? colSpan;
  const style: React.CSSProperties = {
    gridColumn: resolvedColumnSpan ? `span ${resolvedColumnSpan}` : undefined,
    gridRow: rowSpan ? `span ${rowSpan}` : undefined,
    background: background ? resolveColor(background, theme) : undefined,
    borderRadius: resolveRadius(radius)
  };
  applyPadding(style, padding);
  return <div style={style}>{children}</div>;
};

const Flow: React.FC<ChildrenProps & {
  gap?: number | string;
  columns?: number | string;
  rows?: number | string;
  layout?: "wrap" | "grid" | "fixed";
  galleryImages?: MediaImageData[];
  onVisibleAction?: ActionConfig;
}> = ({
  children,
  gap = 2,
  columns,
  rows,
  layout = "wrap",
  onVisibleAction
}) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const resolvedColumns = toTrackCount(columns);
  const resolvedRows = toTrackCount(rows);
  const style: React.CSSProperties =
    layout === "grid" || columns || rows
      ? {
          display: "grid",
          gridTemplateColumns:
            typeof resolvedColumns === "number"
              ? `repeat(${resolvedColumns}, minmax(0, 1fr))`
              : resolvedColumns,
          gridTemplateRows:
            typeof resolvedRows === "number"
              ? `repeat(${resolvedRows}, minmax(0, auto))`
              : resolvedRows,
          gap: resolveGap(gap)
        }
      : { display: "flex", flexWrap: layout === "fixed" ? "nowrap" : "wrap", gap: resolveGap(gap) };
  return <div ref={ref} style={style}>{children}</div>;
};

const FlowItem: React.FC<ChildrenProps & { span?: number; basis?: number | string; grow?: number; onVisibleAction?: ActionConfig }> = ({
  children,
  span,
  basis,
  grow = 0,
  onVisibleAction
}) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  return (
    <div
      ref={ref}
      style={{
        flex: `${grow} 0 ${toCssSize(basis, "auto")}`,
        gridColumn: span ? `span ${span}` : undefined
      }}
    >
      {children}
    </div>
  );
};

const OVERFLOW_ROW_FALLBACK_HEIGHT = 36; // ~2.25rem per row: SSR / pre-measure clamp

const OverflowRow: React.FC<ChildrenProps & { rows?: number; gap?: number | string; onVisibleAction?: ActionConfig }> = ({
  children,
  rows = 1,
  gap = 2,
  onVisibleAction
}) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  // Start from a per-row estimate so server-rendered / pre-measure output is
  // still clamped, then clip at the measured bottom edge of the last allowed
  // row — a fixed guess alone slices through taller children (badges, chips)
  // and lets the next row peek through half-cut.
  const [maxHeight, setMaxHeight] = React.useState<number>(
    rows * OVERFLOW_ROW_FALLBACK_HEIGHT
  );

  useResizeObserver(ref, (node) => {
    const kids = Array.from(node.children) as HTMLElement[];
    if (kids.length === 0) return;
    const rowTops: number[] = [];
    for (const kid of kids) {
      const top = kid.offsetTop;
      if (!rowTops.some((existing) => Math.abs(existing - top) < 2)) {
        rowTops.push(top);
      }
    }
    rowTops.sort((a, b) => a - b);
    if (rowTops.length <= rows) {
      // Everything fits: clamp exactly at the content's own height.
      const contentBottom = Math.max(
        ...kids.map((kid) => kid.offsetTop + kid.offsetHeight)
      );
      setMaxHeight(contentBottom);
      return;
    }
    const firstHiddenTop = rowTops[rows];
    let lastVisibleBottom = 0;
    for (const kid of kids) {
      if (kid.offsetTop < firstHiddenTop - 1) {
        lastVisibleBottom = Math.max(lastVisibleBottom, kid.offsetTop + kid.offsetHeight);
      }
    }
    if (lastVisibleBottom > 0) setMaxHeight(lastVisibleBottom);
  });

  return (
    <div
      ref={ref}
      className="relative flex flex-wrap overflow-hidden"
      style={{ gap: resolveGap(gap), maxHeight }}
    >
      {children}
    </div>
  );
};

const Pressable: React.FC<ChildrenProps & {
  tooltip?: string;
  onClickAction: ActionConfig;
  onVisibleAction?: ActionConfig;
  disabled?: boolean;
  padding?: number | string | Padding;
  radius?: RadiusValue;
  background?: string | ThemeColor;
}> = ({ children, tooltip, onClickAction, onVisibleAction, disabled, padding, radius, background }) => {
  const action = useWidgetAction();
  const visibleRef = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    borderRadius: resolveRadius(radius),
    ...(background ? { background: resolveColor(background, theme) } : {})
  };
  applyPadding(style, padding);

  const control = (
    <div
      ref={visibleRef}
      role="button"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : 0}
      style={style}
      onClick={() => !disabled && action?.(onClickAction)}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          action?.(onClickAction);
        }
      }}
    >
      {children}
    </div>
  );
  return tooltip ? <TooltipProvider><Tooltip><TooltipTrigger asChild>{control}</TooltipTrigger><TooltipContent>{tooltip}</TooltipContent></Tooltip></TooltipProvider> : control;
};

type PopoverContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showOnHover?: boolean;
};
const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

const Popover: React.FC<ChildrenProps & { open?: boolean; showOnHover?: boolean; hoverOpenDelay?: number }> = ({
  children,
  open,
  showOnHover,
  hoverOpenDelay = 120
}) => {
  const [internalOpen, setOpen] = React.useState(Boolean(open));
  React.useEffect(() => {
    if (open !== undefined) setOpen(open);
  }, [open]);

  const timeoutRef = React.useRef<number | undefined>(undefined);
  const handlePointerEnter = () => {
    if (!showOnHover) return;
    timeoutRef.current = window.setTimeout(() => setOpen(true), hoverOpenDelay);
  };
  const handlePointerLeave = () => {
    if (!showOnHover) return;
    window.clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  return (
    <PopoverContext.Provider value={{ open: internalOpen, setOpen, showOnHover }}>
      <span className="relative inline-block" onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
        {children}
      </span>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger: React.FC<ChildrenProps & { onClickAction?: ActionConfig }> = ({ children, onClickAction }) => {
  const context = React.useContext(PopoverContext);
  const action = useWidgetAction();
  return (
    <span
      role="button"
      tabIndex={0}
      className="inline-flex cursor-pointer"
      onClick={() => {
        context?.setOpen((prev) => !prev);
        if (onClickAction) action?.(onClickAction);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          context?.setOpen((prev) => !prev);
          if (onClickAction) action?.(onClickAction);
        }
      }}
    >
      {children}
    </span>
  );
};

const PopoverContent: React.FC<ChildrenProps & { side?: "top" | "bottom" | "left" | "right"; align?: "start" | "center" | "end"; showCloseButton?: boolean; sideOffset?: number; width?: number | string }> = ({
  children,
  side = "bottom",
  align = "center",
  showCloseButton,
  sideOffset = 8,
  width = 260
}) => {
  const context = React.useContext(PopoverContext);
  if (!context?.open) return null;
  const position: React.CSSProperties = {
    width: toCssSize(width),
    ...(side === "bottom" ? { top: `calc(100% + ${sideOffset}px)` } : side === "top" ? { bottom: `calc(100% + ${sideOffset}px)` } : { top: "50%" }),
    ...(side === "right" ? { left: `calc(100% + ${sideOffset}px)` } : align === "start" ? { left: 0 } : align === "end" ? {} : { left: "50%" }),
    ...(side === "left" ? { right: `calc(100% + ${sideOffset}px)` } : align === "end" ? { right: 0 } : {}),
    ...(side === "left" || side === "right" ? { transform: "translateY(-50%)" } : align === "center" ? { transform: "translateX(-50%)" } : {})
  };
  return (
    <span
      className="absolute z-50 block rounded-xl border p-3 text-left"
      style={{
        ...position,
        ...(showCloseButton ? { paddingRight: "2.5rem" } : {}),
        borderColor: "var(--widget-border-default)",
        background: "var(--widget-surface-elevated)",
        boxShadow: "var(--widget-shadow-lg)"
      }}
    >
      {showCloseButton ? <button type="button" className="wg-btn wg-popover-close" data-variant="ghost" data-color="secondary" aria-label="Close" onClick={() => context.setOpen(false)}><Icon name="x" size="sm" color="currentColor" /></button> : null}
      {children}
    </span>
  );
};

type ListContextValue = { marker?: React.ReactNode | string; connector?: "none" | "solid"; maxMarkerSize?: "md" | "lg" | "xl" };
const ListContext = React.createContext<ListContextValue | undefined>(undefined);
const listStyleMarkerTokens = new Set(["disc", "circle", "square", "decimal", "none"]);
const widgetIconMarkerTokens = new Set<string>(iconNames);

function isWidgetIconMarker(value: string): value is WidgetIcon {
  return widgetIconMarkerTokens.has(value);
}

function isInternalListMarker(marker: React.ReactNode | string) {
  if (typeof marker !== "string") return false;
  const token = marker.trim();
  return listStyleMarkerTokens.has(token) || isWidgetIconMarker(token);
}

function renderListMarker(marker: React.ReactNode | string) {
  if (typeof marker !== "string") return marker;

  const token = marker.trim();
  if (!token) return null;

  if (listStyleMarkerTokens.has(token)) {
    switch (token) {
      case "disc":
        return <span className="block h-1.5 w-1.5 rounded-full bg-current" />;
      case "circle":
        return <span className="block h-2 w-2 rounded-full border border-current" />;
      case "square":
        return <span className="block h-1.5 w-1.5 rounded-sm bg-current" />;
      case "decimal":
        return <span className="widget-list-counter" />;
      case "none":
        return null;
      default:
        return null;
    }
  }

  if (isWidgetIconMarker(token)) {
    return <Icon name={token} size="sm" color="secondary" />;
  }

  return marker;
}

const List: React.FC<ChildrenProps & { start?: number; marker?: string; connector?: "none" | "solid"; gap?: number | string; maxMarkerSize?: "md" | "lg" | "xl" }> = ({
  children,
  marker = "disc",
  start = 1,
  connector = "none",
  gap = 2,
  maxMarkerSize = "md"
}) => (
  <ListContext.Provider value={{ marker, connector, maxMarkerSize }}>
    <div className="widget-list flex flex-col" style={{ gap: resolveGap(gap), ...(marker === "decimal" ? { counterReset: `widget-list-item ${start - 1}` } : {}) }}>{children}</div>
  </ListContext.Provider>
);

const ListItem: React.FC<ChildrenProps & { label?: string; description?: string; disabled?: boolean; marker?: React.ReactNode | string; onVisibleAction?: ActionConfig }> = ({
  children,
  label,
  description,
  disabled,
  marker,
  onVisibleAction
}) => {
  const context = React.useContext(ListContext);
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const resolvedMarker = marker ?? context?.marker ?? "disc";
  const renderedMarker = renderListMarker(resolvedMarker);
  const hasMarker = renderedMarker != null && renderedMarker !== false;
  return (
    <div ref={ref} aria-disabled={disabled || undefined} className={`wg-list-item widget-list-item grid ${hasMarker ? "grid-cols-[1.5rem_minmax(0,1fr)] gap-2" : "grid-cols-1"}`}>
      {hasMarker ? <span
        aria-hidden={isInternalListMarker(resolvedMarker) ? true : undefined}
        className="flex h-6 items-center justify-center text-sm"
        style={{ color: "var(--widget-text-tertiary)" }}
      >
        {renderedMarker}
      </span> : null}
      <div>{label !== undefined ? <div className="wg-list-label">{label}</div> : null}{description !== undefined ? <div className="wg-list-description">{description}</div> : null}{children}</div>
    </div>
  );
};

const TableContext = React.createContext<{ columnCount: number }>({ columnCount: 1 });

function countTableCellSpan(cell: React.ReactNode) {
  if (!React.isValidElement(cell)) return 1;
  const cellProps = cell.props as { columnSpan?: unknown; colSpan?: unknown };
  const props = { columnSpan: cellProps.columnSpan ?? cellProps.colSpan };
  const span =
    typeof props.columnSpan === "number"
      ? props.columnSpan
      : typeof props.columnSpan === "string"
      ? Number(props.columnSpan)
      : undefined;

  return typeof span === "number" && Number.isFinite(span)
    ? Math.max(1, span)
    : 1;
}

function countTableColumns(children: React.ReactNode): number {
  return React.Children.toArray(children).reduce<number>((maxColumns, child) => {
    if (!React.isValidElement(child)) return maxColumns;

    const componentName = (child.type as { displayName?: string }).displayName;
    const props = child.props as ChildrenProps & { label?: string };

    if (componentName === "Table.Row") {
      const labelColumn = props.label ? 1 : 0;
      const childColumns = React.Children.toArray(props.children).reduce<number>(
        (total, cell) => total + countTableCellSpan(cell),
        labelColumn
      );
      return Math.max(maxColumns, childColumns);
    }

    if (componentName === "Table.Section") {
      return Math.max(maxColumns, countTableColumns(props.children));
    }

    return Math.max(maxColumns, countTableColumns(props.children));
  }, 0);
}

function hasTableBodyRows(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some(child => {
    if (!React.isValidElement(child)) return false;
    const props = child.props as ChildrenProps & { header?: boolean };
    if ((child.type as { displayName?: string }).displayName === "Table.Row") return !props.header;
    return hasTableBodyRows(props.children);
  });
}

// Lift leading header rows into a single thead so multiple rows stick together.
function flattenTableRows(children: React.ReactNode, columnCount: number, prefix = "table"): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child, index) => {
    if (!React.isValidElement<ChildrenProps & { label?: string }>(child)) return [child];
    const key = `${prefix}/${child.key ?? index}`;
    if (child.type === React.Fragment) return flattenTableRows(child.props.children, columnCount, key);
    if (child.type === TableSection) {
      const heading = child.props.label ? <TableRow key={`${key}/label`} header><TableCell header columnSpan={columnCount}><Caption value={child.props.label} weight="semibold" /></TableCell></TableRow> : null;
      return [heading, ...flattenTableRows(child.props.children, columnCount, key)].filter(Boolean);
    }
    return [React.cloneElement(child, { key })];
  });
}

const Table: React.FC<ChildrenProps & { columnSizing?: "auto" | "equal"; rowDivider?: number | Border; stickyHeader?: boolean; maxHeight?: number; dividers?: boolean; emptyLabel?: string }> = ({
  children, columnSizing = "auto", stickyHeader, maxHeight, dividers = true, emptyLabel
}) => {
  const columnCount = Math.max(1, countTableColumns(children));
  const rows = flattenTableRows(children, columnCount);
  const firstBody = rows.findIndex(child => !React.isValidElement<{ header?: boolean }>(child) || !child.props.header);
  const headerCount = firstBody === -1 ? rows.length : firstBody;
  return (
    <TableContext.Provider value={{ columnCount }}>
      <div className="wg-scrollable wg-table-scroll" style={{ ...(maxHeight != null ? { maxHeight } : {}) }}>
        <table className="wg-table w-full border-collapse text-sm" data-sticky-header={stickyHeader || undefined} data-dividers={dividers} style={{ tableLayout: columnSizing === "equal" ? "fixed" : "auto" }}>
          {headerCount > 0 ? <thead>{rows.slice(0, headerCount)}</thead> : null}
          <tbody>{rows.slice(headerCount)}{emptyLabel !== undefined && !hasTableBodyRows(children) ? <tr><td colSpan={columnCount} className="wg-table-empty">{emptyLabel}</td></tr> : null}</tbody>
        </table>
      </div>
    </TableContext.Provider>
  );
};

const TableRow: React.FC<ChildrenProps & { header?: boolean; label?: string }> = ({ children, header, label }) => {
  const cells = React.Children.toArray(children);
  return (
    <tr
      data-header={header || undefined}
      className="border-b last:border-0"
      style={{ borderColor: "var(--widget-border-subtle)" }}
    >
      {label ? (
        <TableCell header={header}>
          <Text value={label} weight={header ? "semibold" : "normal"} />
        </TableCell>
      ) : null}
      {cells}
    </tr>
  );
};
TableRow.displayName = "Table.Row";

const TableCell: React.FC<ChildrenProps & { align?: "start" | "center" | "end"; header?: boolean; columnSpan?: number; colSpan?: number; rowSpan?: number; vAlign?: "top" | "middle" | "bottom"; width?: number | string }> = ({
  children,
  align = "start",
  header,
  columnSpan,
  colSpan,
  rowSpan,
  vAlign,
  width
}) => {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      colSpan={columnSpan ?? colSpan}
      rowSpan={rowSpan}
      className="px-2 py-2"
      style={{ ...(width != null ? { width } : {}), ...(vAlign != null ? { verticalAlign: vAlign } : {}), textAlign: align === "start" ? "left" : align === "end" ? "right" : "center" }}
    >
      {children}
    </Tag>
  );
};
TableCell.displayName = "Table.Cell";

const TableSection: React.FC<ChildrenProps & { label?: string }> = ({ children, label }) => {
  const { columnCount } = React.useContext(TableContext);

  return (
    <>
      {label ? (
        <TableRow>
          <TableCell columnSpan={columnCount}>
            <Caption value={label} weight="semibold" />
          </TableCell>
        </TableRow>
      ) : null}
      {children}
    </>
  );
};
TableSection.displayName = "Table.Section";

const SegmentedControl: React.FC<{
  name?: string;
  bind?: string;
  options: { label: string; value: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  onChangeAction?: ActionConfig;
  ariaLabel?: string;
  block?: boolean;
  disabled?: boolean;
  pill?: boolean;
  size?: ControlSize;
  textSize?: TextSize;
  variant?: "default" | "ghost";
}> = ({ name: explicitName, bind, options, value, defaultValue, onChangeAction, ariaLabel, block, disabled, pill, size = "md", textSize = "sm", variant = "default" }) => {
  const action = useWidgetAction();
  const [selected, setSelected, name] = useControlValue({ name: explicitName, bind, value, defaultValue: defaultValue ?? options[0]?.value, fallback: "" });
  const height = controlHeights[size] ?? controlHeights.md;

  return (
    <div
      id={fieldId(name)}
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      className="wg-segmented-control inline-flex gap-1 rounded-xl p-1"
      style={{
        width: block ? "100%" : "fit-content",
        maxWidth: "100%",
        borderRadius: pill ? "999px" : "12px",
        background: variant === "ghost" ? "transparent" : "var(--widget-surface-secondary)"
      }}
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled || option.disabled}
            className="cursor-pointer whitespace-nowrap px-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              height,
              flex: block ? 1 : undefined,
              borderRadius: pill ? "999px" : "9px",
              fontSize: textSizeToCss(textSize),
              background: active ? "var(--widget-accent)" : "transparent",
              color: active ? "var(--widget-on-accent)" : "var(--widget-text-secondary)",
              boxShadow: active && variant !== "ghost" ? "var(--widget-shadow-xs)" : undefined
            }}
            onClick={() => {
              setSelected(option.value);
              if (onChangeAction && action) {
                action(onChangeAction, buildChangePayload(name, option.value, { option }));
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

const RunInterval: React.FC<ChildrenProps & { interval?: number; intervalMs?: number; onTickAction?: ActionConfig; enabled?: boolean }> = ({
  children,
  interval,
  intervalMs = 1000,
  onTickAction,
  enabled = true
}) => {
  const action = useActionHandler(onTickAction);
  const countRef = React.useRef(0);
  const startedRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number | null>(null);
  const resolvedIntervalMs = interval ?? intervalMs;
  const actionRef = React.useRef(action);
  const hasTickAction = Boolean(onTickAction);

  React.useEffect(() => {
    actionRef.current = action;
  }, [action]);

  React.useEffect(() => {
    if (!enabled || !hasTickAction) return;
    const startedAt = Date.now();
    countRef.current = 0;
    startedRef.current = startedAt;
    lastRef.current = startedAt;
    const id = window.setInterval(() => {
      const now = Date.now();
      const lastTickAt = lastRef.current ?? now;
      const startedAt = startedRef.current ?? now;
      countRef.current += 1;
      actionRef.current?.({
        cause: "system",
        tick: {
          now,
          count: countRef.current,
          deltaMs: now - lastTickAt,
          elapsedMs: now - startedAt,
          intervalMs: resolvedIntervalMs
        }
      });
      lastRef.current = now;
    }, resolvedIntervalMs);
    return () => window.clearInterval(id);
  }, [enabled, hasTickAction, resolvedIntervalMs]);

  return <>{children}</>;
};

const Scope: React.FC<ChildrenProps> = ({ children }) => <>{children}</>;
const Each: React.FC<ChildrenProps> = ({ children }) => <>{children}</>;
const Show: React.FC<ChildrenProps> = ({ children }) => <>{children}</>;
const ShowElse: React.FC<ChildrenProps> = ({ children }) => <>{children}</>;

const Animate: React.FC<ChildrenProps> = ({ children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={React.Children.toArray(children).map((child) => (React.isValidElement(child) ? child.key : "child")).join("-")}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const AnimateItem: React.FC<ChildrenProps> = ({ children }) => <>{children}</>;

const AnimateGroup: React.FC<ChildrenProps> = ({ children }) => (
  <motion.div layout className="flex flex-col gap-2">
    <AnimatePresence initial={false}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={React.isValidElement(child) ? child.key ?? index : index}
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {child}
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
);

export {
  Animate,
  AnimateItem,
  AnimateGroup,
  AudioPlayer,
  BaseCarousel,
  BaseCarouselItem,
  BaseCarouselMediaItem,
  Bold,
  CardCarousel,
  CardLinkItem,
  Code,
  CotResolvedIcon,
  Debug,
  Each,
  Favicon,
  Flow,
  FlowItem,
  FootballLocationIndicator,
  Grid,
  GridItem,
  Highlight,
  Inline,
  Italic,
  List,
  ListItem,
  LoadingBlock,
  LoadingDot,
  LoadingIndicator,
  Map,
  MathText as Math,
  OverflowRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Pressable,
  PulseIndicator,
  Response,
  RunInterval,
  Scope,
  SegmentedControl,
  ShimmerText,
  Show,
  ShowElse,
  Svg,
  Table,
  TableCell,
  TableRow,
  TableSection,
  Underline,
  YouTubeEmbed
};
