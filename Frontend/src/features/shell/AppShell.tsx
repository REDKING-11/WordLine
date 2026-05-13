import type { ReactNode } from "react";
import type { ViewMode } from "./shellTypes";
import "./shell.css";

export function AppShell({
  activeView,
  children,
  isContextPanelVisible,
  onSetActiveView,
}: {
  activeView: ViewMode;
  children: ReactNode;
  isContextPanelVisible: boolean;
  onSetActiveView: (view: ViewMode) => void;
}) {
  return (
    <main className={isContextPanelVisible ? "app-shell" : "app-shell context-hidden"}>
      <ActivityRail activeView={activeView} onSetActiveView={onSetActiveView} />
      {children}
    </main>
  );
}

function ActivityRail({
  activeView,
  onSetActiveView,
}: {
  activeView: ViewMode;
  onSetActiveView: (view: ViewMode) => void;
}) {
  return (
    <aside className="activity-rail" aria-label="Primary tools">
      <button
        className={activeView === "notes" ? "active" : ""}
        title="Files"
        type="button"
        onClick={() => onSetActiveView("notes")}
      >
        F
      </button>
      <button
        className={activeView === "graph" ? "active" : ""}
        title="Graph"
        type="button"
        onClick={() => onSetActiveView("graph")}
      >
        G
      </button>
      <button
        className={activeView === "timeline" ? "active" : ""}
        title="Timeline"
        type="button"
        onClick={() => onSetActiveView("timeline")}
      >
        T
      </button>
      <button title="Relationships" type="button">
        R
      </button>
      <button title="Settings" type="button">
        S
      </button>
    </aside>
  );
}

export function PaneTab({
  title,
  isActive,
  onSelect,
}: {
  title: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="pane-tab">
      <button className={isActive ? "active" : ""} onClick={onSelect} type="button">
        {title}
      </button>
      <button aria-label={`Close ${title}`} type="button">
        x
      </button>
      <button aria-label={`New tab near ${title}`} type="button">
        +
      </button>
    </div>
  );
}

export function EmptyWorkspace({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <section className="empty-workspace">
      <h2>No note selected</h2>
      <p>Create a note or select one from the sidebar to start writing.</p>
      <button onClick={onCreateNote} type="button">
        New note
      </button>
    </section>
  );
}

export function TimelinePlaceholder() {
  return (
    <section className="timeline-placeholder">
      <span className="eyebrow">Next visual system</span>
      <h2>Timeline waits until the notes and graph foundation is solid.</h2>
      <p>
        The prototype keeps this view visible so the app shape is honest, but the first
        implementation slice is the Markdown editor connected to the graph.
      </p>
    </section>
  );
}
