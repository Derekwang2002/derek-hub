"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { localePath } from "../../../../../lib/locale";
import { base, styles, Intro, WindowBar, Command, Stack, ProfileGroups, type ContentLocale } from "./shared";

const commands = ["help", "about", "stack", "projects", "clear"];
type Entry = { id: number; command: string; kind: string };
export function ConsoleHero({ locale }: { locale: ContentLocale }) {
  const zh = locale === "zh";
  const [value, setValue] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [initial, setInitial] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const serial = useRef(0);
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (output.current) output.current.scrollTop = output.current.scrollHeight; }, [entries, initial]);
  function run(raw: string) {
    const text = raw.trim();
    if (!text) return;
    const command = text.toLowerCase();
    setHistory(previous => [...previous.slice(-19), text]);
    historyIndex.current = -1;
    setValue("");
    if (command === "clear") { setEntries([]); setInitial(false); return; }
    const aliases: Record<string, string> = { "whoami": "about", "cat ~/about.txt": "about", "cat ~/stack.txt": "stack", "ls": "projects" };
    const kind = aliases[command] ?? (commands.includes(command) ? command : "unknown");
    setEntries(previous => [...previous.slice(-5), { id: ++serial.current, command: text, kind }]);
  }
  function submit(event: FormEvent) { event.preventDefault(); run(value); }
  function keydown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length) return;
      const step = event.key === "ArrowUp" ? 1 : -1;
      historyIndex.current = Math.max(-1, Math.min(history.length - 1, historyIndex.current + step));
      setValue(historyIndex.current < 0 ? "" : history[history.length - 1 - historyIndex.current]);
    } else if (event.key === "Tab" && value.trim()) {
      const match = commands.filter(command => command.startsWith(value.trim().toLowerCase()));
      if (match.length === 1) { event.preventDefault(); setValue(match[0]); }
    } else if (event.key === "Escape") { setValue(""); input.current?.blur(); }
  }
  return <main className={`${base.home} ${styles.consoleHome}`} lang={zh ? "zh-CN" : "en"}>
    <Intro locale={locale} />
    <figure className={`${base.terminal} ${styles.consoleTerminal}`}>
      <WindowBar suffix={<span className={styles.liveDot} aria-hidden="true" />} />
      <div className={base.terminalBody}>
        <div className={styles.consoleOutput} ref={output} tabIndex={0} role="region" aria-label={zh ? "终端输出记录" : "Terminal output history"}>
          {initial && <ProfileGroups />}
          <div role="log" aria-live="polite" aria-relevant="additions">
            {entries.map(entry => <div key={entry.id} className={`${base.commandGroup} ${styles.outputEntry}`}><Command>{entry.command}</Command>
              {entry.kind === "about" && <p>Derek Wang<br />USC · M.S. Computer Science<br />AI Agents · Backend engineering<br /><a href={localePath(locale, "/about")}>{zh ? "关于我" : "About me"} ↗</a></p>}
              {entry.kind === "stack" && <Stack />}
              {entry.kind === "projects" && <div className={styles.projectOutput}><a href={localePath(locale, "/projects/call-e")}><span>CALL-E</span><span>{zh ? "长期目标 · 语音 Agent" : "Long-term goals · Voice agent"} ↗</span></a><a href={localePath(locale, "/projects/ai-intelligence")}><span>MATRIX</span><span>{zh ? "AI 进展与长期趋势" : "AI developments & trends"} ↗</span></a></div>}
              {entry.kind === "help" && <p>{zh ? "about · 关于我 / stack · 技术栈" : "about · Profile / stack · Tech stack"}<br />{zh ? "projects · 项目 / clear · 清屏" : "projects · Work / clear · Clear output"}<br /><span className={styles.dim}>{zh ? "↑↓ 历史记录 · Tab 补全 · Esc 退出" : "↑↓ history · Tab complete · Esc leave"}</span></p>}
              {entry.kind === "unknown" && <p>{zh ? "没有这个命令。输入 help 查看可用命令。" : "Command not found. Type help for available commands."}</p>}
            </div>)}
          </div>
          {!initial && !entries.length && <p className={styles.dim}>{zh ? "已清空。输入命令，继续探索。" : "A fresh prompt. Try a command."}</p>}
        </div>
        <form className={styles.prompt} onSubmit={submit}><span aria-hidden="true">❯</span><input ref={input} aria-label={zh ? "输入终端命令" : "Enter a terminal command"} placeholder={zh ? "输入 help，或点击下方命令" : "Type help, or pick a command below"} value={value} maxLength={100} onChange={event => setValue(event.target.value)} onKeyDown={keydown} autoComplete="off" autoCapitalize="off" spellCheck={false} /><button type="submit" aria-label={zh ? "运行命令" : "Run command"}>↵</button></form>
        <div className={styles.suggestions} aria-label={zh ? "快捷命令" : "Quick commands"}>{["about", "stack", "projects"].map(command => <button key={command} onClick={() => run(command)}>{command}<span aria-hidden="true"> ↗</span></button>)}</div>
      </div>
    </figure>
  </main>;
}
