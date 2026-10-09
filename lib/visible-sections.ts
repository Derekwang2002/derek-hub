export type HeadingPosition = { id: string; level: number; top: number };

// Draw a continuous indicator across the visible reading range.
export function getVisibleHeadingRange(ids: string[], visibleIds: string[]) {
  const visible = new Set(visibleIds);
  const first = ids.findIndex(id => visible.has(id));
  if (first < 0) return null;
  const last = ids.findLastIndex(id => visible.has(id));
  return { first, last };
}

// Each heading owns the content up to the very next heading, regardless of
// level. An offscreen ancestor must not pull the range over earlier siblings.
export function getVisibleSections(
  headings: HeadingPosition[], viewportTop: number, viewportBottom: number, articleBottom: number
): { activeId: string; visibleIds: string[] } {
  const visibleIds = headings.filter((heading, index) => {
    const end = headings[index + 1]?.top ?? articleBottom;
    return Math.min(end, viewportBottom) - Math.max(heading.top, viewportTop) > 16;
  }).map((heading) => heading.id);
  const current = headings.filter((heading) => heading.top <= viewportTop + 24).at(-1);
  return {
    activeId: visibleIds.length ? (current && visibleIds.includes(current.id) ? current.id : visibleIds[0]) : "",
    visibleIds
  };
}
