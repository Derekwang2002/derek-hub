"use client";

import { useEffect, useRef } from "react";
import { base, styles, ProfileGroups } from "./shared";

export function SenseTerminal() {
  const scene = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const reflection = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = scene.current!;
    const hero = host.closest("main")!;
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let previousTime = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    const paint = () => {
      // One light direction controls all surfaces; text never moves independently.
      panel.current!.style.transform = `perspective(1200px) rotateX(${-y * 1.8}deg) rotateY(${x * 2.4}deg)`;
      reflection.current!.style.transform = `translate3d(${x * 100}px,${y * 35}px,0) rotate(-24deg)`;
      light.current!.style.transform = `translate3d(${x * 42}px,${y * 26}px,0)`;
      shadow.current!.style.transform = `translate3d(${-x * 16}px,${-y * 7}px,0)`;
    };
    const tick = (time: number) => {
      const dt = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const blend = 1 - Math.exp(-dt / 95);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .001;
      if (settled) { x = targetX; y = targetY; }
      paint();
      frame = settled ? 0 : requestAnimationFrame(tick);
    };
    const start = () => { if (!frame) { previousTime = 0; frame = requestAnimationFrame(tick); } };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      start();
    };
    const leave = () => { if (!media.matches) return; targetX = 0; targetY = 0; start(); };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      x = y = targetX = targetY = 0;
      [panel.current, reflection.current, light.current, shadow.current].forEach(el => el?.style.removeProperty("transform"));
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("pointercancel", reset);
    media.addEventListener("change", reset);
    window.addEventListener("blur", reset);
    return () => {
      reset();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointercancel", reset);
      media.removeEventListener("change", reset);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return <div className={styles.terminalScene} ref={scene}>
    <div ref={light} className={styles.ambientLight} aria-hidden="true" />
    <div ref={shadow} className={styles.contactShadow} aria-hidden="true" />
    <figure ref={panel} className={`${base.terminal} ${styles.senseTerminal}`} lang="en">
      <span className={styles.surfaceGrain} aria-hidden="true" />
      <span ref={reflection} className={styles.surfaceReflection} aria-hidden="true" />
      <figcaption className={base.windowBar}>
        <span className={base.windowDots} aria-hidden="true"><i /><i /><i /></span>
        <span>derek — zsh</span>
      </figcaption>
      <div className={`${base.terminalBody} ${styles.senseBody}`}><ProfileGroups /></div>
    </figure>
  </div>;
}
