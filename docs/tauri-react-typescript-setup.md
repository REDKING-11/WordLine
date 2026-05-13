# Tauri + React + TypeScript Setup

This is the recommended starting point for WordLine.

## Why This Stack

- Tauri gives WordLine local filesystem access, small desktop builds, and cross-platform potential.
- React and TypeScript are a good fit for a complex creative UI with notes, graph, timeline, panels, filters, and later plugin-like surfaces.
- Rust can stay thin at first: project folder access, file reads/writes, imports/exports, indexing, and app commands.

## Current Local Tooling Check

This workspace already has:

- Node.js: installed.
- npm: installed.

Missing:

- Rust.
- Cargo.

Tauri development requires Rust/Cargo.

## Windows Prerequisites

Install these before scaffolding the app:

1. Microsoft C++ Build Tools.
   - Install the Visual Studio Build Tools.
   - Select the `Desktop development with C++` workload.
2. Microsoft Edge WebView2 Runtime.
   - Usually already present on Windows 10/11.
3. Rust via rustup.

Recommended Rust install command:

```powershell
winget install --id Rustlang.Rustup
```

After installing Rust, restart the terminal and verify:

```powershell
rustc --version
cargo --version
```

If Rust is installed but Tauri has trouble with the toolchain, set the MSVC toolchain:

```powershell
rustup default stable-msvc
```

## Scaffold Command

From the workspace parent folder, run:

```powershell
npm create tauri-app@latest wordline
```

Choose:

- Package manager: `npm`
- Frontend language: `TypeScript / JavaScript`
- UI template: `React`
- UI flavor: `TypeScript`
- Identifier: `com.redfolder.wordline`

Then:

```powershell
cd wordline
npm install
npm run tauri dev
```

## Current Scaffold In This Workspace

The current app scaffold lives in:

```text
Frontend/
```

It was generated as React JavaScript, then converted to React TypeScript:

- `src/App.jsx` -> `src/App.tsx`
- `src/main.jsx` -> `src/main.tsx`
- `vite.config.js` -> `vite.config.ts`
- Added `tsconfig.json` and `tsconfig.node.json`
- Updated package metadata to `wordline`
- Updated Tauri product metadata to `WordLine`
- Updated the Tauri identifier to `com.redfolder.wordline`

The frontend build has been verified with:

```powershell
cd Frontend
npm install
npm run build
```

Remaining blocker for desktop Tauri development:

```powershell
rustc --version
cargo --version
```

Both commands must work before `npm run tauri dev` can launch the desktop app.

## Suggested First App Structure

After scaffolding, the early app can be organized like this:

```text
wordline/
  src/
    app/
      App.tsx
      routes.ts
    features/
      notes/
      graph/
      timeline/
      project/
      relationships/
      calendars/
    shared/
      components/
      types/
      utils/
  src-tauri/
    src/
      main.rs
      commands/
        project.rs
        notes.rs
        import.rs
        export.rs
```

## First Vertical Slice

Start with the smallest real WordLine loop:

1. Open or create a local project folder.
2. Ensure `notes/`, `data/`, `assets/`, and `.wordline/` exist.
3. Read Markdown notes from `notes/`.
4. Parse frontmatter and wiki links.
5. Show a three-pane layout:
   - Left: notes list.
   - Center: Markdown editor.
   - Right: metadata, backlinks, relationships placeholder.
6. Save edits back to the `.md` file.

Do this before timeline or graph. Timeline and graph need indexed notes, links, types, tags, and relationships to become meaningful.

## Early Tauri Commands

The Rust side should expose a narrow command API first:

```text
create_project(path)
open_project(path)
list_notes(project_path)
read_note(project_path, note_path)
write_note(project_path, note_path, content)
read_sidecar(project_path, sidecar_name)
write_sidecar(project_path, sidecar_name, json)
import_file(project_path, file_path)
export_project(project_path, destination_path)
```

Keep advanced behavior in TypeScript until there is a reason to move it into Rust.

## Source

Based on the official Tauri v2 setup flow:

- https://v2.tauri.app/start/prerequisites/
- https://v2.tauri.app/start/create-project/
