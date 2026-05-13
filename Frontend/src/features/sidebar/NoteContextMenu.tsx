import { useEffect } from "react";
import type { Note } from "../../types";

export type NoteMenuState = {
  note: Note;
  x: number;
  y: number;
};

export function NoteContextMenu({
  menu,
  folders,
  onClose,
  onCopyNote,
  onDeleteNote,
  onMoveNote,
  onRenameNote,
  onSelectNote,
}: {
  menu: NoteMenuState;
  folders: string[];
  onClose: () => void;
  onCopyNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onMoveNote: (noteId: string, folder: string) => boolean;
  onRenameNote: (note: Note) => void;
  onSelectNote: (noteId: string) => void;
}) {
  useEffect(() => {
    function closeMenu() {
      onClose();
    }

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenu);
    };
  }, [onClose]);

  function run(action: () => void) {
    action();
    onClose();
  }

  return (
    <div
      className="note-context-menu"
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
      style={{ left: menu.x, top: menu.y }}
      role="menu"
    >
      <button onClick={() => run(() => onSelectNote(menu.note.frontmatter.id))} role="menuitem" type="button">
        <span>Open</span>
      </button>
      <button disabled role="menuitem" type="button">
        <span>Open to the right</span>
      </button>
      <button disabled role="menuitem" type="button">
        <span>Open in new window</span>
      </button>

      <hr />

      <button onClick={() => run(() => onCopyNote(menu.note))} role="menuitem" type="button">
        <span>Make a copy</span>
      </button>
      <MoveSubmenu
        folders={folders}
        note={menu.note}
        onMove={(folder) => run(() => onMoveNote(menu.note.frontmatter.id, folder))}
      />
      <button disabled role="menuitem" type="button">
        <span>Bookmark...</span>
      </button>
      <button disabled role="menuitem" type="button">
        <span>Link with file...</span>
      </button>

      <hr />

      <button
        onClick={() => run(() => navigator.clipboard?.writeText(menu.note.path))}
        role="menuitem"
        type="button"
      >
        <span>Copy path</span>
      </button>
      <button disabled role="menuitem" type="button">
        <span>Open version history</span>
      </button>

      <hr />

      <button disabled role="menuitem" type="button">
        <span>Open in default app</span>
      </button>
      <button disabled role="menuitem" type="button">
        <span>Show in file explorer</span>
      </button>

      <hr />

      <button onClick={() => run(() => onRenameNote(menu.note))} role="menuitem" type="button">
        <span>Rename...</span>
      </button>
      <button
        className="danger"
        onClick={() => run(() => onDeleteNote(menu.note))}
        role="menuitem"
        type="button"
      >
        <span>Delete</span>
      </button>
    </div>
  );
}

function MoveSubmenu({
  folders,
  note,
  onMove,
}: {
  folders: string[];
  note: Note;
  onMove: (folder: string) => void;
}) {
  if (!folders.length) {
    return (
      <button disabled role="menuitem" type="button">
        <span>Move file...</span>
      </button>
    );
  }

  return (
    <div className="context-submenu">
      <button role="menuitem" type="button">
        <span>Move file...</span>
        <small>{">"}</small>
      </button>
      <div className="context-submenu-panel">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onMove(folder)}
            type="button"
            disabled={note.path.includes(`/${folder}/`)}
          >
            {folder}
          </button>
        ))}
      </div>
    </div>
  );
}
