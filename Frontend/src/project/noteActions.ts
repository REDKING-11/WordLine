import type { Note } from "../types";
import { noteFolderFromPath, notePathFor, parseNote, slugify } from "./markdown";

export function createStarterNote(projectName: string): Note {
  const safeId = slugify(projectName);

  return {
    path: "notes/Start Here.md",
    title: "Start Here",
    content: `---
id: start-here
type: note
tags: [starter]
canon: true
---

# Start Here

Welcome to ${projectName}.

Create your first character, place, event, or idea with a wiki link like [[First Character]].
`,
    frontmatter: {
      id: "start-here",
      type: "note",
      tags: ["starter"],
      canon: true,
      aliases: [safeId].filter(Boolean),
    },
  };
}

export function createBlankNote(title: string, folder: string, type: string): Note {
  const id = slugify(title) || "untitled";

  return parseNote(
    notePathFor(title, folder),
    `---
id: ${id}
type: ${type}
tags: []
canon: true
---

# ${title}

`,
  );
}

export function duplicateNote(note: Note, title: string): Note {
  const id = slugify(title) || "untitled";
  const folder = noteFolderFromPath(note.path);
  const contentWithTitle = note.content.match(/^#\s+.+$/m)
    ? note.content.replace(/^#\s+.+$/m, `# ${title}`)
    : `${note.content.trimEnd()}\n\n# ${title}\n`;
  const contentWithId = contentWithTitle.match(/^id:\s*.+$/m)
    ? contentWithTitle.replace(/^id:\s*.+$/m, `id: ${id}`)
    : contentWithTitle;

  return parseNote(notePathFor(title, folder), contentWithId);
}

export function renameNote(note: Note, title: string): Note {
  const id = slugify(title) || note.frontmatter.id;
  const folder = noteFolderFromPath(note.path);
  const contentWithTitle = note.content.match(/^#\s+.+$/m)
    ? note.content.replace(/^#\s+.+$/m, `# ${title}`)
    : `${note.content.trimEnd()}\n\n# ${title}\n`;
  const contentWithId = contentWithTitle.match(/^id:\s*.+$/m)
    ? contentWithTitle.replace(/^id:\s*.+$/m, `id: ${id}`)
    : contentWithTitle;

  return parseNote(notePathFor(title, folder), contentWithId);
}

export function replaceWikiLinksToTitle(
  content: string,
  oldTitle: string,
  nextTitle: string,
): string {
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, linkTitle, label) => {
    if (normalizeTitle(linkTitle) !== normalizeTitle(oldTitle)) {
      return match;
    }

    return label ? `[[${nextTitle}|${label}]]` : `[[${nextTitle}]]`;
  });
}

export function findNoteByTitle(notes: Note[], title: string): Note | undefined {
  return notes.find((note) => normalizeTitle(note.title) === normalizeTitle(title));
}

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}
