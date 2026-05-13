# WordLine

WordLine is a local-first desktop writing and worldbuilding app concept for the RedFolder ecosystem.

It is designed around portable Markdown notes plus optional sidecar files for timelines, graphs, relationships, calendars, saved views, indexes, and caches.

## Current Workspace Contents

- [docs/universalstories-product-spec.md](docs/universalstories-product-spec.md): product direction and MVP scope. This file was created before the WordLine rename.
- [docs/mvp-roadmap.md](docs/mvp-roadmap.md): phased first-version implementation plan.
- [docs/progress-check-2026-05-13.md](docs/progress-check-2026-05-13.md): current prototype status and next steps.
- [examples/Welcome World](examples/Welcome%20World): neutral tutorial starter project.

## Current Prototype

The working prototype lives in [Frontend](Frontend). Because Tauri desktop compilation is blocked on this machine by missing MSVC Build Tools, the app currently runs as a Vite-first React/TypeScript prototype.

Current prototype behavior:

- Startup/project shell for WordLine.
- Three-pane writing workspace.
- In-memory Welcome World project data with localStorage persistence.
- Notes and folders in the sidebar.
- Create, rename, delete, move, and search notes/folders.
- CodeMirror-based Markdown editor.
- Obsidian-style live Markdown preview for common syntax.
- Wiki links that update backlinks and graph state.
- Graph view with wiki-link and relationship edges.
- Hideable metadata/context panel.
- Timeline placeholder only.

Run the prototype:

```powershell
cd Frontend
npm run dev
```

## Project Format

```text
WordLine Project/
  notes/
  data/
  assets/
  .wordline/
```

Markdown files in `notes/` are the canonical user-owned knowledge. JSON files in `data/` add app behavior such as graph relationships, custom calendars, timelines, and saved views.

## MVP North Star

Help writers build worlds that feel alive by seeing how notes, people, events, places, and relationships change across time.

See [docs/product-decisions.md](docs/product-decisions.md) for the current answers extracted from `CORE.docx`.
