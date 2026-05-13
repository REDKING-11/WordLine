import { EditorPane } from "../editor/EditorPane";
import { GraphPanel } from "../graph/GraphPanel";
import type { GraphOptions } from "../../hooks/useGraphOptions";
import type { GraphEdge, GraphNode, Note, ProjectData } from "../../types";
import { EmptyWorkspace, PaneTab, TimelinePlaceholder } from "./AppShell";
import type { ViewMode } from "./shellTypes";

export function Workspace({
  activeView,
  graphEdges,
  graphNodes,
  graphOptions,
  project,
  selectedNote,
  selectedNoteId,
  onChangeNoteContent,
  onCreateEmptyNote,
  onOpenLink,
  onSelectGraphNode,
  onSetActiveView,
}: {
  activeView: ViewMode;
  graphEdges: GraphEdge[];
  graphNodes: GraphNode[];
  graphOptions: GraphOptions;
  project: ProjectData;
  selectedNote: Note | undefined;
  selectedNoteId: string;
  onChangeNoteContent: (content: string) => void;
  onCreateEmptyNote: () => void;
  onOpenLink: (title: string) => void;
  onSelectGraphNode: (node: GraphNode) => void;
  onSetActiveView: (view: ViewMode) => void;
}) {
  return (
    <section className="workspace" aria-label="Workspace">
      <div className="workspace-split">
        <section className="workspace-pane editor-workspace-pane">
          <PaneTab
            isActive={activeView === "notes"}
            onSelect={() => onSetActiveView("notes")}
            title={selectedNote?.title ?? "No note selected"}
          />
          {activeView === "timeline" ? (
            <TimelinePlaceholder />
          ) : selectedNote ? (
            <EditorPane
              note={selectedNote}
              project={project}
              onChangeContent={onChangeNoteContent}
              onOpenLink={onOpenLink}
            />
          ) : (
            <EmptyWorkspace onCreateNote={onCreateEmptyNote} />
          )}
        </section>

        <section className="workspace-pane graph-workspace-pane">
          <PaneTab
            isActive={activeView === "graph"}
            onSelect={() => onSetActiveView("graph")}
            title="Graph"
          />
          <GraphPanel
            edges={graphEdges}
            nodes={graphNodes}
            options={graphOptions}
            selectedNodeId={selectedNote?.frontmatter.id ?? selectedNoteId}
            onSelectNode={onSelectGraphNode}
          />
        </section>
      </div>
    </section>
  );
}
