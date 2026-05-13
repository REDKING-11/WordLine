import type { DragEvent } from "react";
import { rootFolderId, rootFolderLabel } from "../../project/folders";
import type { Note } from "../../types";
import type { NoteMenuState } from "./NoteContextMenu";

export function FolderGroup({
  folder,
  notes,
  selectedNoteId,
  collapsed,
  dragOverFolder,
  onDeleteFolder,
  onDragOverFolder,
  onDragStart,
  onDrop,
  onRenameFolder,
  onSelectNote,
  onShowNoteMenu,
  onToggleFolder,
}: {
  folder: string;
  notes: Note[];
  selectedNoteId: string;
  collapsed: boolean;
  dragOverFolder: string | null;
  onDeleteFolder: (folder: string) => void;
  onDragOverFolder: (folder: string | null) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>, noteId: string) => void;
  onDrop: (event: DragEvent<HTMLElement>, folder: string) => void;
  onRenameFolder: (folder: string) => void;
  onSelectNote: (noteId: string) => void;
  onShowNoteMenu: (menu: NoteMenuState) => void;
  onToggleFolder: (folder: string) => void;
}) {
  const isRoot = folder === rootFolderId;
  const label = isRoot ? rootFolderLabel : folder;

  return (
    <section
      className={dragOverFolder === folder ? "folder-group drop-target" : "folder-group"}
      onDragLeave={() => onDragOverFolder(null)}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverFolder(folder);
      }}
      onDrop={(event) => onDrop(event, folder)}
    >
      <div className="folder-header">
        <button onClick={() => onToggleFolder(folder)} type="button">
          <span>{collapsed ? ">" : "v"}</span>
          {label}
        </button>
        <small>{notes.length}</small>
        {!isRoot && (
          <div className="folder-actions">
            <button aria-label={`Rename ${folder}`} onClick={() => onRenameFolder(folder)} type="button">
              Rename
            </button>
            <button aria-label={`Delete ${folder}`} onClick={() => onDeleteFolder(folder)} type="button">
              Delete
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="note-list">
          {notes.length ? (
            notes.map((note) => (
              <div className="note-row" key={note.frontmatter.id}>
                <button
                  className={
                    note.frontmatter.id === selectedNoteId
                      ? "note-button active"
                      : "note-button"
                  }
                  draggable
                  onClick={() => onSelectNote(note.frontmatter.id)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    onSelectNote(note.frontmatter.id);
                    onShowNoteMenu({
                      note,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
                  onDragStart={(event) => onDragStart(event, note.frontmatter.id)}
                  type="button"
                >
                  <span>{note.title}</span>
                  <small>{note.frontmatter.type ?? "note"}</small>
                </button>
              </div>
            ))
          ) : (
            <p className="empty-state">Drop notes here or create one in this folder.</p>
          )}
        </div>
      )}
    </section>
  );
}
