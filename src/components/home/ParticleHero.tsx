import React from "react";
import { Pause, Play } from "lucide-react";
import {
  INITIAL_PARTICLE_FRAME, PARTICLE_COUNT, PARTICLE_FORMS, PARTICLE_LIGHTS,
  PARTICLE_LINKS, VIEW_SIZE, sampleParticleField
} from "./particleField";
import "./particle-hero.css";

const COLORS = ["#087ac4", "#1399f5", "#275b7c", "#1399f5", "#1399f5", "#ba5cd2", "#0d72b5", "#1399f5", "#309a73", "#086bb0", "#1399f5", "#ff5248"];
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => index);
const VIEW_INSET = 35;
const VISIBLE_SIZE = VIEW_SIZE - VIEW_INSET * 2;

export function ParticleHero() {
  const rootRef = React.useRef<HTMLElement>(null);
  const dotsRef = React.useRef<(SVGCircleElement | null)[]>([]);
  const lightsRef = React.useRef<(SVGCircleElement | null)[]>([]);
  const linksRef = React.useRef<(SVGLineElement | null)[]>([]);
  const timeRef = React.useRef(0);
  const pointerRef = React.useRef({ x: 0, y: 0, strength: 0 });
  const smoothPointerRef = React.useRef({ x: 0, y: 0, strength: 0 });
  const [paused, setPaused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [tabVisible, setTabVisible] = React.useState(true);
  const [form, setForm] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState<boolean | null>(null);
  const glowId = `particle-glow-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const running = visible && tabVisible && !paused && reducedMotion === false;

  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = typeof IntersectionObserver === "undefined" ? null
      : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (observer) observer.observe(node);
    else setVisible(true);
    const updateVisibility = () => setTabVisible(!document.hidden);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motionPreference.matches);
    updateVisibility();
    updateMotion();
    document.addEventListener("visibilitychange", updateVisibility);
    motionPreference.addEventListener("change", updateMotion);
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", updateVisibility); motionPreference.removeEventListener("change", updateMotion); };
  }, []);

  React.useEffect(() => {
    const buffer = new Float32Array(PARTICLE_COUNT * 4);
    if (reducedMotion) {
      timeRef.current = 0;
      pointerRef.current = { x: 0, y: 0, strength: 0 };
      smoothPointerRef.current = { x: 0, y: 0, strength: 0 };
    }
    let frame = 0, lastTime = 0, lastPaint = 0, label = -1;
    const paint = (time: number) => {
      const nextForm = sampleParticleField(time, smoothPointerRef.current, buffer);
      if (label !== nextForm) { label = nextForm; setForm(nextForm); }
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const node = dotsRef.current[i];
        if (!node) continue;
        const k = i * 4;
        node.style.transform = `translate(${buffer[k].toFixed(2)}px, ${buffer[k + 1].toFixed(2)}px) scale(${buffer[k + 2].toFixed(3)})`;
        node.style.opacity = buffer[k + 3].toFixed(3);
      }
      PARTICLE_LIGHTS.forEach((particle, index) => {
        const node = lightsRef.current[index];
        if (!node) return;
        const k = particle * 4;
        node.style.transform = `translate(${buffer[k].toFixed(2)}px, ${buffer[k + 1].toFixed(2)}px)`;
        node.style.opacity = (buffer[k + 3] * .32).toFixed(3);
      });
      PARTICLE_LINKS.forEach(([from, to], index) => {
        const node = linksRef.current[index];
        if (!node) return;
        const x = buffer[from * 4], y = buffer[from * 4 + 1];
        const dx = buffer[to * 4] - x, dy = buffer[to * 4 + 1] - y;
        const length = Math.hypot(dx, dy);
        node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${Math.atan2(dy, dx)}rad) scaleX(${Math.max(.001, length).toFixed(3)})`;
        node.style.opacity = (Math.max(0, 1 - length / 60) * .3).toFixed(3);
      });
    };
    paint(reducedMotion ? 0 : timeRef.current);
    if (!running) return;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now;
      timeRef.current += delta;
      const pointer = smoothPointerRef.current;
      const target = pointerRef.current;
      const blend = 1 - Math.exp(-delta * 5);
      pointer.x += (target.x - pointer.x) * blend;
      pointer.y += (target.y - pointer.y) * blend;
      pointer.strength += (target.strength - pointer.strength) * blend;
      // Bound DOM updates at 30fps; React only updates the stage caption.
      if (now - lastPaint < 1000 / 30) return;
      lastPaint = now;
      paint(timeRef.current);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reducedMotion]);

  const followPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "touch" || paused || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (event.clientX - rect.left) / rect.width * VISIBLE_SIZE - VISIBLE_SIZE / 2, y: (event.clientY - rect.top) / rect.height * VISIBLE_SIZE - VISIBLE_SIZE / 2, strength: 1 };
  };

  return (
    <figure ref={rootRef} className="hero-particles" data-running={running} aria-label="Particles assembling into changing interfaces">
      <svg viewBox={`${VIEW_INSET} ${VIEW_INSET} ${VISIBLE_SIZE} ${VISIBLE_SIZE}`} className="hero-particles-scene" aria-hidden="true"
        onPointerMove={followPointer} onPointerLeave={() => { pointerRef.current.strength = 0; }}>
        <defs>
          <filter id={glowId} filterUnits="userSpaceOnUse" x="0" y="0" width={VIEW_SIZE} height={VIEW_SIZE}><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        <g className="hero-particles-orbit" fill="none" stroke="currentColor" strokeWidth=".6">
          <ellipse cx="210" cy="210" rx="170" ry="142" strokeDasharray="2 10" />
          <path d="M210 27v9 M210 384v9 M27 210h9 M384 210h9" />
        </g>
        <g fill="none" stroke="#1399f5" strokeWidth=".75">
          {PARTICLE_LINKS.map((_, index) => <line key={index} ref={node => { linksRef.current[index] = node; }} x1="0" y1="0" x2="1" y2="0" vectorEffect="non-scaling-stroke" opacity="0" />)}
        </g>
        <g filter={`url(#${glowId})`}>
          {PARTICLE_LIGHTS.map((particle, index) => <circle key={particle} ref={node => { lightsRef.current[index] = node; }} r="5" fill={COLORS[particle % COLORS.length]} opacity="0" />)}
        </g>
        <g>
          {PARTICLES.map(index => <circle key={index} ref={node => { dotsRef.current[index] = node; }} r={index % 19 === 0 ? 2.6 : 1.8}
            fill={COLORS[index % COLORS.length]} style={{ transform: `translate(${INITIAL_PARTICLE_FRAME[index * 4]}px, ${INITIAL_PARTICLE_FRAME[index * 4 + 1]}px) scale(${INITIAL_PARTICLE_FRAME[index * 4 + 2]})`, opacity: INITIAL_PARTICLE_FRAME[index * 4 + 3] }} />)}
        </g>
      </svg>
      <figcaption className="hero-particles-caption">
        <span className="hero-particles-status" aria-hidden="true"><i />{PARTICLE_FORMS[form]}<span>{String(form + 1).padStart(2, "0")} / 04</span></span>
        {reducedMotion === false ? <button type="button" className="hero-particles-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume hero animation" : "Pause hero animation"}>
          {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
        </button> : null}
      </figcaption>
    </figure>
  );
}
