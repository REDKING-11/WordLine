import { rootFolderLabel } from "../../project/folders";
import { noteFolderFromPath } from "../../project/markdown";
import type { Note, ProjectData } from "../../types";
import { MarkdownCodeMirrorEditor } from "./MarkdownCodeMirrorEditor";
import "./editor.css";

export function EditorPane({
  note,
  project,
  onChangeContent,
  onOpenLink,
}: {
  note: Note;
  project: ProjectData;
  onChangeContent: (content: string) => void;
  onOpenLink: (title: string) => void;
}) {
  return (
    <article className="editor-pane">
      <div className="note-meta">
        <span>{note.frontmatter.type ?? "note"}</span>
        <span>{noteFolderFromPath(note.path) || rootFolderLabel}</span>
        {note.frontmatter.canon && <span>canon</span>}
        {note.frontmatter.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <h2>{note.title}</h2>
      <MarkdownCodeMirrorEditor
        content={note.content}
        onChangeContent={onChangeContent}
        onOpenLink={onOpenLink}
        project={project}
      />
    </article>
  );
}
