"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const MAX_TILT_X_DEG = 12;
const MAX_TILT_Y_DEG = 16;
const FOLLOW_STIFFNESS = 120;
const FOLLOW_DAMPING = 18;
const RETURN_STIFFNESS = 40;
const RETURN_DAMPING = 10;
const SETTLE_THRESHOLD = 0.02;

export function AvatarTilt({ children, className }: { children: ReactNode; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const hoveringRef = useRef(false);
  const tiltRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    enabledRef.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  function startLoop() {
    if (animationRef.current !== null) return;
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(step);
  }

  function step(now: number) {
    const frame = frameRef.current;
    if (!frame) {
      animationRef.current = null;
      return;
    }

    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.032);
    lastTimeRef.current = now;

    const stiffness = hoveringRef.current ? FOLLOW_STIFFNESS : RETURN_STIFFNESS;
    const damping = hoveringRef.current ? FOLLOW_DAMPING : RETURN_DAMPING;
    const { x, y } = tiltRef.current;
    const { x: targetX, y: targetY } = targetRef.current;
    const velocity = velocityRef.current;

    velocity.x += (-stiffness * (x - targetX) - damping * velocity.x) * dt;
    velocity.y += (-stiffness * (y - targetY) - damping * velocity.y) * dt;
    const nextX = x + velocity.x * dt;
    const nextY = y + velocity.y * dt;

    const settled =
      Math.abs(nextX - targetX) < SETTLE_THRESHOLD &&
      Math.abs(nextY - targetY) < SETTLE_THRESHOLD &&
      Math.abs(velocity.x) < SETTLE_THRESHOLD &&
      Math.abs(velocity.y) < SETTLE_THRESHOLD;

    if (settled && !hoveringRef.current) {
      animationRef.current = null;
      tiltRef.current = { x: 0, y: 0 };
      velocityRef.current = { x: 0, y: 0 };
      frame.style.transform = "";
      return;
    }

    tiltRef.current = { x: nextX, y: nextY };
    frame.style.transform = `perspective(380px) rotateX(${nextX.toFixed(2)}deg) rotateY(${nextY.toFixed(2)}deg)`;
    animationRef.current = requestAnimationFrame(step);
  }

  function handlePointerEnter() {
    if (!enabledRef.current) return;
    hoveringRef.current = true;
    startLoop();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame || !enabledRef.current) return;
    const rect = frame.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    targetRef.current = {
      x: -offsetY * 2 * MAX_TILT_X_DEG,
      y: offsetX * 2 * MAX_TILT_Y_DEG
    };
  }

  function handlePointerLeave() {
    if (!enabledRef.current) return;
    hoveringRef.current = false;
    targetRef.current = { x: 0, y: 0 };
    startLoop();
  }

  return (
    <div ref={frameRef} className={className} onPointerEnter={handlePointerEnter} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {children}
    </div>
  );
}
