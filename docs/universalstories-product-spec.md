# WordLine Product Spec

WordLine is a local-first desktop writing and worldbuilding workstation in the RedFolder ecosystem. It has its own identity: a creative visual canvas for building stories, worlds, timelines, entities, and relationships from user-owned Markdown files.

The product is writer-first, but flexible enough for D&D campaigns, research, investigations, lore bibles, and other complex knowledge projects. Writers are the first target users; other modes should expand from that foundation without turning the app into a generic SaaS database.

## Core Principle

Important knowledge lives in Markdown. Advanced app behavior lives in optional sidecar files.

The app should never require users to lock their notes into a custom database format. A WordLine project should remain useful in any normal editor.

## Project Structure

```text
WordLine Project/
  notes/
    Red.md
    Battle of Ash.md
  data/
    relationships.json
    timelines.json
    graph-layouts.json
    calendars.json
    views.json
  assets/
  .wordline/
    index.db
    cache.json
```

## Note Format

Notes are normal `.md` files with optional YAML frontmatter.

```md
---
id: red
type: character
tags: [rebel, missing]
canon: true
---

# Red

Red disappeared after [[Battle of Ash]].
```

Required behavior:

- Markdown editing and preview.
- Wiki links using `[[Note Name]]`.
- Tags from frontmatter and inline Markdown.
- Backlinks generated from note content.
- Optional frontmatter metadata for type, canon status, sources, aliases, dates, and project-specific fields.
- Stable note IDs when present; filename-based identity as fallback.

## Sidecar Data

Sidecar files add richer behavior without owning the user's core writing.

- `relationships.json`: typed edges between notes/entities.
- `timelines.json`: events, ranges, eras, vague dates, and timeline views.
- `graph-layouts.json`: optional saved graph positions and display settings.
- `calendars.json`: custom calendars, fictional date systems, eras, and conversion rules.
- `views.json`: saved filters and workspace layouts.

Sidecar data should tolerate missing notes, renamed files, and partial metadata.

## MVP Scope

The first useful testable version should include:

1. Local project folder system.
2. Markdown note editor.
3. Tags and backlinks.
4. Custom entity types.
5. Custom relationship types.
6. Timeline connected to notes and events.
7. Graph connected to notes, entities, and relationships.
8. Custom calendars from the beginning.
9. Import for `.txt`, `.md`, and `.docx`.
10. Export and project portability.
11. Tutorial starter project.

AI and maps are intentionally out of scope for the MVP.

Notes are the first foundation. Timeline and graph should arrive early, but they need notes, entities, and relationships to have something meaningful to show.

## Primary Views

WordLine should begin with separate focused views rather than one giant all-purpose canvas.

```text
Left sidebar: notes, folders, tags, entities, saved views
Center workspace: notes / timeline / graph / later canvas
Right sidebar: metadata, relationships, backlinks, AI later
```

The interface should feel like a creative tool: closer to Obsidian, Figma, and visual storyboarding software than a corporate SaaS dashboard.

The first project experience should open into a small tutorial project that demonstrates a few notes, one character, one place, one event, one faction, one relationship, one timeline, one graph, and a custom calendar. Users should be able to delete it.

## Timeline

The timeline is one of the first major visual systems.

It must support:

- Real dates.
- Fictional dates.
- Vague dates.
- Eras.
- Years, months, days, and durations.
- Custom calendars.
- Events linked to notes.
- Timeline filters by entity, tag, type, canon status, and relationship.
- Dragging events to update dates.
- User-defined lanes.
- Optional causality arrows.
- Optional nested timelines.
- Multiple timelines per project.

The visual baseline is a clean horizontal line with zoom levels and optional detail. The app should not force every story into Gregorian time.

Time selection should not automatically control the graph by default. Any timeline-to-graph filtering should be explicit.

## Graph

The graph should feel like Obsidian's graph view, but richer and more editable.

It must show:

- Notes.
- Entities.
- Events.
- Relationship edges.
- Link edges from wiki links.
- Type, tag, time, and relationship filters.
- Optional saved layouts.
- Pinned nodes.
- Relationship labels, dates, and metadata.

The graph should be useful both for exploration and editing. Saved layout is helpful but should not become required project data.

## Extensibility

Users should be able to define:

- Object/entity types.
- Relationship types.
- Metadata fields.
- Strict or loose validation modes.
- Project templates such as story mode, notes mode, D&D mode, and research mode.

WordLine should provide defaults without making the defaults feel like rules.

## Import And Export

Import should support:

- `.md`
- `.txt`
- `.docx`

Export should support:

- Project folder copy/export.
- Markdown bundle.
- Relationship/timeline/graph sidecar JSON.
- Rich text or document export later.

## Future AI Direction

AI should be optional and post-MVP. Users bring their own key.

Future AI panel behavior:

- Summaries.
- Suggestions.
- Writing assistance.
- Contradiction checking.
- Timeline and graph analysis.
- User-controlled context selection.
- Preview of what is sent.
- Explicit approval before AI writes changes.

The first AI surface should be a side panel. Summaries, suggestions, and writing assistance are the first likely jobs.

## Emotional Goal

Help writers build worlds that feel alive by seeing how notes, people, events, places, and relationships change across time.
