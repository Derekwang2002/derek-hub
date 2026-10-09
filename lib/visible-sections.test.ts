import assert from "node:assert/strict";
import test from "node:test";
import { getVisibleSections, getVisibleHeadingRange } from "./visible-sections";

const headings = [
  { id: "a", level: 2, top: -200 },
  { id: "a1", level: 3, top: -100 },
  { id: "a2", level: 3, top: 300 },
  { id: "b", level: 2, top: 600 }
];
test("the indicator covers the visible reading range", () => {
  assert.deepEqual(getVisibleHeadingRange(["parent", "earlier-child", "current-child", "next"], ["current-child", "next"]), { first: 2, last: 3 });
  assert.deepEqual(getVisibleHeadingRange(["parent", "earlier-child", "current-child", "next"], ["next"]), { first: 3, last: 3 });
});
test("the indicator disappears when no listed section is visible", () => {
  assert.equal(getVisibleHeadingRange(["a"], []), null);
  assert.equal(getVisibleHeadingRange(["a"], ["stale-id"]), null);
});
test("highlights visible content without retaining an offscreen parent", () => {
  assert.deepEqual(getVisibleSections(headings, 88, 550, 1200), {
    activeId: "a1", visibleIds: ["a1", "a2"]
  });
});
test("includes the next visible section across a heading-level boundary", () => {
  assert.deepEqual(getVisibleSections(headings, 600, 900, 1200), { activeId: "b", visibleIds: ["b"] });
  assert.deepEqual(getVisibleSections(headings, 500, 800, 1200).visibleIds, ["a2", "b"]);
});
test("MySQL's visible subsections do not extend the indicator back to Index", () => {
  const positions = [
    { id: "index", level: 1, top: -2400 },
    { id: "classification", level: 2, top: -2300 },
    { id: "summary", level: 2, top: 38 },
    { id: "other", level: 2, top: 96 },
    { id: "row-count", level: 3, top: 154 },
    { id: "pagination", level: 3, top: 666 },
    { id: "deep-pagination", level: 3, top: 887 },
    { id: "transactions", level: 1, top: 1200 }
  ];
  const { activeId, visibleIds } = getVisibleSections(positions, 88, 976, 1800);
  assert.equal(activeId, "other");
  assert.deepEqual(visibleIds, ["other", "row-count", "pagination", "deep-pagination"]);
  assert.deepEqual(getVisibleHeadingRange(positions.map(heading => heading.id), visibleIds), { first: 3, last: 6 });
  assert.deepEqual(getVisibleSections(positions, 200, 600, 1800), {
    activeId: "row-count", visibleIds: ["row-count"]
  });
});
test("long sections stay highlighted without visible headings", () => {
  assert.equal(getVisibleSections(headings, 800, 1000, 1200).activeId, "b");
});
test("clears highlights outside the article and handles empty documents", () => {
  assert.deepEqual(getVisibleSections([], 88, 600, 1200).visibleIds, []);
  assert.deepEqual(getVisibleSections(headings, 1200, 1500, 1200).visibleIds, []);
  assert.equal(getVisibleSections([{ id: "a", level: 2, top: 800 }], 88, 600, 1200).activeId, "");
});

test("ignores a sliver of the previous section after an anchor jump", () => {
  assert.deepEqual(getVisibleSections([
    { id: "previous", level: 2, top: -400 }, { id: "target", level: 2, top: 104 }
  ], 97, 800, 1200), { activeId: "target", visibleIds: ["target"] });
});
