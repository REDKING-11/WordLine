import type { Note, ProjectData, ProjectRepository } from "../types";
import { noteFolderFromPath, parseNote } from "./markdown";

const noteSources = [
  {
    path: "notes/Mira Vale.md",
    content: `---
id: mira-vale
type: character
tags: [cartographer, witness]
canon: true
aliases: [Mira]
sources: [field-journal]
---

# Mira Vale

Mira Vale is a careful cartographer who keeps finding impossible changes in the border roads near [[Lantern Hill]].

She was present during [[The Bellfall]] and later joined the [[Archive Circle]] as a reluctant witness.

## Open Questions

- Why did Mira's map change before the bell fell?
- Who warned her not to return to Lantern Hill?
`,
  },
  {
    path: "notes/Lantern Hill.md",
    content: `---
id: lantern-hill
type: place
tags: [borderland, old-road]
canon: true
---

# Lantern Hill

Lantern Hill is a small ridge town built around a signal tower and an older buried road.

The town became famous after [[The Bellfall]], when the tower bell rang once underground.
`,
  },
  {
    path: "notes/The Bellfall.md",
    content: `---
id: bellfall
type: event
tags: [mystery, turning-point]
canon: true
---

# The Bellfall

The Bellfall is the night the tower bell of [[Lantern Hill]] vanished from its frame and rang once from beneath the town.

[[Mira Vale]] recorded the sound in her field journal. The [[Archive Circle]] later sealed the original account.
`,
  },
  {
    path: "notes/Archive Circle.md",
    content: `---
id: archive-circle
type: faction
tags: [scholars, secretive]
canon: true
---

# Archive Circle

The Archive Circle preserves dangerous records and decides which stories become public history.

After [[The Bellfall]], the Circle recruited [[Mira Vale]] and restricted travel through [[Lantern Hill]].
`,
  },
];

export class DemoProjectRepository implements ProjectRepository {
  private project: ProjectData;

  constructor() {
    this.project = createDemoProject();
  }

  async loadProject(): Promise<ProjectData> {
    return structuredClone(this.project);
  }

  async saveProject(project: ProjectData): Promise<ProjectData> {
    this.project = structuredClone(project);
    return structuredClone(this.project);
  }

  async resetProject(): Promise<ProjectData> {
    this.project = createDemoProject();
    return structuredClone(this.project);
  }

  async saveNote(noteId: string, content: string): Promise<Note> {
    const index = this.project.notes.findIndex((note) => note.frontmatter.id === noteId);

    if (index === -1) {
      throw new Error(`Note ${noteId} was not found.`);
    }

    const currentNote = this.project.notes[index];
    const updatedNote = parseNote(currentNote.path, content);
    this.project.notes[index] = updatedNote;
    return structuredClone(updatedNote);
  }
}

function createDemoProject(): ProjectData {
  const notes = noteSources.map((note) => parseNote(note.path, note.content));

  return {
      name: "Welcome World",
      locationLabel: "Bundled tutorial project",
      folders: Array.from(new Set(notes.map((note) => noteFolderFromPath(note.path)).filter(Boolean))),
      notes,
      relationshipTypes: [
        {
          id: "member-of",
          label: "Member of",
          directed: true,
          description: "A person belongs to an organization, faction, group, or household.",
        },
        {
          id: "witnessed",
          label: "Witnessed",
          directed: true,
          description: "A person directly witnessed an event.",
        },
        {
          id: "located-at",
          label: "Located at",
          directed: true,
          description: "An event or entity is associated with a place.",
        },
      ],
      relationships: [
        {
          id: "rel-mira-archive",
          type: "member-of",
          from: "mira-vale",
          to: "archive-circle",
          canon: true,
        },
        {
          id: "rel-mira-bellfall",
          type: "witnessed",
          from: "mira-vale",
          to: "bellfall",
          canon: true,
          source: "Mira Vale.md",
        },
        {
          id: "rel-bellfall-lantern-hill",
          type: "located-at",
          from: "bellfall",
          to: "lantern-hill",
          canon: true,
        },
      ],
    };
}
