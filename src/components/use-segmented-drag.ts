"use client";

import { useEffect, useRef, type PointerEvent, type MouseEvent } from "react";

/** Drag the existing thumb; ordinary clicks and keyboard activation keep their behavior. */
export function useSegmentedDrag<T extends HTMLElement>(value: 0 | 1, commit: (value: 0 | 1) => void) {
  const drag = useRef<{ x: number; start: number; progress: number; travel: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const control = useRef<T | null>(null);
  useEffect(() => { control.current?.style.removeProperty("--toggle-position"); }, [value]);
  const reset = (element: T) => { delete element.dataset.dragging; element.style.removeProperty("--toggle-position"); };
  return {
    onPointerDown(event: PointerEvent<T>) {
      suppressClick.current = false;
      if (event.button !== 0 || !matchMedia("(min-width: 641px)").matches) return;
      const element = event.currentTarget;
      control.current = element;
      reset(element);
      drag.current = { x: event.clientX, start: value, progress: value, travel: Math.max(1, (element.getBoundingClientRect().width - 6) / 2), moved: false };
      element.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: PointerEvent<T>) {
      const state = drag.current;
      if (!state) return;
      const dx = event.clientX - state.x;
      if (Math.abs(dx) < 4 && !state.moved) return;
      state.moved = true;
      state.progress = Math.max(0, Math.min(1, state.start + dx / state.travel));
      event.currentTarget.dataset.dragging = "true";
      event.currentTarget.style.setProperty("--toggle-position", `${state.progress * 100}%`);
    },
    onPointerUp(event: PointerEvent<T>) {
      const state = drag.current; drag.current = null;
      reset(event.currentTarget);
      if (!state?.moved) return;
      suppressClick.current = true;
      const next = state.progress >= .5 ? 1 : 0;
      if (next !== value) { event.currentTarget.style.setProperty("--toggle-position", `${next * 100}%`); commit(next); }
    },
    onPointerCancel(event: PointerEvent<T>) { drag.current = null; suppressClick.current = true; reset(event.currentTarget); },
    onLostPointerCapture(event: PointerEvent<T>) { if (drag.current) { drag.current = null; reset(event.currentTarget); } },
    onClickCapture(event: MouseEvent<T>) {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
    onDragStart(event: MouseEvent<T>) { event.preventDefault(); },
  };
}
