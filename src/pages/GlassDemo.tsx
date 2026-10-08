import { useCallback, useEffect, useMemo, useState } from "react";
import { GlassPreview } from "@/components/glass/GlassPreview";
import { WidgetRenderer } from "@/widget";
import type { ActionConfig } from "@/widget";
import "./glass-demo-page.css";

const weatherTemplate = `
<Card size="full" gap={4} padding={5}>
  <Row align="start" justify="between">
    <Col gap={0}><Title value="San Francisco" size="sm" /><Caption value="A little room to breathe" /></Col>
    <Icon name="sun" size="xl" />
  </Row>
  <Row align="baseline" gap={3}>
    <Title value="21°" size="5xl" />
    <Col gap={0}><Text value="Mostly sunny" size="sm" /><Caption value="H 23° · L 16°" /></Col>
  </Row>
  <Row gap={2}>
    <Each $of="hours" item="hour">
      <Box flex={1} padding={{ y: 3 }} radius="lg" background="surface" align="center" gap={2}>
        <Caption value={hour.time} size="sm" />
        <Icon name={hour.icon} size="md" />
        <Text value={hour.temp} size="sm" weight="semibold" />
      </Box>
    </Each>
  </Row>
  <Button label={forecast ? "Hide forecast" : "Show tomorrow"} variant="outline" block onClickAction={{ type: "forecast.toggle" }} />
  <Text value={forecast ? "Tomorrow: 22°, sunshine from morning to evening." : "A good afternoon to take the long way home."} size="sm" color="secondary" />
</Card>`;

const musicTemplate = `
<Card size="full" gap={4} padding={5}>
  <Row justify="between" align="center"><Caption value="ON REPEAT" /><Icon name="music" size="md" /></Row>
  <Box background="surface" radius="lg" padding={4} gap={1}>
    <Title value="Soft Focus" size="lg" />
    <Text value="A soundtrack for slowing down" size="sm" color="secondary" />
  </Box>
  <Row align="center" justify="between" gap={3}>
    <Col gap={0}><Text value={playing ? "Demo playing" : "Ready when you are"} size="sm" weight="medium" /><Caption value="Interactive preview · no audio" /></Col>
    <Button label={playing ? "Pause" : "Play"} iconStart={playing ? "pause" : "play"} variant="outline" onClickAction={{ type: "music.toggle" }} />
  </Row>
</Card>`;

const focusTemplate = `
<Card size="full" gap={4} padding={5}>
  <Row justify="between" align="center"><Caption value="A MOMENT FOR YOU" /><Icon name="sparkle" size="md" /></Row>
  <Col gap={0}><Title value={focused ? "You're in." : "Find your flow."} size="lg" /><Text value={focused ? "Focus mode is on for this demo." : "One thing at a time. Everything else can wait."} size="sm" color="secondary" /></Col>
  <Button label={focused ? "End focus" : "Begin focus"} iconStart={focused ? "check" : "bolt"} variant="outline" block onClickAction={{ type: "focus.toggle" }} />
</Card>`;

const hours = [
  { time: "Now", icon: "sun", temp: "21°" },
  { time: "15:00", icon: "sun", temp: "23°" },
  { time: "18:00", icon: "cloud", temp: "20°" },
  { time: "21:00", icon: "moon", temp: "17°" }
];

const photoPresets = [
  { label: "Lake", id: "photo-1439066615861-d1af74d74000" },
  { label: "Landscape", id: "photo-1500530855697-b586d89ba3ee" },
  { label: "Japan", id: "photo-1493976040374-85c8e12f0c0e" }
].map((photo) => ({ ...photo, url: `https://images.unsplash.com/${photo.id}?auto=format&fit=crop&w=1600&q=85` }));

type PreviewStatus = "loading" | "ready" | "fallback" | "paused";

function ChoiceGroup<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="glass-demo-control">
      <legend>{label}</legend>
      <div className="glass-demo-segmented">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function GlassDemoPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [material, setMaterial] = useState<"regular" | "clear">("regular");
  const [backdrop, setBackdrop] = useState<"neutral" | "aurora" | "sunset">("aurora");
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(photoPresets[0].url);
  const [backgroundScroll, setBackgroundScroll] = useState(30);
  const [uploadedPhoto, setUploadedPhoto] = useState<{ url: string; name: string } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [refraction, setRefraction] = useState(40);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [forecast, setForecast] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [focused, setFocused] = useState(false);
  const [lastAction, setLastAction] = useState("Try a widget button. Everything here stays in the demo.");

  useEffect(() => () => {
    if (uploadedPhoto) URL.revokeObjectURL(uploadedPhoto.url);
  }, [uploadedPhoto]);

  const choosePhoto = (url: string) => {
    setBackgroundImage(url);
    setUploadedPhoto(null);
    setUploadError("");
  };

  const chooseColor = (value: "neutral" | "aurora" | "sunset") => {
    setBackdrop(value);
    setBackgroundImage(undefined);
    setUploadedPhoto(null);
    setUploadError("");
  };

  const weatherData = useMemo(() => ({ hours, forecast }), [forecast]);
  const musicData = useMemo(() => ({ playing }), [playing]);
  const focusData = useMemo(() => ({ focused }), [focused]);
  const onAction = useCallback((action: ActionConfig) => {
    if (action.type === "forecast.toggle") {
      setForecast((value) => !value);
      setLastAction("Weather forecast updated.");
    } else if (action.type === "music.toggle") {
      setPlaying((value) => !value);
      setLastAction("Playback preview toggled. This demo has no audio.");
    } else if (action.type === "focus.toggle") {
      setFocused((value) => !value);
      setLastAction("Focus mode toggled for this demo.");
    }
  }, []);

  const statusLabel = !enabled ? "CSS glass" : status === "ready" ? "Enhanced glass" : status === "loading" ? "Preparing glass…" : status === "paused" ? "Glass paused" : "CSS fallback";

  return (
    <div className="app-container glass-demo-page">
      <header className="glass-demo-heading">
        <div>
          <p className="glass-demo-eyebrow ff-mono">Material study / 01</p>
          <h1 className="ff-display">A little more depth.</h1>
        </div>
        <p>Real widgets, a new glass surface. Choose a photo, scroll it behind the widgets, and tune the material.</p>
      </header>

      <section className="glass-demo-controls" aria-label="Glass appearance controls">
        <ChoiceGroup label="Appearance" value={theme} onChange={setTheme} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        <ChoiceGroup label="Material" value={material} onChange={setMaterial} options={[{ value: "regular", label: "Regular" }, { value: "clear", label: "Clear" }]} />
        <div className="glass-demo-control glass-demo-refraction">
          <label htmlFor="glass-refraction">Refraction <output htmlFor="glass-refraction">{refraction}</output></label>
          <input id="glass-refraction" type="range" min={0} max={80} step={1} value={refraction} onChange={(event) => setRefraction(Number(event.target.value))} />
        </div>
        <label className="glass-demo-enhanced"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /><span>Enhanced glass</span></label>
      </section>

      <section className="glass-demo-controls glass-demo-background-controls" aria-label="Background controls">
        <fieldset className="glass-demo-control">
          <legend>Photos</legend>
          <div className="glass-demo-segmented">
            {photoPresets.map((photo) => <button key={photo.id} type="button" aria-pressed={backgroundImage === photo.url} onClick={() => choosePhoto(photo.url)}>{photo.label}</button>)}
          </div>
        </fieldset>
        <fieldset className="glass-demo-control">
          <legend>Colors</legend>
          <div className="glass-demo-segmented">
            {(["neutral", "aurora", "sunset"] as const).map((color) => <button key={color} type="button" aria-pressed={!backgroundImage && backdrop === color} onClick={() => chooseColor(color)}>{color[0].toUpperCase() + color.slice(1)}</button>)}
          </div>
        </fieldset>
        <label className="glass-demo-upload">
          <span>{uploadedPhoto ? "Change photo" : "Choose your photo"}</span>
          <input type="file" accept="image/*" aria-label="Choose background photo" onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
              setUploadError("Choose an image smaller than 12 MB.");
              return;
            }
            const url = URL.createObjectURL(file);
            setUploadedPhoto({ url, name: file.name });
            setBackgroundImage(url);
            setUploadError("");
          }} />
        </label>
        <div className="glass-demo-control glass-demo-refraction glass-demo-scroll-control">
          <label htmlFor="glass-background-scroll">Background scroll <output htmlFor="glass-background-scroll">{Math.round(backgroundScroll)}%</output></label>
          <input id="glass-background-scroll" type="range" min={0} max={100} step={1} disabled={!backgroundImage} value={backgroundScroll} onChange={(event) => setBackgroundScroll(Number(event.target.value))} />
        </div>
      </section>
      {uploadError && <p className="glass-demo-upload-error" role="alert">{uploadError}</p>}
      {uploadedPhoto && <p className="glass-demo-upload-name" title={uploadedPhoto.name}>{uploadedPhoto.name} · Used only in this browser</p>}

      <section aria-label="Interactive glass widget scene" className="glass-demo-exhibit">
        <div className="glass-demo-scene-meta ff-mono"><span>Live material preview</span><span className="glass-demo-status" data-ready={enabled && status === "ready"} role="status"><i aria-hidden="true" />{statusLabel}</span></div>
        <GlassPreview className="glass-demo-stage" theme={theme} enabled={enabled} material={material} refraction={refraction} backdrop={backdrop} backgroundImage={backgroundImage} backgroundScroll={backgroundScroll} onBackgroundScrollChange={setBackgroundScroll} onStatusChange={setStatus}
          onBackgroundImageError={() => {
            setBackgroundImage(undefined);
            setUploadedPhoto(null);
            setUploadError("This image could not be loaded. Showing colors instead; try another photo.");
          }}>
          <div className="glass-demo-widget-grid">
            <div className="glass-demo-weather"><WidgetRenderer template={weatherTemplate} data={weatherData} appearance="glass" theme={theme} onAction={onAction} /></div>
            <div className="glass-demo-small-widgets">
              <WidgetRenderer template={musicTemplate} data={musicData} appearance="glass" theme={theme} onAction={onAction} />
              <WidgetRenderer template={focusTemplate} data={focusData} appearance="glass" theme={theme} onAction={onAction} />
            </div>
          </div>
        </GlassPreview>
        <div className="glass-demo-footer"><p role="status" aria-live="polite">{lastAction}</p><span className="ff-mono">Sample content</span></div>
      </section>
      <p className="glass-demo-note">Scroll over the photo or use Background scroll to move it behind the fixed widgets. When enhanced glass is available, switch it off to compare. {backgroundImage && !uploadedPhoto && <a href={backgroundImage} target="_blank" rel="noreferrer">Photo from Unsplash ↗</a>}</p>
    </div>
  );
}
