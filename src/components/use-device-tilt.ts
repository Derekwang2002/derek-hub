"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function useDeviceTilt(frame: RefObject<HTMLElement | null>) {
  const [permission, setPermission] = useState<"hidden" | "prompt" | "granted" | "denied">("hidden");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    if (window.isSecureContext && "DeviceOrientationEvent" in window && matchMedia("(any-pointer: coarse)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPermission((DeviceOrientationEvent as OrientationAPI).requestPermission ? "prompt" : "granted");
    }
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (permission !== "granted" || !frame.current) return;
    const element = frame.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let baseline: { beta: number; gamma: number } | null = null;
    let raf = 0;
    let x = 0, y = 0;
    const reset = () => {
      baseline = null; cancelAnimationFrame(raf); raf = 0;
      element.style.removeProperty("--code-x"); element.style.removeProperty("--code-y");
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) reset(); }, { threshold: .15 });
    observer.observe(element);
    const orient = (event: DeviceOrientationEvent) => {
      if (!visible || document.hidden || reduced.matches || event.beta === null || event.gamma === null) return;
      if (!baseline) baseline = { beta: event.beta, gamma: event.gamma };
      const beta = ((event.beta - baseline.beta + 540) % 360) - 180;
      const gamma = event.gamma - baseline.gamma;
      const angle = (screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0) * Math.PI / 180;
      x = Math.max(-5, Math.min(5, -(beta * Math.cos(angle) + gamma * Math.sin(angle)) * .23));
      y = Math.max(-7, Math.min(7, (gamma * Math.cos(angle) - beta * Math.sin(angle)) * .3));
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0; element.style.setProperty("--code-x", `${x.toFixed(2)}deg`); element.style.setProperty("--code-y", `${y.toFixed(2)}deg`);
      });
    };
    window.addEventListener("deviceorientation", orient);
    document.addEventListener("visibilitychange", reset);
    screen.orientation?.addEventListener("change", reset);
    window.addEventListener("orientationchange", reset);
    reduced.addEventListener("change", reset);
    return () => {
      reset(); observer.disconnect(); window.removeEventListener("deviceorientation", orient);
      document.removeEventListener("visibilitychange", reset); screen.orientation?.removeEventListener("change", reset); window.removeEventListener("orientationchange", reset); reduced.removeEventListener("change", reset);
    };
  }, [permission, frame]);

  async function enable() {
    try {
      const result = await (DeviceOrientationEvent as OrientationAPI).requestPermission?.();
      if (alive.current) setPermission(result === "denied" ? "denied" : "granted");
    } catch { if (alive.current) setPermission("denied"); }
  }
  return { permission, enable };
}
