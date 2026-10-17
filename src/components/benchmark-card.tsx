"use client";

import { useId, useRef, useState } from "react";
import type { BenchmarkDefinition, BenchmarkScenario } from "../../lib/benchmark";
import { GradientShowcase } from "./gradient-showcase";
import styles from "./benchmark-card.module.css";

export type { BenchmarkDatum, BenchmarkScenario } from "../../lib/benchmark";

type BenchmarkCardProps = Partial<Omit<BenchmarkDefinition, "scenarios">> & {
  scenarios: BenchmarkScenario[];
  initialScenarioId?: string;
  ariaLabel?: string;
  className?: string;
};

export function BenchmarkCard({
  scenarios,
  initialScenarioId,
  ariaLabel = "Benchmark comparison",
  className,
  title,
  locale = "en",
  basis,
  note
}: BenchmarkCardProps) {
  const instanceId = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const initialIndex = Math.max(
    0,
    initialScenarioId ? scenarios.findIndex(({ id }) => id === initialScenarioId) : 0
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const scenario = scenarios[activeIndex];

  if (!scenario || scenario.values.length === 0) {
    return null;
  }

  const theme = scenario.theme ?? "violet";

  return (
    <figure className={styles.figure} aria-label={title ?? ariaLabel}>
      {title ? <figcaption className={styles.caption}>
        <strong>{title}</strong>
        {basis ? <span className={styles.badge}>{basis === "published"
          ? (locale === "zh" ? "已发表实验" : "Published experiment")
          : (locale === "zh" ? "教学模型 · 非实测" : "Teaching model · not measured")}</span> : null}
      </figcaption> : null}
    <GradientShowcase ariaLabel={title ?? ariaLabel} className={[title ? styles.inline : "", className].filter(Boolean).join(" ")} theme={theme}>
      <div className={styles.panel}>
        <div aria-label={locale === "zh" ? "对比指标" : "Comparison metrics"} className={styles.tabs} role="tablist">
          {scenarios.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                aria-controls={`${instanceId}-${item.id}-panel`}
                aria-selected={active}
                className={`${styles.tab} ${active ? styles.active : ""}`}
                id={`${instanceId}-${item.id}-tab`}
                key={item.id}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                  const next = event.key === "ArrowRight" ? (index + 1) % scenarios.length
                    : event.key === "ArrowLeft" ? (index - 1 + scenarios.length) % scenarios.length
                    : event.key === "Home" ? 0 : event.key === "End" ? scenarios.length - 1 : null;
                  if (next === null) return;
                  event.preventDefault();
                  setActiveIndex(next);
                  tabs.current[next]?.focus();
                }}
                ref={(element) => { tabs.current[index] = element; }}
                role="tab"
                tabIndex={active ? 0 : -1}
                type="button"
              >
                <strong>{item.eyebrow}</strong>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {scenarios.map((item, index) => {
          const maximum = Math.max(...item.values.map(({ value }) => value), 0);
          return <div
          aria-labelledby={`${instanceId}-${item.id}-tab`}
          className={styles.chart}
          hidden={index !== activeIndex}
          id={`${instanceId}-${item.id}-panel`}
          key={item.id}
          role="tabpanel"
          tabIndex={0}
        >
          <p className={styles.description}>{item.description}</p>
          <div className={styles.metrics}>
            {item.values.map((datum) => {
              const width = maximum > 0 ? Math.max((datum.value / maximum) * 100, 0) : 0;
              return (
                <div className={styles.metric} key={datum.label}>
                  <div className={styles.metricLabel}>
                    <strong className={datum.emphasis ? styles.emphasis : undefined}>
                      {datum.label}
                    </strong>
                    <span>{datum.displayValue ?? `${datum.value}${item.unit ? ` ${item.unit}` : ""}`}</span>
                  </div>
                  <div aria-hidden="true" className={styles.track}>
                    <span
                      className={`${styles.bar} ${datum.emphasis ? styles.emphasisBar : ""}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>;
        })}
      </div>
    </GradientShowcase>
    {note ? <p className={styles.note}>{note}</p> : null}
    </figure>
  );
}
