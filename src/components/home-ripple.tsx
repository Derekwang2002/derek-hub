"use client";

import { useEffect, useRef } from "react";
import { isSearchOpen, SEARCH_CHANGE_EVENT } from "./search-events";
import styles from "./home-ripple.module.css";

const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const duration = 4200;
const layers = [1, .66, .4];
const cellWidth = 11;
const cellHeight = 18;
const excludedTargets = [
  "a", "button", "input", "textarea", "select", "label", "summary",
  "[role=button]", "[role=dialog]", "[contenteditable]", "[tabindex]",
  "h1", "h2", "h3", "p", "pre", "figure", "img", "svg",
].join(",");

type Ripple = {
  started: number;
  speed: number;
  interval: number;
  samples: Float32Array;
};

const smoothstep = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** An idle canvas does no work; a tap briefly reveals a field of characters. */
export function HomeRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");
    const field = document.createElement("canvas");
    const fieldContext = field.getContext("2d");
    const mask = document.createElement("canvas");
    const maskContext = mask.getContext("2d");
    if (!context || !fieldContext || !maskContext) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let scale = 1;
    let theme = "";
    let palette: number[][] = [];
    let columns = 0;
    let rows = 0;
    let energy = new Float32Array(0);
    let occupied = new Uint8Array(0);
    let pixels: ImageData;
    let frame = 0;
    let ripples: Ripple[] = [];
    let press: { x: number; y: number; id: number } | null = null;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ripples = [];
      press = null;
      context.clearRect(0, 0, width, height);
    };

    const readPalette = () => {
      theme = document.documentElement.dataset.theme || "light";
      const style = getComputedStyle(canvas);
      palette = ["--ripple-crest", "--ripple-current", "--ripple-wake"].map(property =>
        style.getPropertyValue(property).trim().split(/\s+/).map(Number),
      );
    };

    const prepareField = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextScale = Math.min(window.devicePixelRatio || 1, 2);
      readPalette();
      if (width === nextWidth && height === nextHeight && scale === nextScale) return;
      width = nextWidth;
      height = nextHeight;
      scale = nextScale;
      for (const layer of [canvas, field]) {
        layer.width = Math.round(width * scale);
        layer.height = Math.round(height * scale);
      }
      for (const painter of [context, fieldContext]) painter.setTransform(scale, 0, 0, scale, 0, 0);
      columns = Math.ceil(width / cellWidth);
      rows = Math.ceil(height / cellHeight);
      mask.width = columns;
      mask.height = rows;
      pixels = maskContext.createImageData(columns, rows);
      energy = new Float32Array(columns * rows);
      occupied = new Uint8Array(columns * rows);
      fieldContext.font = '10px ui-monospace, "SFMono-Regular", Menlo, monospace';
      fieldContext.textBaseline = "middle";
      fieldContext.fillStyle = "white";
      // Stable glyphs keep the expanding wave calm rather than flashing randomly.
      for (let row = 0; row < rows; row++) {
        const y = row * cellHeight + cellHeight / 2;
        for (let column = 0; column < columns; column++) {
          const x = column * cellWidth + 3;
          const seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
          const noise = seed - Math.floor(seed);
          if (noise < .12) continue;
          occupied[row * columns + column] = 1;
          fieldContext.globalAlpha = .35 + noise * .45;
          fieldContext.fillText(characters[Math.floor(noise * characters.length)], x, y);
        }
      }
    };

    const draw = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      ripples = ripples.filter(ripple => now - ripple.started < duration);
      if (!ripples.length) return;
      if (theme !== (document.documentElement.dataset.theme || "light")) readPalette();
      energy.fill(0);
      for (const ripple of ripples) {
        const elapsed = (now - ripple.started) / 1000;
        const sway = Math.sin(elapsed * .75);
        const fronts = layers.flatMap((amplitude, layer) => {
          const age = elapsed - layer * ripple.interval;
          if (age <= 0) return [];
          const radius = ripple.speed * age;
          return [{
            radius,
            spread: (32 + age * 3.5) * Math.pow(.86, layer),
            // Cylindrical spreading and damping gradually dissipate the wave.
            strength: amplitude * smoothstep(age / .2)
              * Math.sqrt(160 / (160 + radius)) * Math.exp(-age * .14)
              * smoothstep((duration / 1000 - elapsed) / .9),
          }];
        });
        for (let index = 0; index < energy.length; index++) {
          if (!occupied[index]) continue;
          const sample = index * 4;
          const distance = ripple.samples[sample] + ripple.samples[sample + 1] * sway;
          const breadth = ripple.samples[sample + 2];
          const shade = ripple.samples[sample + 3];
          for (const front of fronts) {
            const offset = (distance - front.radius) / (front.spread * breadth);
            if (Math.abs(offset) > 3.5) continue;
            const squared = offset * offset;
            // A broad crest with soft shoulders and a shallow signed trough.
            // Sum the waves before mapping brightness so crossings stay smooth.
            const pulse = (1 - .3 * squared) * Math.exp(-.5 * squared);
            energy[index] += pulse * front.strength * shade;
          }
        }
      }
      pixels.data.fill(0);
      for (let index = 0; index < energy.length; index++) {
        const strength = Math.max(0, energy[index]);
        if (strength < .008) continue;
        const crest = Math.min(1, strength * 1.5);
        const hue = .5 + .5 * Math.sin(index % columns * .035 + Math.floor(index / columns) * .06);
        for (let channel = 0; channel < 3; channel++) {
          const wake = palette[2][channel] * hue + palette[1][channel] * (1 - hue);
          pixels.data[index * 4 + channel] = wake + (palette[0][channel] - wake) * crest;
        }
        // Smooth saturation bounds repeated clicks without a hard brightness jump.
        pixels.data[index * 4 + 3] = 255 * .42 * (1 - Math.exp(-strength * 2));
      }
      maskContext.putImageData(pixels, 0, 0);
      context.globalCompositeOperation = "source-over";
      context.drawImage(mask, 0, 0, columns * cellWidth, rows * cellHeight);
      context.globalCompositeOperation = "destination-in";
      context.drawImage(field, 0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(draw);
    };

    const pointerDown = (event: PointerEvent) => {
      press = event.isPrimary && event.button === 0
        ? { x: event.clientX, y: event.clientY, id: event.pointerId }
        : null;
    };
    const pointerMove = (event: PointerEvent) => {
      if (press && (event.pointerId !== press.id || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8)) press = null;
    };
    const click = (event: MouseEvent) => {
      const tap = press;
      press = null;
      if (!tap || event.detail === 0 || event.button !== 0 || event.defaultPrevented || reduced.matches || document.hidden || isSearchOpen()) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (!(event.target instanceof Element) || event.target.closest(excludedTargets)) return;
      if (window.getSelection()?.toString() || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 8) return;
      prepareField();
      const now = performance.now();
      const x = event.clientX;
      const y = event.clientY;
      const phase = Math.random() * Math.PI * 2;
      const shapePhase = Math.random() * Math.PI * 2;
      const samples = new Float32Array(energy.length * 4);
      // Cache a gently varying medium around the click. Every crest travels
      // through the same field; coordinates are unbounded, with no edge reflection.
      for (let index = 0; index < energy.length; index++) {
        if (!occupied[index]) continue;
        const dx = index % columns * cellWidth + cellWidth / 2 - x;
        const dy = Math.floor(index / columns) * cellHeight + cellHeight / 2 - y;
        const distance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) - phase;
        const sample = index * 4;
        // Spatial variation lets each crest change shape as it travels, instead
        // of expanding a fixed outline. Ease it in to keep the click origin still.
        const localBend = 30 * (1 - Math.exp(-distance / 160))
          * Math.sin(dx * .009 + phase) * Math.cos(dy * .007 + shapePhase);
        samples[sample] = distance * (1 + .038 * Math.sin(angle * 3 + shapePhase)
          + .012 * Math.sin(angle * 5 - shapePhase + distance * .004)) + localBend;
        samples[sample + 1] = distance * .024 * Math.sin(angle * 2 + shapePhase - distance * .006);
        samples[sample + 2] = 1 + .16 * Math.sin(angle * 3 + distance * .003 + shapePhase);
        samples[sample + 3] = .8 + .13 * Math.sin(angle * 2 + shapePhase)
          + .07 * Math.sin(angle * 5 - distance * .006);
      }
      ripples = [...ripples.slice(-5), {
        started: now,
        speed: 215 + Math.random() * 20,
        interval: .42 + Math.random() * .04,
        samples,
      }];
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const cancelPress = () => { press = null; };
    const visibility = () => { if (document.hidden) clear(); };
    const searchChange = () => { if (isSearchOpen()) clear(); };

    window.addEventListener("pointerdown", pointerDown, { passive: true });
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointercancel", cancelPress);
    window.addEventListener("scroll", cancelPress, { passive: true });
    window.addEventListener("click", click);
    window.addEventListener("resize", clear);
    window.addEventListener(SEARCH_CHANGE_EVENT, searchChange);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointercancel", cancelPress);
      window.removeEventListener("scroll", cancelPress);
      window.removeEventListener("click", click);
      window.removeEventListener("resize", clear);
      window.removeEventListener(SEARCH_CHANGE_EVENT, searchChange);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", clear);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.ripple} aria-hidden="true" />;
}
