import type { Note, ProjectData } from "../types";
import { noteFolderFromPath } from "./markdown";

export const rootFolderId = "";
export const rootFolderLabel = "Notes";

export type FolderGroupData = {
  folder: string;
  notes: Note[];
};

export type SortOrder = "az" | "za";

export function buildFolderGroups(
  project: ProjectData,
  notes: Note[],
  sortOrder: SortOrder = "az",
): FolderGroupData[] {
  const folderNames = Array.from(
    new Set([
      rootFolderId,
      ...project.folders,
      ...notes.map((note) => noteFolderFromPath(note.path)).filter(Boolean),
    ]),
  );

  return folderNames
    .map((folder) => ({
      folder,
      notes: notes
        .filter((note) => noteFolderFromPath(note.path) === folder)
        .sort((a, b) =>
          sortOrder === "az"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title),
        ),
    }))
    .filter(
      (group) =>
        group.folder === rootFolderId ||
        group.notes.length > 0 ||
        project.folders.includes(group.folder),
    );
}

export function normalizeProject(project: ProjectData): ProjectData {
  const folders = Array.from(
    new Set([
      ...(project.folders ?? []),
      ...project.notes.map((note) => noteFolderFromPath(note.path)).filter(Boolean),
    ]),
  ).sort();

  return {
    ...project,
    folders,
    notes: [...project.notes].sort((a, b) => a.title.localeCompare(b.title)),
  };
}

export function toggleSetValue(values: Set<string>, value: string): Set<string> {
  const nextValues = new Set(values);

  if (nextValues.has(value)) {
    nextValues.delete(value);
  } else {
    nextValues.add(value);
  }

  return nextValues;
}
