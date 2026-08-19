"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const MAX_TILT_X_DEG = 12;
const MAX_TILT_Y_DEG = 16;

export function AvatarTilt({ children, className }: { children: ReactNode; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame || !enabledRef.current) return;
    const rect = frame.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = (-offsetY * 2 * MAX_TILT_X_DEG).toFixed(2);
    const rotateY = (offsetX * 2 * MAX_TILT_Y_DEG).toFixed(2);
    frame.style.transform = `perspective(380px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function handlePointerEnter() {
    const frame = frameRef.current;
    if (frame && enabledRef.current) frame.style.transition = "transform 120ms ease-out";
  }

  function handlePointerLeave() {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.transition = "";
    frame.style.transform = "";
  }

  return (
    <div ref={frameRef} className={className} onPointerEnter={handlePointerEnter} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {children}
    </div>
  );
}
