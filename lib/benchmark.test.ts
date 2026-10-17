import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseBenchmark, type BenchmarkDefinition } from "./benchmark";

const example = {
  title: "Example", locale: "en", basis: "illustrative", note: "Hypothetical inputs.",
  scenarios: [{ id: "count", eyebrow: "Count", label: "Work", description: "Lower is better.",
    values: [{ label: "Baseline", value: 100 }, { label: "Covered", value: 0 }] }]
};

test("accepts zero values and rejects invalid quantitative data or missing methodology", () => {
  assert.equal(parseBenchmark(JSON.stringify(example)).scenarios[0].values[1].value, 0);
  for (const value of [-1, "100", null]) {
    const invalid = structuredClone(example);
    Object.assign(invalid.scenarios[0].values[0], { value });
    assert.throws(() => parseBenchmark(JSON.stringify(invalid)), /Invalid value/);
  }
  assert.throws(() => parseBenchmark(JSON.stringify({ ...example, note: "" })), /methodology/);
  assert.throws(() => parseBenchmark(JSON.stringify({ ...example, scenarios: [] })), /scenarios/);
  assert.throws(() => parseBenchmark(JSON.stringify({ ...example, locale: ["en"] })), /locale/);
  assert.throws(() => parseBenchmark(JSON.stringify({ ...example, scenarios: [...example.scenarios, ...example.scenarios] })), /Invalid scenario/);
  assert.throws(() => parseBenchmark('{"title":'));
});

test("all four article charts keep the same evidence basis and numbers in both languages", async () => {
  const paths = [
    "posts/2026-07-20-ponytail-review-skill.md",
    "posts/2026-07-10-docker-introduction.md",
    "posts/2026-05-01-mysql-notes.md",
    "projects/call-e/items/latency-optimization.md"
  ];
  for (const path of paths) {
    const definitions: BenchmarkDefinition[] = [];
    for (const locale of ["zh", "en"] as const) {
      const source = await readFile(`content/${locale === "en" ? "translations/en/" : ""}${path}`, "utf8");
      const blocks = [...source.matchAll(/^```benchmark\n([\s\S]*?)\n```/gm)];
      assert.equal(blocks.length, 1, `${locale}/${path} must contain one chart`);
      const definition = parseBenchmark(blocks[0][1]);
      assert.equal(definition.locale, locale);
      assert.equal(definition.basis, path.includes("ponytail") ? "published" : "illustrative");
      definitions.push(definition);
    }
    const numbers = (definition: BenchmarkDefinition) => definition.scenarios.map(scenario => ({
      id: scenario.id, values: scenario.values.map(({ value }) => value)
    }));
    assert.deepEqual(numbers(definitions[0]), numbers(definitions[1]), path);
  }
});
