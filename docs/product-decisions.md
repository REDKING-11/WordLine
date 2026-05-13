# WordLine Product Decisions

These decisions are extracted from `CORE.docx` and should guide the MVP unless they are intentionally revisited.

## Core Direction

- First target user: writers of stories.
- Secondary users: RPG/game designers, D&D groups, lore-heavy creators, researchers, and other knowledge projects if the app can support them without weakening the writing focus.
- Positioning: a creative canvas/workstation, not a corporate productivity app.
- First wow moment: timeline and graph.
- Obsidian comparison: the goal is not simply to be "better than Obsidian with plugins." WordLine should be a different app with an equally strong local-first knowledge foundation and richer story/world views.
- Project size: do not artificially limit users. Design for small stories and large worlds.
- Product strictness: support modes/templates so the app can be both story-oriented and neutral/flexible.
- Writing flow: users should mostly be able to write inside the app, while also importing content from Word and other common formats.
- Brand promise: local-first/no-account behavior is both a technical direction and part of the broader RedFolder ecosystem identity.
- First project experience: a small tutorial starter project, similar in spirit to Obsidian's help vault, that users can delete.

## MVP Scope

- Minimum usable version starts with notes. Timeline and graph need knowledge to work with.
- First foundation: Markdown notes.
- AI is not in the first MVP.
- Custom fictional calendars should be in the MVP immediately.
- Branching timelines should be supported if practical from the beginning.
- Perspective/secret knowledge mode can wait.
- Maps should not be added yet.
- Import/export should be in the first version.
- Embarrassing missing feature: notes.
- Exciting feature that can safely wait: AI.

## Data Model

- The difference between a note and an entity is intentionally flexible at first.
- Events can behave as an entity/note type.
- Relationships changing over time should be supported if possible.
- Time-based entity states are optional, not mandatory for every entity.
- Contradictions should be allowed but flagged, not blocked.
- Canon/non-canon/draft status should exist.
- Users should define custom entity types.
- Users should define custom relationship types.
- Facts can have optional sources/evidence, and sources are preferred for users who want rigor.
- Character knowledge/belief should be representable separately from objective truth when a project needs that distinction.

## Timeline

- Timelines should support real dates, fictional dates, vague dates, eras, ranges, durations, years, months, days, and custom calendars.
- Users should be able to drag events to change dates.
- Timeline lanes should be user-definable rather than hard-coded to characters, places, or factions.
- Eras should be supported.
- Causality arrows should be optional.
- Nested timelines should be possible.
- Timeline style should be user-configurable between exploratory/cinematic and precise/editorial.
- Multiple timelines can exist in one project.
- Time selection should not automatically control graph contents by default.

## Graph

- The graph is for both exploration and editing.
- Saved graph layout positions are optional.
- Users should be able to pin graph nodes.
- Graph behavior should be dynamic, like Obsidian's graph view, but richer.
- Relationships should support labels, dates, and metadata.
- Graph filters should include type, tag, time, and perspective.
- Graph scale should not be artificially capped. The app should aim to handle as many nodes as the user creates, with performance work guided by testing.

## AI Later

- First AI jobs: summaries, suggestions, and writing assistance.
- AI is optional and user-key based.
- AI should only read explicitly selected context if the user chooses that mode.
- Users should be able to preview what is sent to the AI provider if they want.
- AI-written changes should happen only if the user chooses that behavior.
- AI should appear as a side panel first.

## Implementation Preferences

- Name: `WordLine` is the current app name. `UniversalStories` was the earlier working name.
- Platform: Windows first, while preserving cross-platform potential.
- Shell/frontend: Tauri plus React/TypeScript is the preferred direction.
- Writing experience: natural Markdown writing; exact feel can evolve through prototypes.
- Canvas behavior: separate views first, not one infinite canvas for everything.
- Tutorial project: neutral demo that shows all major features.
- Entity creation: when a user finishes typing a wiki link such as `[[Red]]`, create or resolve the note/entity after the link is committed, not before.
- Flexible types: start with defaults such as Character, Event, Place, and Faction, but allow users to rename, delete, or add their own.
- Dates: custom/fictional calendars should be available immediately.
- Graph style: clean and practical like Obsidian, but richer.
- Timeline style: a horizontal line with years and optional months/dates/detail as the user wants.
- Import priority: text, Markdown, and Word.
- Export priority: simplest and richest practical portability.
- Maps: out of scope for now.
- AI placement: side panel.
