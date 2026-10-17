export type BenchmarkDatum = {
  label: string;
  value: number;
  displayValue?: string;
  emphasis?: boolean;
};

export type BenchmarkScenario = {
  id: string;
  eyebrow: string;
  label: string;
  description: string;
  unit?: string;
  values: BenchmarkDatum[];
  theme?: "ocean" | "sunset" | "aurora" | "violet";
};

export type BenchmarkDefinition = {
  title: string;
  locale: "en" | "zh";
  basis: "published" | "illustrative";
  note: string;
  scenarios: BenchmarkScenario[];
};

/** Fail the build for misleading or incomplete article chart data. */
export function parseBenchmark(source: string): BenchmarkDefinition {
  const data: unknown = JSON.parse(source);
  const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
  const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
  const optionalText = (value: unknown) => value === undefined || text(value);

  if (!record(data) || !text(data.title) || !text(data.note) ||
      (data.locale !== "en" && data.locale !== "zh") ||
      (data.basis !== "published" && data.basis !== "illustrative") ||
      !Array.isArray(data.scenarios) || data.scenarios.length === 0) {
    throw new Error("Benchmark requires a title, locale, basis, methodology note, and scenarios.");
  }

  const ids = new Set<string>();
  for (const scenario of data.scenarios) {
    if (!record(scenario) || !text(scenario.id) || !/^[a-z0-9-]+$/.test(scenario.id) ||
        ids.has(scenario.id) || !text(scenario.eyebrow) || !text(scenario.label) ||
        !text(scenario.description) || !optionalText(scenario.unit) ||
        (scenario.theme !== undefined && (typeof scenario.theme !== "string" || !["ocean", "sunset", "aurora", "violet"].includes(scenario.theme))) ||
        !Array.isArray(scenario.values) || scenario.values.length === 0) {
      throw new Error(`Invalid scenario in benchmark "${data.title}".`);
    }
    ids.add(scenario.id);
    const labels = new Set<string>();
    for (const datum of scenario.values) {
      if (!record(datum) || !text(datum.label) || labels.has(datum.label) ||
          typeof datum.value !== "number" || !Number.isFinite(datum.value) || datum.value < 0 ||
          !optionalText(datum.displayValue) ||
          (datum.emphasis !== undefined && typeof datum.emphasis !== "boolean")) {
        throw new Error(`Invalid value in benchmark "${data.title}", scenario "${scenario.id}".`);
      }
      labels.add(datum.label);
    }
  }
  return data as BenchmarkDefinition;
}
