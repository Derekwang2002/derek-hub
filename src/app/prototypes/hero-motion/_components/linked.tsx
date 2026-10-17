"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ContactLinks } from "@/components/contact-links";
import { HoverLetters, ProfileName } from "@/components/profile-name";
import { localePath } from "../../../../../lib/locale";
import { base, styles, WindowBar, Command, Stack, type ContentLocale } from "./shared";

export function LinkedHero({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const root = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  const active = locked ?? hovered;
  const [wire, setWire] = useState<{ path: string; x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    if (active === null) { setWire(null); return; }
    const main = root.current!;
    const measure = () => {
      if (window.innerWidth <= 800) { setWire(null); return; }
      const r = main.getBoundingClientRect();
      const a = main.querySelector(`[data-source="${active}"]`)!.getBoundingClientRect();
      const b = main.querySelector(`[data-target="${active}"]`)!.getBoundingClientRect();
      const x1 = a.right - r.left + 12, y1 = a.top + a.height / 2 - r.top;
      const x2 = b.left - r.left - 8, y2 = b.top + b.height / 2 - r.top;
      const middle = x1 + (x2 - x1) * .55;
      setWire({ path: `M${x1},${y1} C${middle},${y1} ${middle},${y2} ${x2},${y2}`, x: x2, y: y2 });
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(main);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [active]);
  const controls = (index: number) => ({
    "data-source": index,
    "aria-pressed": locked === index,
    onPointerEnter: (event: React.PointerEvent) => { if (event.pointerType === "mouse") setHovered(index); },
    onPointerLeave: () => setHovered(null),
    onFocus: () => setHovered(index),
    onBlur: () => setHovered(null),
    onClick: () => { setLocked(previous => previous === index ? null : index); setHovered(null); }
  });
  return <main ref={root} className={`${base.home} ${styles.linkedHome}`} lang={zh ? "zh-CN" : "en"}>
    {wire && <svg className={styles.wire} aria-hidden="true"><path key={active} d={wire.path} /><circle cx={wire.x} cy={wire.y} r="3" /></svg>}
    <section className={base.intro} aria-labelledby="home-title">
      <h1 id="home-title"><span className={base.greeting}><button className={styles.textControl} {...controls(0)}><HoverLetters text={zh ? "你好，我是" : "Hi, I’m"} /></button></span>{" "}<span onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(0); }} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(0)} onBlur={() => setHovered(null)}><ProfileName href={localePath(locale, "/about")} title={zh ? "关于我" : "About me"} /></span>.</h1>
      <p lang="en"><button className={`${styles.textControl} ${styles.educationControl}`} {...controls(1)}>MSCS@USC</button><br /><button className={styles.textControl} {...controls(2)}>Agent/Backend Engineering</button></p>
      <ContactLinks locale={locale} about />
    </section>
    <figure className={`${base.terminal} ${styles.linkedTerminal}`}>
      <WindowBar suffix={locked !== null ? <button className={styles.unlock} onClick={() => { setLocked(null); setHovered(null); }} aria-label={zh ? "取消固定" : "Unpin selection"}>×</button> : null} />
      <div className={base.terminalBody}>
        <div data-target="0" data-selected={active === 0} className={`${base.commandGroup} ${styles.linkedGroup}`}><Command>whoami</Command><p className={base.terminalName}>Derek Wang</p></div>
        <div data-target="1" data-selected={active === 1} className={`${base.commandGroup} ${styles.linkedGroup}`}><Command>cat <span>~/about.txt</span></Command><p>USC · M.S. Computer Science<br />AI Agents · Backend engineering</p></div>
        <div data-target="2" data-selected={active === 2} className={`${base.commandGroup} ${styles.linkedGroup}`}><Command>cat <span>~/stack.txt</span></Command><Stack /></div>
      </div>
    </figure>
    <span role="status" className={styles.srOnly}>{active === null ? "" : (zh ? ["个人信息", "学校与方向", "技术栈"][active] : ["Profile", "Education and interests", "Tech stack"][active])}</span>
  </main>;
}
