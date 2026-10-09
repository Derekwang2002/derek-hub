"use client";

import { useRef, type PointerEvent } from "react";
import styles from "./landing.module.css";

export function ProfileCode() {
  const frame = useRef<HTMLElement>(null);
  function move(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--code-x", `${-y * 3}deg`);
    event.currentTarget.style.setProperty("--code-y", `${x * 4}deg`);
  }
  function reset() { frame.current?.style.removeProperty("--code-x"); frame.current?.style.removeProperty("--code-y"); }
  return <figure className={styles.terminal} ref={frame} onPointerMove={move} onPointerLeave={reset} lang="en">
    <figcaption className={styles.windowBar}>
      <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
      <span>derek — zsh</span>
    </figcaption>
    <div className={styles.terminalBody}>
      <div className={styles.commandGroup}>
        <div className={styles.command}><span aria-hidden="true">❯</span><code>whoami</code></div>
        <p className={styles.terminalName}>Derek Wang</p>
      </div>
      <div className={styles.commandGroup}>
        <div className={styles.command}><span aria-hidden="true">❯</span><code>cat <span>~/about.txt</span></code></div>
        <p>USC · M.S. Computer Science<br />AI Agents · Backend engineering</p>
      </div>
      <div className={styles.commandGroup}>
        <div className={styles.command}><span aria-hidden="true">❯</span><code>cat <span>~/stack.txt</span></code></div>
        <dl className={styles.terminalStack}>
          <div><dt>languages</dt><dd>Python · Java</dd></div>
          <div><dt>backend</dt><dd>FastAPI · Spring Boot</dd></div>
          <div><dt>data</dt><dd>PostgreSQL · Redis · SQL</dd></div>
        </dl>
      </div>
    </div>
  </figure>;
}
