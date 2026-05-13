export type NoteFrontmatter = {
  id: string;
  type?: string;
  tags: string[];
  canon?: boolean;
  aliases?: string[];
  sources?: string[];
};

export type Note = {
  path: string;
  title: string;
  content: string;
  frontmatter: NoteFrontmatter;
};

export type RelationshipType = {
  id: string;
  label: string;
  directed: boolean;
  description?: string;
};

export type Relationship = {
  id: string;
  type: string;
  from: string;
  to: string;
  canon?: boolean;
  source?: string;
};

export type GraphNode = {
  id: string;
  title: string;
  type?: string;
  tags: string[];
  missing?: boolean;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  kind: "wiki-link" | "relationship";
  label: string;
};

export type Backlink = {
  fromId: string;
  fromTitle: string;
};

export type ProjectData = {
  name: string;
  locationLabel?: string;
  folders: string[];
  notes: Note[];
  relationshipTypes: RelationshipType[];
  relationships: Relationship[];
};

export type ProjectRepository = {
  loadProject: () => Promise<ProjectData>;
  saveNote: (noteId: string, content: string) => Promise<Note>;
  saveProject?: (project: ProjectData) => Promise<ProjectData>;
  resetProject?: () => Promise<ProjectData>;
};
