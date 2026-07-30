import type { ReactNode } from "react";
import styles from "./gradient-showcase.module.css";

export type GradientShowcaseTheme = "ocean" | "sunset" | "aurora" | "violet";

type GradientShowcaseProps = {
  children: ReactNode;
  theme?: GradientShowcaseTheme;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
};

export function GradientShowcase({
  children,
  theme = "violet",
  ariaLabel,
  className,
  contentClassName
}: GradientShowcaseProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={[styles.stage, styles[theme], className].filter(Boolean).join(" ")}
    >
      <div className={[styles.content, contentClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
    </section>
  );
}
