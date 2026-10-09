import assert from "node:assert/strict";
import test from "node:test";
import { getVisibleSections, getVisibleHeadingRange } from "./visible-sections";

const headings = [
  { id: "a", level: 2, top: -200 },
  { id: "a1", level: 3, top: -100 },
  { id: "a2", level: 3, top: 300 },
  { id: "b", level: 2, top: 600 }
];
test("the indicator bridges a parent and later visible children without split segments", () => {
  assert.deepEqual(getVisibleHeadingRange(["parent", "earlier-child", "current-child", "next"], ["parent", "current-child"]), { first: 0, last: 2 });
  assert.deepEqual(getVisibleHeadingRange(["parent", "earlier-child", "current-child", "next"], ["next"]), { first: 3, last: 3 });
});
test("the indicator disappears when no listed section is visible", () => {
  assert.equal(getVisibleHeadingRange(["a"], []), null);
  assert.equal(getVisibleHeadingRange(["a"], ["stale-id"]), null);
});
test("highlights visible sections and their parent with one current location", () => {
  assert.deepEqual(getVisibleSections(headings, 88, 550, 1200), {
    activeId: "a1", visibleIds: ["a", "a1", "a2"]
  });
});
test("includes the next visible section and clears parents at their boundary", () => {
  assert.deepEqual(getVisibleSections(headings, 600, 900, 1200), { activeId: "b", visibleIds: ["b"] });
  assert.deepEqual(getVisibleSections(headings, 500, 800, 1200).visibleIds, ["a", "a2", "b"]);
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
