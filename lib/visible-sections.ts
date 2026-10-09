export type HeadingPosition = { id: string; level: number; top: number };

// A parent may stay visible after earlier children have left the viewport.
// Draw one range across those gaps instead of disconnected markers.
export function getVisibleHeadingRange(ids: string[], visibleIds: string[]) {
  const visible = new Set(visibleIds);
  const first = ids.findIndex(id => visible.has(id));
  if (first < 0) return null;
  const last = ids.findLastIndex(id => visible.has(id));
  return { first, last };
}

// Sections end at the next heading of the same or a higher level. Parents
// therefore remain highlighted while their visible subsections are being read.
export function getVisibleSections(
  headings: HeadingPosition[], viewportTop: number, viewportBottom: number, articleBottom: number
): { activeId: string; visibleIds: string[] } {
  const visibleIds = headings.filter((heading, index) => {
    const end = headings.slice(index + 1).find((next) => next.level <= heading.level)?.top ?? articleBottom;
    return Math.min(end, viewportBottom) - Math.max(heading.top, viewportTop) > 16;
  }).map((heading) => heading.id);
  const current = headings.filter((heading) => heading.top <= viewportTop + 24).at(-1);
  return {
    activeId: visibleIds.length ? (current && visibleIds.includes(current.id) ? current.id : visibleIds[0]) : "",
    visibleIds
  };
}
