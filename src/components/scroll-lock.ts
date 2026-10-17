// Multiple top-layer tools can overlap (for example, search opened from a TOC).
let locks = 0;
let previousOverflow = "";
export function lockPageScroll() {
  const root = document.documentElement;
  if (locks++ === 0) { previousOverflow = root.style.overflow; root.style.overflow = "hidden"; }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) root.style.overflow = previousOverflow;
  };
}
