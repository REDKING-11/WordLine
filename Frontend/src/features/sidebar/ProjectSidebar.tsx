import { useState } from "react";
import type { DragEvent, FormEvent } from "react";
import { noteFolderFromPath } from "../../project/markdown";
import { rootFolderId, rootFolderLabel, toggleSetValue } from "../../project/folders";
import type { FolderGroupData } from "../../project/folders";
import type { SortOrder } from "../../project/folders";
import type { Note, ProjectData } from "../../types";
import { FolderGroup } from "./FolderGroup";
import { NoteContextMenu } from "./NoteContextMenu";
import type { NoteMenuState } from "./NoteContextMenu";
import "./sidebar.css";

type CreateMode = "note" | "folder" | null;

export function ProjectSidebar({
  activeType,
  folderGroups,
  noteTypes,
  project,
  saveMessage,
  searchInput,
  selectedNoteId,
  sortOrder,
  onChangeSortOrder,
  onCreateFolder,
  onCreateNote,
  onCopyNote,
  onDeleteFolder,
  onDeleteNote,
  onMoveNote,
  onRenameFolder,
  onRenameNote,
  onSearchChange,
  onSelectNote,
  onSetActiveType,
}: {
  activeType: string;
  folderGroups: FolderGroupData[];
  noteTypes: string[];
  project: ProjectData;
  saveMessage: string;
  searchInput: string;
  selectedNoteId: string;
  sortOrder: SortOrder;
  onChangeSortOrder: () => void;
  onCreateFolder: (folderName: string) => boolean;
  onCreateNote: (title: string, folder: string, type: string) => Note | null;
  onCopyNote: (note: Note) => Note | null;
  onDeleteFolder: (folder: string) => void;
  onDeleteNote: (note: Note) => void;
  onMoveNote: (noteId: string, folder: string) => boolean;
  onRenameFolder: (folder: string) => void;
  onRenameNote: (note: Note) => void;
  onSearchChange: (value: string) => void;
  onSelectNote: (noteId: string) => void;
  onSetActiveType: (type: string) => void;
}) {
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [noteTitleInput, setNoteTitleInput] = useState("");
  const [noteTypeInput, setNoteTypeInput] = useState("note");
  const [folderInput, setFolderInput] = useState("");
  const [targetFolderInput, setTargetFolderInput] = useState(rootFolderId);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [noteMenu, setNoteMenu] = useState<NoteMenuState | null>(null);

  function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = onCreateNote(noteTitleInput, targetFolderInput, noteTypeInput);

    if (!note) {
      return;
    }

    setCreateMode(null);
    setNoteTitleInput("");
  }

  function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onCreateFolder(folderInput)) {
      return;
    }

    setCreateMode(null);
    setFolderInput("");
  }

  function handleNoteDragStart(event: DragEvent<HTMLButtonElement>, noteId: string) {
    event.dataTransfer.setData("text/plain", noteId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleFolderDrop(event: DragEvent<HTMLElement>, folder: string) {
    event.preventDefault();
    const noteId = event.dataTransfer.getData("text/plain");

    if (noteId) {
      onMoveNote(noteId, folder);
    }

    setDragOverFolder(null);
  }

  function expandAllFolders() {
    setCollapsedFolders(new Set());
  }

  function toggleAutoRevealCurrentFile() {
    const selectedNote = project.notes.find((note) => note.frontmatter.id === selectedNoteId);

    if (!selectedNote) {
      return;
    }

    const folder = noteFolderFromPath(selectedNote.path);
    setCollapsedFolders((current) => {
      const nextFolders = new Set(current);
      nextFolders.delete(folder);
      return nextFolders;
    });
  }

  return (
    <aside className="sidebar left-sidebar" aria-label="Project navigation">
      <div className="brand-block">
        <span className="eyebrow">WordLine</span>
        <h1>{project.name}</h1>
        <p>{project.locationLabel ?? "Prototype project"}</p>
      </div>

      <section className="sidebar-toolbar" aria-label="Project actions">
        <button
          aria-label="New note"
          onClick={() => setCreateMode(createMode === "note" ? null : "note")}
          title="New note"
          type="button"
        >
          <span aria-hidden="true">□</span>
          <i aria-hidden="true">/</i>
        </button>
        <button
          aria-label="New folder"
          onClick={() => setCreateMode(createMode === "folder" ? null : "folder")}
          title="New folder"
          type="button"
        >
          <span aria-hidden="true">□</span>
          <i aria-hidden="true">+</i>
        </button>
        <button
          aria-label="Change sort order"
          onClick={onChangeSortOrder}
          title={`Change sort order (${sortOrder === "az" ? "A-Z" : "Z-A"})`}
          type="button"
        >
          <span aria-hidden="true">↑</span>
          <i aria-hidden="true">≡</i>
        </button>
        <button
          aria-label="Auto-reveal current file"
          onClick={toggleAutoRevealCurrentFile}
          title="Auto-reveal current file"
          type="button"
        >
          <span aria-hidden="true">▭</span>
        </button>
        <button
          aria-label="Expand all"
          onClick={expandAllFolders}
          title="Expand all"
          type="button"
        >
          <span aria-hidden="true">⌄</span>
          <i aria-hidden="true">⌃</i>
        </button>
        <small>{saveMessage}</small>
      </section>

      {createMode === "note" && (
        <form className="quick-create" onSubmit={handleCreateNote}>
          <label>
            <span>Note title</span>
            <input
              autoFocus
              onChange={(event) => setNoteTitleInput(event.currentTarget.value)}
              placeholder="Red, Battle of Ash..."
              value={noteTitleInput}
            />
          </label>
          <label>
            <span>Folder</span>
            <select
              onChange={(event) => setTargetFolderInput(event.currentTarget.value)}
              value={targetFolderInput}
            >
              <option value={rootFolderId}>{rootFolderLabel}</option>
              {project.folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <input
              onChange={(event) => setNoteTypeInput(event.currentTarget.value)}
              value={noteTypeInput}
            />
          </label>
          <div className="quick-create-actions">
            <button type="submit">Create</button>
            <button onClick={() => setCreateMode(null)} type="button">
              Cancel
            </button>
          </div>
        </form>
      )}

      {createMode === "folder" && (
        <form className="quick-create" onSubmit={handleCreateFolder}>
          <label>
            <span>Folder name</span>
            <input
              autoFocus
              onChange={(event) => setFolderInput(event.currentTarget.value)}
              placeholder="Characters, Places, Timeline..."
              value={folderInput}
            />
          </label>
          <div className="quick-create-actions">
            <button type="submit">Create</button>
            <button onClick={() => setCreateMode(null)} type="button">
              Cancel
            </button>
          </div>
        </form>
      )}

      <section>
        <h2>Search</h2>
        <input
          className="sidebar-search"
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Find notes, tags, types..."
          value={searchInput}
        />
      </section>

      <section>
        <h2>Types</h2>
        <div className="filter-row">
          <button
            className={activeType === "all" ? "active" : ""}
            onClick={() => onSetActiveType("all")}
            type="button"
          >
            All
          </button>
          {noteTypes.map((type) => (
            <button
              className={activeType === type ? "active" : ""}
              key={type}
              onClick={() => onSetActiveType(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Project</h2>
        <nav className="folder-list" aria-label="Notes and folders">
          {folderGroups.length ? (
            folderGroups.map((group) => (
              <FolderGroup
                collapsed={collapsedFolders.has(group.folder)}
                dragOverFolder={dragOverFolder}
                folder={group.folder}
                key={group.folder || "root"}
                notes={group.notes}
                selectedNoteId={selectedNoteId}
                onDeleteFolder={onDeleteFolder}
                onDragOverFolder={setDragOverFolder}
                onDragStart={handleNoteDragStart}
                onDrop={handleFolderDrop}
                onRenameFolder={onRenameFolder}
                onSelectNote={onSelectNote}
                onShowNoteMenu={setNoteMenu}
                onToggleFolder={(folder) =>
                  setCollapsedFolders((current) => toggleSetValue(current, folder))
                }
              />
            ))
          ) : (
            <p className="empty-state">
              {searchInput || activeType !== "all"
                ? "No notes match the current filter."
                : "No notes yet. Create one to start the project."}
            </p>
          )}
        </nav>
      </section>
      {noteMenu && (
        <NoteContextMenu
          folders={project.folders}
          menu={noteMenu}
          onClose={() => setNoteMenu(null)}
          onCopyNote={onCopyNote}
          onDeleteNote={onDeleteNote}
          onMoveNote={onMoveNote}
          onRenameNote={onRenameNote}
          onSelectNote={onSelectNote}
        />
      )}
    </aside>
  );
}
