import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isAbsolute, relative } from "node:path";
import { cache } from "react";
import type { Post } from "./posts";

const exec = promisify(execFile);

export function readingMinutes(content: string): number {
  const text = content.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]*>/g, "");
  const chinese = (text.match(/[\p{Script=Han}]/gu) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
  return Math.max(1, Math.ceil(chinese / 350 + words / 200));
}

export const lastPostUpdate = cache(async (fileName: string, published: string): Promise<string | null> => {
  try {
    const { stdout } = await exec("git", ["log", "-1", "--format=%cs", "--", relative(process.cwd(), fileName)], { cwd: process.cwd(), timeout: 3000 });
    const date = stdout.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? (date > published ? date : published) : null;
  } catch { return null; }
});

export async function getPostMetadata(post: Post) {
  const fileName = isAbsolute(post.fileName) ? post.fileName : post.sourceId.startsWith("local:") ? post.sourceId.slice(6) : null;
  return { minutes: readingMinutes(post.content), updated: fileName ? await lastPostUpdate(fileName, post.date) : null };
}
