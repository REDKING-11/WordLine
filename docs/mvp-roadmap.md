# WordLine MVP Roadmap

This roadmap defines the first useful testable version, not a full public release.

## Prototype Status

The current working build is a Vite-first React/TypeScript prototype in `Frontend`. Tauri remains the intended desktop shell, but desktop compilation is parked until the Windows MSVC Build Tools dependency is available.

Implemented prototype slices:

- Welcome World starter project bundled in frontend source.
- LocalStorage persistence for prototype project state.
- Notes, folders, search, create, rename, delete, and drag-to-folder movement.
- CodeMirror 6 Markdown editor with live note updates.
- Live Markdown preview decorations for headings, emphasis, links, wiki links, lists, blockquotes, inline code, and strike text.
- Backlinks and graph updates from edited Markdown.
- Graph panel with wiki-link edges and relationship sidecar edges.
- Hideable right metadata/context panel.

Still prototype-only:

- Project data is not file-backed yet.
- Save/open/import/export controls are visual or deferred.
- Timeline is a placeholder.
- Custom calendars are present in tutorial data but not editable in UI yet.

## Phase 1: Project Format

- Create and open a local project folder.
- Ensure the expected `notes/`, `data/`, `assets/`, and `.wordline/` folders exist.
- Parse Markdown notes and optional YAML frontmatter.
- Build a lightweight local index for note IDs, titles, tags, types, links, and backlinks.
- Keep the app functional even if sidecar files are missing.
- Open new projects with a small tutorial starter project available.

## Phase 2: Notes Foundation

- Markdown editor with file-backed saves.
- Note list and folder list.
- Basic search.
- Tag extraction.
- Backlink panel.
- Metadata editor for common fields: `id`, `type`, `tags`, `canon`, `aliases`, `sources`.
- Wiki link creation that resolves a note/entity after the user commits a link such as `[[Red]]`.

## Phase 3: Custom Types And Relationships

- Project-level entity type definitions.
- Project-level relationship type definitions.
- Relationship editor in the right sidebar.
- Store relationship data in `data/relationships.json`.
- Show relationship references inside notes without rewriting note bodies.

## Phase 4: Timeline

- Store timeline definitions in `data/timelines.json`.
- Support real dates, fictional dates, vague dates, durations, and eras.
- Load custom calendars from `data/calendars.json`.
- Link events to notes.
- Filter by note type, tags, canon status, and involved entities.
- Support user-defined lanes.
- Support event dragging for date changes.
- Allow optional causality arrows and nested timelines if the data model can support them cleanly.

## Phase 5: Graph

- Build graph nodes from notes and entities.
- Build graph edges from wiki links and relationship sidecars.
- Provide filters by type, tag, relationship, and canon status.
- Store optional graph layouts in `data/graph-layouts.json`.
- Allow graph exploration first, then editing.
- Allow pinned nodes.
- Do not make timeline selection automatically control graph contents by default.

## Phase 6: Import, Export, Tutorial

- Import `.md` as notes.
- Import `.txt` as Markdown notes.
- Import `.docx` as Markdown notes where possible.
- Export a portable project folder.
- Ship a neutral Welcome World starter project.

## Technical Direction

- Desktop shell: Tauri.
- Frontend: React and TypeScript.
- Storage: local filesystem plus optional SQLite index in `.wordline/index.db`.
- Canonical content: Markdown files in `notes/`.
- Enhanced behavior: JSON sidecars in `data/`.

## Non-Goals For MVP

- Cloud sync.
- Multi-user collaboration.
- AI writing features.
- Maps.
- Mobile app.
- Strict database-only project format.
- Perspective/secret knowledge mode.
