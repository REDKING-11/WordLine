import type { GraphOptions } from "../../hooks/useGraphOptions";
import type { Backlink, Note } from "../../types";
import { GraphControls } from "./GraphControls";
import "./context.css";

type RelationshipView = {
  id: string;
  label: string;
  fromTitle: string;
  toTitle: string;
};

export function ContextPanel({
  backlinks,
  edgeCount,
  graphOptions,
  isVisible,
  nodeCount,
  note,
  relationships,
  onChangeGraphOptions,
  onHide,
  onSelectNote,
  onShow,
}: {
  backlinks: Backlink[];
  edgeCount: number;
  graphOptions: GraphOptions;
  isVisible: boolean;
  nodeCount: number;
  note: Note | undefined;
  relationships: RelationshipView[];
  onChangeGraphOptions: (options: GraphOptions) => void;
  onHide: () => void;
  onSelectNote: (noteId: string) => void;
  onShow: () => void;
}) {
  if (!isVisible) {
    return (
      <button
        className="context-restore-button"
        onClick={onShow}
        title="Show metadata"
        type="button"
      >
        Metadata
      </button>
    );
  }

  return (
    <aside className="sidebar right-sidebar" aria-label="Context panel">
      <div className="context-panel-header">
        <div>
          <span className="eyebrow">Context</span>
          <h2>Metadata</h2>
        </div>
        <button onClick={onHide} type="button">
          Hide
        </button>
      </div>
      {note ? (
        <>
          <section>
            <h2>Metadata</h2>
            <dl className="metadata-list">
              <div>
                <dt>ID</dt>
                <dd>{note.frontmatter.id}</dd>
              </div>
              <div>
                <dt>Path</dt>
                <dd>{note.path}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{note.frontmatter.type ?? "note"}</dd>
              </div>
              <div>
                <dt>Tags</dt>
                <dd>{note.frontmatter.tags.join(", ") || "None"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{note.frontmatter.canon ? "Canon" : "Draft"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Backlinks</h2>
            <ul className="context-list">
              {backlinks.length ? (
                backlinks.map((backlink) => (
                  <li key={backlink.fromId}>
                    <button onClick={() => onSelectNote(backlink.fromId)} type="button">
                      {backlink.fromTitle}
                    </button>
                  </li>
                ))
              ) : (
                <li>No backlinks yet</li>
              )}
            </ul>
          </section>

          <section>
            <h2>Relationships</h2>
            <ul className="context-list relationship-list">
              {relationships.length ? (
                relationships.map((relationship) => (
                  <li key={relationship.id}>
                    <strong>{relationship.label}</strong>
                    <span>
                      {relationship.fromTitle} {"->"} {relationship.toTitle}
                    </span>
                  </li>
                ))
              ) : (
                <li>No relationships yet</li>
              )}
            </ul>
          </section>
        </>
      ) : (
        <section>
          <h2>Context</h2>
          <p className="empty-state">Select or create a note to see metadata and backlinks.</p>
        </section>
      )}

      <section>
        <h2>Graph Controls</h2>
        <GraphControls
          edgeCount={edgeCount}
          nodeCount={nodeCount}
          options={graphOptions}
          onChange={onChangeGraphOptions}
        />
      </section>
    </aside>
  );
}
