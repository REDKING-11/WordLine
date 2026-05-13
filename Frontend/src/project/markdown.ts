import type { Note, NoteFrontmatter } from "../types";

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const wikiLinkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function parseNote(path: string, content: string): Note {
  const frontmatter = parseFrontmatter(content);
  const title = extractTitle(content) ?? filenameToTitle(path);

  return {
    path,
    title,
    content,
    frontmatter: {
      id: slugify(frontmatter.id || title),
      type: frontmatter.type,
      tags: frontmatter.tags ?? [],
      canon: frontmatter.canon,
      aliases: frontmatter.aliases,
      sources: frontmatter.sources,
    },
  };
}

export function extractWikiLinks(content: string): string[] {
  return Array.from(content.matchAll(wikiLinkPattern), (match) => match[1].trim());
}

export function noteFolderFromPath(path: string): string {
  const normalizedPath = path.replace(/\\/g, "/");
  const withoutRoot = normalizedPath.replace(/^notes\/?/, "");
  const parts = withoutRoot.split("/");

  if (parts.length <= 1) {
    return "";
  }

  return parts.slice(0, -1).join("/");
}

export function notePathFor(title: string, folder: string): string {
  const cleanFolder = normalizeFolderPath(folder);
  const filename = `${sanitizeFilename(title)}.md`;

  return cleanFolder ? `notes/${cleanFolder}/${filename}` : `notes/${filename}`;
}

export function normalizeFolderPath(folder: string): string {
  return folder
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => sanitizeFilename(part.trim()))
    .filter(Boolean)
    .join("/");
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(content: string): Partial<NoteFrontmatter> {
  const match = content.match(frontmatterPattern);

  if (!match) {
    return {};
  }

  const data: Partial<NoteFrontmatter> = {};
  const lines = match[1].split(/\r?\n/);

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (key === "id") {
      data.id = rawValue;
    }

    if (key === "type") {
      data.type = rawValue;
    }

    if (key === "canon") {
      data.canon = rawValue === "true";
    }

    if (key === "tags" || key === "aliases" || key === "sources") {
      data[key] = parseList(rawValue);
    }
  }

  return data;
}

function parseList(rawValue: string): string[] {
  if (!rawValue) {
    return [];
  }

  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [rawValue];
}

function extractTitle(content: string): string | undefined {
  const titleLine = content
    .split(/\r?\n/)
    .find((line) => line.startsWith("# "));

  return titleLine?.replace(/^#\s+/, "").trim();
}

function filenameToTitle(path: string): string {
  const pathParts = path.split("/");
  const filename = pathParts[pathParts.length - 1] ?? path;
  return filename.replace(/\.md$/i, "");
}

function sanitizeFilename(value: string): string {
  return value.replace(/[<>:"/\\|?*]+/g, "-").replace(/\s+/g, " ").trim();
}
