"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useDeviceTilt } from "./use-device-tilt";
import styles from "./landing.module.css";

const profileFields = [
  ["name", "Derek Wang"],
  ["education", "USC · M.S. Computer Science"],
  ["focus", "Agent & Backend Engineering"],
  ["languages", "{Python,Java}"],
  ["backend", '{FastAPI,"Spring Boot"}'],
  ["data", "{PostgreSQL,Redis,SQL}"],
];

const queryTokens = [
  ["SELECT", styles.sqlKeyword], [" name", ""], [",", styles.sqlPunctuation],
  [" education", ""], [",", styles.sqlPunctuation], [" focus", ""], [",", styles.sqlPunctuation],
  ["\n       languages", ""], [",", styles.sqlPunctuation], [" backend", ""], [",", styles.sqlPunctuation],
  [" data\n", ""], ["FROM", styles.sqlKeyword], [" profile\n", ""],
  ["WHERE", styles.sqlKeyword], [" name ", ""], ["=", styles.sqlPunctuation], [" ", ""],
  ["'Derek Wang'", styles.sqlString], ["\n", ""], ["\\gx", styles.sqlKeyword],
];
const queryText = queryTokens.map(([text]) => text).join("");
const queryCharacters = queryTokens.flatMap(([text, className]) =>
  [...text].map(character => ({ character, className })),
);
const queryChunkEnds = [...queryText.matchAll(/'[^']*'\s*|\S+\s*/g)]
  .map(match => match.index + match[0].length);

export function ProfileCode({ locale = "en" }: { locale?: "en" | "zh" }) {
  const frame = useRef<HTMLElement>(null);
  const { permission, enable } = useDeviceTilt(frame);
  const [typed, setTyped] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation = 0;
    let elapsed = 0;
    let lastTime = 0;
    let lastCount = 0;
    let observer: IntersectionObserver | undefined;
    const startDelay = 40;
    const typingDuration = 560;
    const executionDelay = 400;
    const finish = () => {
      cancelAnimationFrame(animation);
      observer?.disconnect();
      setTyped(queryCharacters.length);
      setComplete(true);
    };
    const tick = (now: number) => {
      // A background tab resumes from its current word instead of skipping ahead.
      elapsed += Math.min(now - lastTime, 48);
      lastTime = now;
      const chunk = Math.min(queryChunkEnds.length, Math.max(0, Math.floor((elapsed - startDelay) / typingDuration * queryChunkEnds.length)));
      const count = chunk === 0 ? 0 : queryChunkEnds[chunk - 1];
      if (count !== lastCount) { setTyped(count); lastCount = count; }
      if (elapsed >= startDelay + typingDuration + executionDelay) { finish(); return; }
      animation = requestAnimationFrame(tick);
    };
    const start = () => {
      observer?.disconnect();
      lastTime = performance.now();
      animation = requestAnimationFrame(tick);
    };
    const preferenceChanged = () => { if (reduced.matches) finish(); };
    if (reduced.matches) finish();
    else {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) start();
      }, { threshold: .2 });
      observer.observe(frame.current!);
    }
    reduced.addEventListener("change", preferenceChanged);
    return () => {
      cancelAnimationFrame(animation);
      observer?.disconnect();
      reduced.removeEventListener("change", preferenceChanged);
    };
  }, []);
  function move(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
    event.currentTarget.style.setProperty("--code-x", `${-y * 8}deg`);
    event.currentTarget.style.setProperty("--code-y", `${x * 12}deg`);
  }
  function reset() { frame.current?.style.removeProperty("--code-x"); frame.current?.style.removeProperty("--code-y"); }
  return <figure className={styles.terminal} data-query-phase={complete ? "complete" : typed === queryCharacters.length ? "executing" : "typing"} ref={frame} onPointerMove={move} onPointerLeave={event => { if (event.pointerType === "mouse") reset(); }} lang="en">
    <figcaption className={styles.windowBar}>
      <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
      <span>derek — psql</span>
      {permission === "prompt" || permission === "denied" ? <button type="button" className={styles.motionButton} onClick={enable} disabled={permission === "denied"} aria-label={permission === "denied" ? (locale === "zh" ? "设备感应未获授权" : "Motion permission not granted") : (locale === "zh" ? "开启重力感应" : "Enable device tilt")} title={locale === "zh" ? "开启重力感应" : "Enable device tilt"}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="3" width="9" height="17" rx="2" transform="rotate(15 12 12)" /><path d="M3 8 1 11l3 2M21 16l2-3-3-2" /></svg></button> : null}
    </figcaption>
    <div className={styles.terminalBody}>
      <pre className={styles.profileQuery}><code>
        <span className={styles.queryAccessible}>{queryText}</span>
        <span aria-hidden="true">{queryCharacters.map(({ character, className }, i) =>
          <span className={`${className} ${styles.queryCharacter}`} data-visible={i < typed} data-cursor={!complete && i === Math.max(0, typed - 1)} key={i}>{character}</span>
        )}</span>
      </code></pre>
      <pre className={styles.profileResult} aria-label="Profile query result">
        <span className={styles.resultSeparator}>{"-[ RECORD 1 ]---------------------------"}</span>
        {profileFields.map(([field, value]) => <span key={field}>{"\n"}<span className={styles.resultField}>{field.padEnd(9)}</span><span className={styles.resultSeparator}>{" | "}</span><span className={styles.resultValue}>{value}</span></span>)}
      </pre>
    </div>
  </figure>;
}
