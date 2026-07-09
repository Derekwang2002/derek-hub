import { promises as fs } from "node:fs";
import path from "node:path";

export type LocalMarkdownSource = {
  type: "local";
  path: string;
};

export type GitHubMarkdownSource = {
  type: "github";
  repository: string;
  branch: string;
  path: string;
};

export type GitHubFolderMarkdownCollectionSource = {
  type: "githubFolder";
  repository: string;
  branch: string;
  path: string;
};

export type MarkdownSource = LocalMarkdownSource | GitHubMarkdownSource;

export type MarkdownCollectionSource = GitHubFolderMarkdownCollectionSource;

export type MarkdownSourceResult = {
  content: string;
  sourceId: string;
  sourceUrl?: string;
};

export async function readMarkdownSource(
  source: MarkdownSource,
  owner: string
): Promise<MarkdownSourceResult> {
  if (source.type === "local") {
    return readLocalMarkdownSource(source, owner);
  }

  if (source.type === "github") {
    return readGitHubMarkdownSource(source, owner);
  }

  throw new Error(`Unsupported Markdown source for "${owner}".`);
}

export async function listMarkdownSourcesFromCollection(
  source: MarkdownCollectionSource,
  owner: string
): Promise<MarkdownSource[]> {
  if (source.type === "githubFolder") {
    return listGitHubFolderMarkdownSources(source, owner);
  }

  throw new Error(`Unsupported Markdown collection source for "${owner}".`);
}

export function getMarkdownSourceId(source: MarkdownSource): string {
  if (source.type === "local") {
    return `local:${source.path}`;
  }

  return `github:${source.repository}/${source.branch}/${source.path}`;
}

export function getMarkdownCollectionSourceId(source: MarkdownCollectionSource): string {
  return `github-folder:${source.repository}/${source.branch}/${source.path}`;
}

export function getRawGitHubUrl(source: GitHubMarkdownSource): string {
  return `https://raw.githubusercontent.com/${source.repository}/${source.branch}/${source.path}`;
}

export function getGitHubFolderUrl(source: GitHubFolderMarkdownCollectionSource): string {
  const normalizedPath = normalizeGitHubPath(source.path);
  return `https://github.com/${source.repository}/tree/${source.branch}/${normalizedPath}`;
}

async function readLocalMarkdownSource(
  source: LocalMarkdownSource,
  owner: string
): Promise<MarkdownSourceResult> {
  const fullPath = path.resolve(process.cwd(), source.path);

  try {
    const content = await fs.readFile(fullPath, "utf8");
    return {
      content: normalizeMarkdownContent(content),
      sourceId: getMarkdownSourceId(source)
    };
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(`Missing local Markdown source for "${owner}": ${source.path}`);
    }

    throw error;
  }
}

async function readGitHubMarkdownSource(
  source: GitHubMarkdownSource,
  owner: string
): Promise<MarkdownSourceResult> {
  const sourceUrl = getRawGitHubUrl(source);
  const response = await fetch(sourceUrl, {
    cache: "force-cache"
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Markdown source for "${owner}" from ${sourceUrl}: ${response.status} ${response.statusText}`
    );
  }

  return {
    content: normalizeMarkdownContent(await response.text()),
    sourceId: getMarkdownSourceId(source),
    sourceUrl
  };
}

async function listGitHubFolderMarkdownSources(
  source: GitHubFolderMarkdownCollectionSource,
  owner: string
): Promise<GitHubMarkdownSource[]> {
  const sourceUrl = getGitHubContentsApiUrl(source);
  const response = await fetch(sourceUrl, {
    cache: "force-cache",
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to list Markdown collection for "${owner}" from ${getGitHubFolderUrl(source)}: ${response.status} ${response.statusText}`
    );
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error(
      `GitHub collection source for "${owner}" is not a folder: ${getGitHubFolderUrl(source)}`
    );
  }

  return payload
    .filter(isGitHubContentsFile)
    .filter((item) => isMarkdownFileName(item.name))
    .filter((item) => item.name.toLowerCase() !== "readme.md")
    .map((item) => ({
      type: "github" as const,
      repository: source.repository,
      branch: source.branch,
      path: item.path
    }))
    .sort((a, b) => a.path.localeCompare(b.path, "en"));
}

function getGitHubContentsApiUrl(source: GitHubFolderMarkdownCollectionSource): string {
  const normalizedPath = normalizeGitHubPath(source.path);
  const encodedPath = normalizedPath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  return `https://api.github.com/repos/${source.repository}/contents/${encodedPath}?ref=${encodeURIComponent(source.branch)}`;
}

function normalizeGitHubPath(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function isMarkdownFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".md");
}

type GitHubContentsFile = {
  type: "file";
  name: string;
  path: string;
};

function isGitHubContentsFile(item: unknown): item is GitHubContentsFile {
  if (!item || typeof item !== "object") {
    return false;
  }

  const record = item as Record<string, unknown>;
  return (
    record.type === "file" &&
    typeof record.name === "string" &&
    typeof record.path === "string"
  );
}

function normalizeMarkdownContent(content: string): string {
  return content.replace(/^\uFEFF/, "").trimStart();
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
