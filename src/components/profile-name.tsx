import Image from "next/image";
import Link from "next/link";
import styles from "./profile-name.module.css";

export function HoverLetters({ text }: { text: string }) {
  return <>{Array.from(text).map((char, index) => <span className={styles.letter} key={index}>{char}</span>)}</>;
}

export function ProfileName({ href, title, showPortrait = true }: { href: string; title: string; showPortrait?: boolean }) {
  return <Link className={styles.name} href={href} aria-label="Derek Wang" title={title}>
    {showPortrait ? <Image className={styles.portrait} src="/avatar.png" width={80} height={80} alt="" /> : null}
    <span><HoverLetters text="Derek Wang" /></span>
  </Link>;
}
