import { useMemo, useState } from "react";
import { ContextPanel } from "./features/context/ContextPanel";
import { filterGraph } from "./features/graph/graphFilters";
import { AppShell } from "./features/shell/AppShell";
import type { StartupMode, ViewMode } from "./features/shell/shellTypes";
import { Workspace } from "./features/shell/Workspace";
import { ProjectSidebar } from "./features/sidebar/ProjectSidebar";
import { CreateProjectScreen } from "./features/startup/CreateProjectScreen";
import { StartupLauncher } from "./features/startup/StartupLauncher";
import { useGraphOptions } from "./hooks/useGraphOptions";
import { useProjectFilters } from "./hooks/useProjectFilters";
import { useProjectState } from "./hooks/useProjectState";
import { buildBacklinks, buildGraph, getRelationshipsForNote } from "./project/graph";
import type { SortOrder } from "./project/folders";
import type { GraphNode } from "./types";
import "./styles/base.css";

function App() {
  const [activeType, setActiveType] = useState("all");
  const [activeView, setActiveView] = useState<ViewMode>("notes");
  const [startupMode, setStartupMode] = useState<StartupMode>("launcher");
  const [searchInput, setSearchInput] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");
  const [isContextPanelVisible, setIsContextPanelVisible] = useState(true);
  const [graphOptions, setGraphOptions] = useGraphOptions();

  const projectState = useProjectState();
  const {
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
    setSaveMessage,
    setSelectedNoteId,
    updateSelectedNoteContent,
  } = projectState;

  const { folderGroups, noteTypes } = useProjectFilters(
    project,
    activeType,
    searchInput,
    sortOrder,
  );

  const graph = useMemo(
    () => (project ? buildGraph(project) : { nodes: [], edges: [] }),
    [project],
  );

  const visibleGraph = useMemo(
    () => filterGraph(graph.nodes, graph.edges, graphOptions, selectedNoteId),
    [graph, graphOptions, selectedNoteId],
  );

  const backlinks = useMemo(
    () => (project && selectedNote ? buildBacklinks(project, selectedNote.frontmatter.id) : []),
    [project, selectedNote],
  );

  const relationships = useMemo(
    () =>
      project && selectedNote
        ? getRelationshipsForNote(project, selectedNote.frontmatter.id)
        : [],
    [project, selectedNote],
  );

  function handleOpenLink(title: string) {
    openOrCreateLinkedNote(title);
    setActiveView("notes");
  }

  function handleGraphNodeSelect(node: GraphNode) {
    if (node.missing) {
      handleOpenLink(node.title);
      return;
    }

    setSelectedNoteId(node.id);
  }

  if (!project) {
    return <main className="loading-shell">Preparing WordLine...</main>;
  }

  if (startupMode === "launcher") {
    return (
      <StartupLauncher
        onCreateProject={() => setStartupMode("create-project")}
        onOpenProject={() =>
          setSaveMessage("Opening project folders will use the future desktop repository.")
        }
        onOpenTutorial={() => setStartupMode("workspace")}
      />
    );
  }

  if (startupMode === "create-project") {
    return (
      <CreateProjectScreen
        onBack={() => setStartupMode("launcher")}
        onCreateProject={(projectName, locationLabel) => {
          createProject(projectName, locationLabel);
          setStartupMode("workspace");
        }}
      />
    );
  }

  return (
    <AppShell
      activeView={activeView}
      isContextPanelVisible={isContextPanelVisible}
      onSetActiveView={setActiveView}
    >
      <ProjectSidebar
        activeType={activeType}
        folderGroups={folderGroups}
        noteTypes={noteTypes}
        project={project}
        saveMessage={saveMessage}
        searchInput={searchInput}
        selectedNoteId={selectedNoteId}
        sortOrder={sortOrder}
        onChangeSortOrder={() => setSortOrder((current) => (current === "az" ? "za" : "az"))}
        onCreateFolder={createFolder}
        onCreateNote={(title, folder, type) => {
          const note = createNote(title, folder, type);
          if (note) {
            setActiveView("notes");
          }
          return note;
        }}
        onCopyNote={copyNote}
        onDeleteFolder={promptDeleteFolder}
        onDeleteNote={promptDeleteNote}
        onMoveNote={moveNoteToFolder}
        onRenameFolder={promptRenameFolder}
        onRenameNote={promptRenameNote}
        onSearchChange={setSearchInput}
        onSelectNote={setSelectedNoteId}
        onSetActiveType={setActiveType}
      />

      <Workspace
        activeView={activeView}
        graphEdges={visibleGraph.edges}
        graphNodes={visibleGraph.nodes}
        graphOptions={graphOptions}
        project={project}
        selectedNote={selectedNote}
        selectedNoteId={selectedNoteId}
        onChangeNoteContent={updateSelectedNoteContent}
        onCreateEmptyNote={() => createNote("Untitled", "", "note")}
        onOpenLink={handleOpenLink}
        onSelectGraphNode={handleGraphNodeSelect}
        onSetActiveView={setActiveView}
      />

      <ContextPanel
        backlinks={backlinks}
        edgeCount={visibleGraph.edges.length}
        graphOptions={graphOptions}
        isVisible={isContextPanelVisible}
        nodeCount={visibleGraph.nodes.length}
        note={selectedNote}
        relationships={relationships}
        onChangeGraphOptions={setGraphOptions}
        onHide={() => setIsContextPanelVisible(false)}
        onSelectNote={setSelectedNoteId}
        onShow={() => setIsContextPanelVisible(true)}
      />
    </AppShell>
  );
}

export default App;
