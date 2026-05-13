# WordLine Progress Check - 2026-05-13

## Current Direction

WordLine is now the app name. UniversalStories remains the earlier working concept name, but current docs and UI should use WordLine unless referring to older planning material.

The product direction is still:

- Local-first writing and worldbuilding workstation.
- Markdown notes as the user-owned source of truth.
- Optional sidecar data for graph, relationships, timelines, calendars, views, and cache/index data.
- Writer-first, with room for D&D, lore, research, and investigation modes later.
- No AI in the first MVP.
- No maps yet.

## Current Technical State

The app is currently a Vite-first React/TypeScript prototype inside `Frontend`.

Tauri remains the intended desktop shell, but desktop development is blocked on this Windows machine because Rust can run but MSVC Build Tools/link.exe are unavailable. Vite development works and is the active path for now.

Verified today:

- `npx tsc --noEmit` passes.
- `npm run build` could not be completed inside the sandbox because esbuild process spawning was blocked.

## Implemented Today

- Replaced the fragile custom Markdown editor approach with a CodeMirror 6 editor foundation.
- Restored normal editing behavior: click, caret placement, typing, Enter, Backspace, arrows, selection, copy, and paste.
- Added Obsidian-style live-preview behavior for wiki links.
- Added live-preview behavior for common Markdown syntax:
  - headings `#` through `######`
  - bold and italic
  - strikethrough
  - inline code
  - Markdown links
  - wiki links with optional aliases
  - blockquotes
  - unordered lists
  - ordered lists
- Markdown syntax now hides when inactive and reappears as muted gray text when the caret is inside that Markdown object.
- Continued the graph/editor connection so wiki-link edits update backlinks and graph state.

## Already Working In Prototype

- Startup/project shell.
- Three-pane workspace.
- Compact left sidebar.
- Notes and folders.
- Create note and folder flows.
- Rename/delete note and folder actions.
- Drag notes into folders.
- Sidebar search.
- LocalStorage prototype persistence.
- Reset to Welcome World demo data.
- Hide/show metadata/context panel.
- Right-click note menu.
- Graph panel with wiki-link edges and relationship edges.
- Timeline placeholder tab.

## Partial Or Prototype-Only

- Project persistence is localStorage only.
- Project folders are metadata only, not real filesystem folders yet.
- Import is intentionally hidden for now.
- Export/project portability is not implemented yet.
- Timeline is visible only as a placeholder.
- Custom calendars exist in the intended model/demo data but do not have UI yet.
- Graph is lightweight SVG/HTML and should keep improving before becoming a serious large-world graph.

## Blockers

- Tauri desktop commands cannot compile until MSVC Build Tools are available on Windows.
- Real local file reads/writes should wait until Tauri filesystem access is available or another desktop shell decision is made.

## Next Best Steps

1. Polish CodeMirror live preview edge cases.
2. Add note tabs or split-pane behavior.
3. Improve graph interaction: better force behavior, pinning, zoom/pan, clearer relationship labels.
4. Add real metadata editing in the right panel.
5. Add timeline data model UI using the Welcome World demo events.
6. Prepare filesystem repository implementation for Tauri, but keep it behind the existing repository interface.
7. Add export/reset/backup flows once persistence moves beyond localStorage.

## Product Reminder

The prototype should stay focused on this core loop:

Write a note, link it to people/places/events, immediately see the world structure change in backlinks, metadata, and graph.
