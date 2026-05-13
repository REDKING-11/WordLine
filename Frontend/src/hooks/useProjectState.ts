import { useEffect, useMemo, useState } from "react";
import { DemoProjectRepository } from "../project/demoProject";
import { normalizeProject, rootFolderId, rootFolderLabel } from "../project/folders";
import {
  createBlankNote,
  duplicateNote,
  createStarterNote,
  findNoteByTitle,
  renameNote,
  replaceWikiLinksToTitle,
} from "../project/noteActions";
import { normalizeFolderPath, noteFolderFromPath, notePathFor, parseNote } from "../project/markdown";
import type { Note, ProjectData } from "../types";

const repository = new DemoProjectRepository();
const storageKey = "wordline.prototype.project";

export function useProjectState() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [saveMessage, setSaveMessage] = useState("Prototype saves stay in this browser.");

  useEffect(() => {
    repository.loadProject().then((loadedProject) => {
      const storedProject = readStoredProject();
      const initialProject = normalizeProject(storedProject ?? loadedProject);
      setProject(initialProject);
      setSelectedNoteId(initialProject.notes[0]?.frontmatter.id ?? "");
      setSaveMessage(
        storedProject
          ? "Restored prototype project from localStorage."
          : "Welcome World loaded. Changes save to localStorage.",
      );
    });
  }, []);

  useEffect(() => {
    if (!project) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(project));
  }, [project]);

  const selectedNote = useMemo(
    () => project?.notes.find((note) => note.frontmatter.id === selectedNoteId),
    [project, selectedNoteId],
  );

  function updateProject(nextProject: ProjectData, message: string) {
    const normalizedProject = normalizeProject(nextProject);
    setProject(normalizedProject);
    repository.saveProject?.(normalizedProject);
    setSaveMessage(message);
  }

  function createProject(projectName: string, locationLabel: string) {
    const firstNote = createStarterNote(projectName);
    updateProject(
      {
        name: projectName,
        locationLabel,
        folders: [],
        notes: [firstNote],
        relationshipTypes: [],
        relationships: [],
      },
      "Created a local prototype project. Changes save to localStorage.",
    );
    setSelectedNoteId(firstNote.frontmatter.id);
  }

  function updateSelectedNoteContent(content: string) {
    if (!project || !selectedNote) {
      return;
    }

    const updatedNote = parseNote(selectedNote.path, content);
    updateProject(
      {
        ...project,
        notes: project.notes.map((note) =>
          note.frontmatter.id === selectedNote.frontmatter.id ? updatedNote : note,
        ),
      },
      "Saved to localStorage. Desktop file save will use this note path later.",
    );
    setSelectedNoteId(updatedNote.frontmatter.id);
  }

  function createNote(title: string, folderInput: string, typeInput: string): Note | null {
    if (!project) {
      return null;
    }

    const folder = normalizeFolderPath(folderInput);
    const type = typeInput.trim() || "note";

    if (!title.trim()) {
      setSaveMessage("Give the note a title first.");
      return null;
    }

    if (findNoteByTitle(project.notes, title)) {
      setSaveMessage(`A note named ${title} already exists.`);
      return null;
    }

    const note = createBlankNote(title.trim(), folder, type);
    const folders =
      folder && !project.folders.includes(folder) ? [...project.folders, folder] : project.folders;

    updateProject(
      {
        ...project,
        folders,
        notes: [...project.notes, note],
      },
      `Created ${title.trim()}. Saved locally for the prototype.`,
    );
    setSelectedNoteId(note.frontmatter.id);
    return note;
  }

  function createFolder(folderInput: string): boolean {
    if (!project) {
      return false;
    }

    const folder = normalizeFolderPath(folderInput);

    if (!folder) {
      setSaveMessage("Give the folder a name first.");
      return false;
    }

    if (project.folders.includes(folder)) {
      setSaveMessage(`${folder} already exists.`);
      return false;
    }

    updateProject(
      {
        ...project,
        folders: [...project.folders, folder],
      },
      `Created folder ${folder}. Saved locally for the prototype.`,
    );
    return true;
  }

  function openOrCreateLinkedNote(title: string): Note | null {
    if (!project) {
      return null;
    }

    const existingNote = findNoteByTitle(project.notes, title);

    if (existingNote) {
      setSelectedNoteId(existingNote.frontmatter.id);
      return existingNote;
    }

    const folder = selectedNote ? noteFolderFromPath(selectedNote.path) : rootFolderId;
    const newNote = createBlankNote(title, folder, "note");
    updateProject(
      {
        ...project,
        notes: [...project.notes, newNote],
      },
      `Created ${title} from a wiki link. Saved locally for the prototype.`,
    );
    setSelectedNoteId(newNote.frontmatter.id);
    return newNote;
  }

  function promptRenameNote(note: Note) {
    if (!project) {
      return;
    }

    const nextTitle = window.prompt("Rename note", note.title)?.trim();

    if (!nextTitle || nextTitle === note.title) {
      return;
    }

    if (findNoteByTitle(project.notes.filter((candidate) => candidate !== note), nextTitle)) {
      setSaveMessage(`A note named ${nextTitle} already exists.`);
      return;
    }

    const renamedNote = renameNote(note, nextTitle);
    const updatedRelationships = project.relationships.map((relationship) => ({
      ...relationship,
      from: relationship.from === note.frontmatter.id ? renamedNote.frontmatter.id : relationship.from,
      to: relationship.to === note.frontmatter.id ? renamedNote.frontmatter.id : relationship.to,
    }));

    updateProject(
      {
        ...project,
        notes: project.notes.map((candidate) =>
          candidate.frontmatter.id === note.frontmatter.id
            ? renamedNote
            : parseNote(
                candidate.path,
                replaceWikiLinksToTitle(candidate.content, note.title, nextTitle),
              ),
        ),
        relationships: updatedRelationships,
      },
      `Renamed ${note.title} to ${nextTitle}. Saved locally.`,
    );
    setSelectedNoteId(renamedNote.frontmatter.id);
  }

  function promptDeleteNote(note: Note) {
    if (!project || !window.confirm(`Delete "${note.title}" from the prototype project?`)) {
      return;
    }

    const nextNotes = project.notes.filter(
      (candidate) => candidate.frontmatter.id !== note.frontmatter.id,
    );
    const nextSelectedId =
      selectedNoteId === note.frontmatter.id
        ? nextNotes[0]?.frontmatter.id ?? ""
        : selectedNoteId;

    updateProject(
      {
        ...project,
        notes: nextNotes,
        relationships: project.relationships.filter(
          (relationship) =>
            relationship.from !== note.frontmatter.id && relationship.to !== note.frontmatter.id,
        ),
      },
      `Deleted ${note.title}. Saved locally.`,
    );
    setSelectedNoteId(nextSelectedId);
  }

  function copyNote(note: Note): Note | null {
    if (!project) {
      return null;
    }

    let copyIndex = 1;
    let title = `${note.title} copy`;

    while (findNoteByTitle(project.notes, title)) {
      copyIndex += 1;
      title = `${note.title} copy ${copyIndex}`;
    }

    const copiedNote = duplicateNote(note, title);
    updateProject(
      {
        ...project,
        notes: [...project.notes, copiedNote],
      },
      `Copied ${note.title}. Saved locally.`,
    );
    setSelectedNoteId(copiedNote.frontmatter.id);
    return copiedNote;
  }

  function promptRenameFolder(folder: string) {
    if (!project || folder === rootFolderId) {
      return;
    }

    const nextFolder = normalizeFolderPath(window.prompt("Rename folder", folder) ?? "");

    if (!nextFolder || nextFolder === folder) {
      return;
    }

    if (project.folders.includes(nextFolder)) {
      setSaveMessage(`${nextFolder} already exists.`);
      return;
    }

    updateProject(
      {
        ...project,
        folders: project.folders.map((candidate) =>
          candidate === folder ? nextFolder : candidate,
        ),
        notes: project.notes.map((note) =>
          noteFolderFromPath(note.path) === folder
            ? { ...note, path: notePathFor(note.title, nextFolder) }
            : note,
        ),
      },
      `Renamed folder ${folder} to ${nextFolder}. Saved locally.`,
    );
  }

  function promptDeleteFolder(folder: string) {
    if (!project || folder === rootFolderId) {
      return;
    }

    const notesInFolder = project.notes.filter((note) => noteFolderFromPath(note.path) === folder);
    const message = notesInFolder.length
      ? `Delete "${folder}" and move ${notesInFolder.length} note(s) to ${rootFolderLabel}?`
      : `Delete empty folder "${folder}"?`;

    if (!window.confirm(message)) {
      return;
    }

    updateProject(
      {
        ...project,
        folders: project.folders.filter((candidate) => candidate !== folder),
        notes: project.notes.map((note) =>
          noteFolderFromPath(note.path) === folder
            ? { ...note, path: notePathFor(note.title, rootFolderId) }
            : note,
        ),
      },
      notesInFolder.length
        ? `Deleted ${folder} and moved notes to ${rootFolderLabel}.`
        : `Deleted folder ${folder}.`,
    );
  }

  function moveNoteToFolder(noteId: string, folder: string): boolean {
    if (!project) {
      return false;
    }

    const targetFolder = normalizeFolderPath(folder);
    const note = project.notes.find((candidate) => candidate.frontmatter.id === noteId);

    if (!note || noteFolderFromPath(note.path) === targetFolder) {
      return false;
    }

    updateProject(
      {
        ...project,
        folders:
          targetFolder && !project.folders.includes(targetFolder)
            ? [...project.folders, targetFolder]
            : project.folders,
        notes: project.notes.map((candidate) =>
          candidate.frontmatter.id === noteId
            ? { ...candidate, path: notePathFor(candidate.title, targetFolder) }
            : candidate,
        ),
      },
      `Moved ${note.title} to ${targetFolder || rootFolderLabel}. Saved locally.`,
    );
    return true;
  }

  function resetProject() {
    repository.resetProject?.().then((demoProject) => {
      const nextProject = normalizeProject(demoProject);
      localStorage.setItem(storageKey, JSON.stringify(nextProject));
      setProject(nextProject);
      setSelectedNoteId(nextProject.notes[0]?.frontmatter.id ?? "");
      setSaveMessage("Welcome World restored and saved locally.");
    });
  }

  return {
    project,
    selectedNote,
    selectedNoteId,
    saveMessage,
    createFolder,
    createNote,
    createProject,
    copyNote,
    moveNoteToFolder,
    openOrCreateLinkedNote,
    promptDeleteFolder,
    promptDeleteNote,
    promptRenameFolder,
    promptRenameNote,
    resetProject,
    setSaveMessage,
    setSelectedNoteId,
    updateSelectedNoteContent,
  };
}

function readStoredProject(): ProjectData | null {
  try {
    const rawProject = localStorage.getItem(storageKey);

    if (!rawProject) {
      return null;
    }

    return JSON.parse(rawProject) as ProjectData;
  } catch {
    return null;
  }
}
