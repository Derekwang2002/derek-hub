"use client";

import { useState } from "react";
import { GradientShowcase, type GradientShowcaseTheme } from "./gradient-showcase";
import styles from "./benchmark-card.module.css";

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
  theme?: GradientShowcaseTheme;
};

type BenchmarkCardProps = {
  scenarios: BenchmarkScenario[];
  initialScenarioId?: string;
  ariaLabel?: string;
  className?: string;
};

export function BenchmarkCard({
  scenarios,
  initialScenarioId,
  ariaLabel = "Benchmark comparison",
  className
}: BenchmarkCardProps) {
  const initialIndex = Math.max(
    0,
    initialScenarioId ? scenarios.findIndex(({ id }) => id === initialScenarioId) : 0
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scenario = scenarios[activeIndex];

  if (!scenario || scenario.values.length === 0) {
    return null;
  }

  const maximum = Math.max(...scenario.values.map(({ value }) => value), 0);
  const theme = scenario.theme ?? "violet";

  return (
    <GradientShowcase ariaLabel={ariaLabel} className={className} theme={theme}>
      <div className={styles.panel}>
        <div aria-label="Benchmark scenarios" className={styles.tabs} role="tablist">
          {scenarios.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                aria-controls={`${item.id}-benchmark-panel`}
                aria-selected={active}
                className={`${styles.tab} ${active ? styles.active : ""}`}
                id={`${item.id}-benchmark-tab`}
                key={item.id}
                onClick={() => setActiveIndex(index)}
                role="tab"
                type="button"
              >
                <strong>{item.eyebrow}</strong>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div
          aria-labelledby={`${scenario.id}-benchmark-tab`}
          className={styles.chart}
          id={`${scenario.id}-benchmark-panel`}
          role="tabpanel"
        >
          <p className={styles.description}>{scenario.description}</p>
          <div className={styles.metrics}>
            {scenario.values.map((datum) => {
              const width = maximum > 0 ? Math.max((datum.value / maximum) * 100, 2) : 0;
              return (
                <div className={styles.metric} key={datum.label}>
                  <div className={styles.metricLabel}>
                    <strong className={datum.emphasis ? styles.emphasis : undefined}>
                      {datum.label}
                    </strong>
                    <span>{datum.displayValue ?? `${datum.value}${scenario.unit ? ` ${scenario.unit}` : ""}`}</span>
                  </div>
                  <div className={styles.track}>
                    <span
                      className={`${styles.bar} ${datum.emphasis ? styles.emphasisBar : ""}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GradientShowcase>
  );
}
