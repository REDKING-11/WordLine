import type { Backlink, GraphEdge, GraphNode, Note, ProjectData } from "../types";
import { extractWikiLinks } from "./markdown";

const graphPositions: Record<string, { x: number; y: number }> = {
  "mira-vale": { x: 130, y: 210 },
  "lantern-hill": { x: 420, y: 210 },
  bellfall: { x: 275, y: 80 },
  "archive-circle": { x: 275, y: 340 },
};

export function buildGraph(project: ProjectData): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const titleToId = createTitleMap(project.notes);
  const unresolvedLinkTitles = new Map<string, string>();

  const nodes = project.notes.map((note, index) => ({
    id: note.frontmatter.id,
    title: note.title,
    type: note.frontmatter.type,
    tags: note.frontmatter.tags,
    missing: false,
    x: graphPositions[note.frontmatter.id]?.x ?? 120 + index * 80,
    y: graphPositions[note.frontmatter.id]?.y ?? 160 + index * 40,
  }));

  const wikiEdges = project.notes.flatMap((note) =>
    extractWikiLinks(note.content)
      .map((title) => {
        const normalizedTitle = normalizeTitle(title);
        const existingTargetId = titleToId.get(normalizedTitle);
        const targetId = existingTargetId ?? `missing-${slugify(title)}`;

        if (!existingTargetId) {
          unresolvedLinkTitles.set(targetId, title);
        }

        return {
          title,
          targetId,
        };
      })
      .map(({ targetId }) => ({
        id: `wiki-${note.frontmatter.id}-${targetId}`,
        from: note.frontmatter.id,
        to: targetId,
        kind: "wiki-link" as const,
        label: "links to",
      })),
  );

  const missingNodes = Array.from(unresolvedLinkTitles.entries()).map(
    ([id, title], index) => ({
      id,
      title,
      type: "uncreated",
      tags: [],
      missing: true,
      x: 430 + index * 70,
      y: 110 + index * 90,
    }),
  );

  const relationshipEdges = project.relationships.map((relationship) => {
    const relationshipType = project.relationshipTypes.find(
      (type) => type.id === relationship.type,
    );

    return {
      id: relationship.id,
      from: relationship.from,
      to: relationship.to,
      kind: "relationship" as const,
      label: relationshipType?.label ?? relationship.type,
    };
  });

  return {
    nodes: [...nodes, ...missingNodes],
    edges: dedupeEdges([...wikiEdges, ...relationshipEdges]),
  };
}

export function buildBacklinks(project: ProjectData, noteId: string): Backlink[] {
  const target = project.notes.find((note) => note.frontmatter.id === noteId);

  if (!target) {
    return [];
  }

  return project.notes
    .filter((note) => note.frontmatter.id !== noteId)
    .filter((note) =>
      extractWikiLinks(note.content).some(
        (link) => normalizeTitle(link) === normalizeTitle(target.title),
      ),
    )
    .map((note) => ({
      fromId: note.frontmatter.id,
      fromTitle: note.title,
    }));
}

export function getRelationshipsForNote(project: ProjectData, noteId: string) {
  return project.relationships
    .filter((relationship) => relationship.from === noteId || relationship.to === noteId)
    .map((relationship) => {
      const relationshipType = project.relationshipTypes.find(
        (type) => type.id === relationship.type,
      );
      const from = project.notes.find((note) => note.frontmatter.id === relationship.from);
      const to = project.notes.find((note) => note.frontmatter.id === relationship.to);

      return {
        ...relationship,
        label: relationshipType?.label ?? relationship.type,
        fromTitle: from?.title ?? relationship.from,
        toTitle: to?.title ?? relationship.to,
      };
    });
}

function createTitleMap(notes: Note[]): Map<string, string> {
  const titleMap = new Map<string, string>();

  for (const note of notes) {
    titleMap.set(normalizeTitle(note.title), note.frontmatter.id);

    for (const alias of note.frontmatter.aliases ?? []) {
      titleMap.set(normalizeTitle(alias), note.frontmatter.id);
    }
  }

  return titleMap;
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();

  return edges.filter((edge) => {
    const key = `${edge.kind}-${edge.from}-${edge.to}-${edge.label}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
