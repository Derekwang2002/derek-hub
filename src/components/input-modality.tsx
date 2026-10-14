"use client";
import { useEffect } from "react";

export function InputModality() {
  useEffect(() => {
    const update = (event: PointerEvent) => { document.documentElement.dataset.input = event.pointerType === "mouse" ? "mouse" : "touch"; };
    document.addEventListener("pointerdown", update, { passive: true, capture: true });
    document.addEventListener("pointermove", update, { passive: true, capture: true });
    return () => { document.removeEventListener("pointerdown", update, true); document.removeEventListener("pointermove", update, true); };
  }, []);
  return null;
}
