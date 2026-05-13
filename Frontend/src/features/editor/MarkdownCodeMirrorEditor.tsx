import { useEffect, useMemo, useRef } from "react";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import type { Extension, Range } from "@codemirror/state";
import { EditorSelection, EditorState, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  keymap,
  placeholder,
} from "@codemirror/view";
import type { DecorationSet, ViewUpdate } from "@codemirror/view";
import type { ProjectData } from "../../types";

export function MarkdownCodeMirrorEditor({
  content,
  project,
  onChangeContent,
  onOpenLink,
}: {
  content: string;
  project: ProjectData;
  onChangeContent: (content: string) => void;
  onOpenLink: (title: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChangeContent);
  const onOpenLinkRef = useRef(onOpenLink);
  const projectRef = useRef(project);

  useEffect(() => {
    onChangeRef.current = onChangeContent;
  }, [onChangeContent]);

  useEffect(() => {
    onOpenLinkRef.current = onOpenLink;
  }, [onOpenLink]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const extensions = useMemo(
    () => createEditorExtensions(onChangeRef, onOpenLinkRef, projectRef),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: content,
        extensions,
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [extensions]);

  useEffect(() => {
    const view = viewRef.current;

    if (!view || view.state.doc.toString() === content) {
      return;
    }

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content,
      },
      selection: EditorSelection.cursor(Math.min(view.state.selection.main.head, content.length)),
    });
  }, [content]);

  return <div className="markdown-codemirror-editor" ref={containerRef} />;
}

function createEditorExtensions(
  onChangeRef: React.MutableRefObject<(content: string) => void>,
  onOpenLinkRef: React.MutableRefObject<(title: string) => void>,
  projectRef: React.MutableRefObject<ProjectData>,
): Extension[] {
  return [
    history(),
    markdown(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.lineWrapping,
    placeholder("Start writing..."),
    markdownLivePreviewDecorations(projectRef),
    wikiLinkOpenHandler(onOpenLinkRef),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    }),
    EditorView.theme({
      "&": {
        height: "100%",
      },
    }),
  ];
}

function markdownLivePreviewDecorations(projectRef: React.MutableRefObject<ProjectData>) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildMarkdownDecorations(view, projectRef.current);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.decorations = buildMarkdownDecorations(update.view, projectRef.current);
        }
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}

function buildMarkdownDecorations(view: EditorView, project: ProjectData): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const ranges: Array<Range<Decoration>> = [];

  for (const { from, to } of view.visibleRanges) {
    addBlockMarkdownDecorations(view, ranges, from, to);
    addWikiLinkDecorations(view, project, ranges, from, to);
    addInlineMarkdownDecorations(view, ranges, from, to);
  }

  ranges.sort((a, b) => a.from - b.from || a.to - b.to);
  for (const range of ranges) {
    builder.add(range.from, range.to, range.value);
  }

  return builder.finish();
}

function addBlockMarkdownDecorations(
  view: EditorView,
  ranges: Array<Range<Decoration>>,
  from: number,
  to: number,
) {
  let line = view.state.doc.lineAt(from);

  while (line.from <= to) {
    const headingMatch = line.text.match(/^(#{1,6})\s+(.*)$/);
    const quoteMatch = line.text.match(/^(\s{0,3}>\s?)(.*)$/);
    const unorderedListMatch = line.text.match(/^(\s*)([-+*])\s+(.*)$/);
    const orderedListMatch = line.text.match(/^(\s*)(\d+[.)])\s+(.*)$/);

    if (headingMatch) {
      const markerFrom = line.from;
      const markerTo = line.from + headingMatch[1].length + 1;
      const textFrom = markerTo;
      const textTo = line.to;
      const level = Math.min(headingMatch[1].length, 6);
      const isActive = selectionTouchesRange(view, markerFrom, markerTo);

      if (isActive) {
        ranges.push(
          Decoration.mark({
            class: "cm-wordline-md-marker",
          }).range(markerFrom, markerTo),
        );
        ranges.push(
          Decoration.mark({
            class: `cm-wordline-heading cm-wordline-heading-${level}`,
          }).range(textFrom, textTo),
        );
      } else {
        ranges.push(Decoration.replace({}).range(markerFrom, markerTo));
        ranges.push(
          Decoration.mark({
            class: `cm-wordline-heading cm-wordline-heading-${level}`,
          }).range(textFrom, textTo),
        );
      }
    } else if (quoteMatch) {
      const markerFrom = line.from;
      const markerTo = line.from + quoteMatch[1].length;
      const isActive = selectionTouchesRange(view, markerFrom, markerTo);

      ranges.push(
        Decoration.line({
          class: "cm-wordline-blockquote-line",
        }).range(line.from),
      );

      if (!isActive) {
        ranges.push(Decoration.replace({}).range(markerFrom, markerTo));
      } else {
        ranges.push(
          Decoration.mark({
            class: "cm-wordline-md-marker",
          }).range(markerFrom, markerTo),
        );
      }
    } else if (unorderedListMatch) {
      const markerFrom = line.from + unorderedListMatch[1].length;
      const markerTo = markerFrom + unorderedListMatch[2].length + 1;
      const isActive = selectionTouchesRange(view, markerFrom, markerTo);

      if (!isActive) {
        ranges.push(
          Decoration.replace({
            widget: new MarkdownMarkerWidget("cm-wordline-list-marker", "• "),
          }).range(markerFrom, markerTo),
        );
      } else {
        ranges.push(
          Decoration.mark({
            class: "cm-wordline-md-marker",
          }).range(markerFrom, markerTo),
        );
      }
    } else if (orderedListMatch) {
      const markerFrom = line.from + orderedListMatch[1].length;
      const markerTo = markerFrom + orderedListMatch[2].length + 1;
      const isActive = selectionTouchesRange(view, markerFrom, markerTo);

      ranges.push(
        Decoration.mark({
          class: isActive ? "cm-wordline-md-marker" : "cm-wordline-ordered-marker",
        }).range(markerFrom, markerTo),
      );
    }

    if (line.to >= to || line.number >= view.state.doc.lines) {
      break;
    }

    line = view.state.doc.line(line.number + 1);
  }
}

function addWikiLinkDecorations(
  view: EditorView,
  project: ProjectData,
  ranges: Array<Range<Decoration>>,
  from: number,
  to: number,
) {
  const text = view.state.doc.sliceString(from, to);
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text))) {
    const linkFrom = from + match.index;
    const linkTo = linkFrom + match[0].length;
    const title = match[1].trim();
    const exists = project.notes.some(
      (note) => note.title.trim().toLowerCase() === title.toLowerCase(),
    );
    const linkIsActive = selectionTouchesRange(view, linkFrom, linkTo);
    const linkClass = exists
      ? "cm-wordline-wiki-link"
      : "cm-wordline-wiki-link cm-wordline-missing-link";
    const labelStart = linkFrom + 2;
    const labelEnd = linkTo - 2;
    const pipeIndex = match[0].indexOf("|");
    const contentFrom = pipeIndex === -1 ? labelStart : linkFrom + pipeIndex + 1;
    const contentTo = labelEnd;
    const decoration = Decoration.mark({
      class: linkClass,
      attributes: {
        "data-link-title": title,
      },
    });

    if (linkIsActive) {
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(linkFrom, labelStart));
      ranges.push(decoration.range(labelStart, labelEnd));
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(labelEnd, linkTo));
    } else {
      ranges.push(Decoration.replace({}).range(linkFrom, contentFrom));
      ranges.push(decoration.range(contentFrom, contentTo));
      ranges.push(Decoration.replace({}).range(contentTo, linkTo));
    }
  }
}

function addInlineMarkdownDecorations(
  view: EditorView,
  ranges: Array<Range<Decoration>>,
  from: number,
  to: number,
) {
  let line = view.state.doc.lineAt(from);

  while (line.from <= to) {
    addMarkdownPairDecorations(view, ranges, line, /\*\*([^*\n]+)\*\*/g, 2, "cm-wordline-bold");
    addMarkdownPairDecorations(view, ranges, line, /__([^_\n]+)__/g, 2, "cm-wordline-bold");
    addMarkdownPairDecorations(view, ranges, line, /(?<!\*)\*([^*\n]+)\*(?!\*)/g, 1, "cm-wordline-italic");
    addMarkdownPairDecorations(view, ranges, line, /(?<!_)_([^_\n]+)_(?!_)/g, 1, "cm-wordline-italic");
    addMarkdownPairDecorations(view, ranges, line, /~~([^~\n]+)~~/g, 2, "cm-wordline-strike");
    addMarkdownPairDecorations(view, ranges, line, /`([^`\n]+)`/g, 1, "cm-wordline-inline-code");
    addMarkdownLinkDecorations(view, ranges, line);

    if (line.to >= to || line.number >= view.state.doc.lines) {
      break;
    }

    line = view.state.doc.line(line.number + 1);
  }
}

function addMarkdownPairDecorations(
  view: EditorView,
  ranges: Array<Range<Decoration>>,
  line: { from: number; to: number; text: string },
  pattern: RegExp,
  markerLength: number,
  className: string,
) {
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line.text))) {
    const tokenFrom = line.from + match.index;
    const tokenTo = tokenFrom + match[0].length;
    const contentFrom = tokenFrom + markerLength;
    const contentTo = tokenTo - markerLength;
    const isActive = selectionTouchesRange(view, tokenFrom, tokenTo);
    const decoration = Decoration.mark({ class: className });

    if (isActive) {
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(tokenFrom, contentFrom));
      ranges.push(decoration.range(contentFrom, contentTo));
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(contentTo, tokenTo));
    } else {
      ranges.push(Decoration.replace({}).range(tokenFrom, contentFrom));
      ranges.push(decoration.range(contentFrom, contentTo));
      ranges.push(Decoration.replace({}).range(contentTo, tokenTo));
    }
  }
}

function addMarkdownLinkDecorations(
  view: EditorView,
  ranges: Array<Range<Decoration>>,
  line: { from: number; to: number; text: string },
) {
  const linkPattern = /(?<!!)\[([^\]\n]+)\]\(([^)\n]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(line.text))) {
    const tokenFrom = line.from + match.index;
    const tokenTo = tokenFrom + match[0].length;
    const labelFrom = tokenFrom + 1;
    const labelTo = labelFrom + match[1].length;
    const isActive = selectionTouchesRange(view, tokenFrom, tokenTo);
    const decoration = Decoration.mark({ class: "cm-wordline-markdown-link" });

    if (isActive) {
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(tokenFrom, labelFrom));
      ranges.push(decoration.range(labelFrom, labelTo));
      ranges.push(Decoration.mark({ class: "cm-wordline-md-marker" }).range(labelTo, tokenTo));
    } else {
      ranges.push(Decoration.replace({}).range(tokenFrom, labelFrom));
      ranges.push(decoration.range(labelFrom, labelTo));
      ranges.push(Decoration.replace({}).range(labelTo, tokenTo));
    }
  }
}

class MarkdownMarkerWidget extends WidgetType {
  constructor(
    private readonly className: string,
    private readonly text: string,
  ) {
    super();
  }

  toDOM() {
    const element = document.createElement("span");
    element.className = this.className;
    element.textContent = this.text;
    return element;
  }
}

function selectionTouchesRange(view: EditorView, from: number, to: number): boolean {
  return view.state.selection.ranges.some(
    (range) =>
      (range.from >= from && range.from <= to) ||
      (range.to >= from && range.to <= to) ||
      (range.from <= from && range.to >= to),
  );
}

function wikiLinkOpenHandler(
  onOpenLinkRef: React.MutableRefObject<(title: string) => void>,
): Extension {
  return EditorView.domEventHandlers({
    dblclick(event, view) {
      const title = findWikiLinkTitleAtEvent(event, view);

      if (!title) {
        return false;
      }

      event.preventDefault();
      onOpenLinkRef.current(title);
      return true;
    },
    mousedown(event, view) {
      if (!(event.ctrlKey || event.metaKey)) {
        return false;
      }

      const title = findWikiLinkTitleAtEvent(event, view);

      if (!title) {
        return false;
      }

      event.preventDefault();
      onOpenLinkRef.current(title);
      return true;
    },
  });
}

function findWikiLinkTitleAtEvent(event: MouseEvent, view: EditorView): string | null {
  const position = view.posAtCoords({
    x: event.clientX,
    y: event.clientY,
  });

  if (position === null) {
    return null;
  }

  const line = view.state.doc.lineAt(position);
  const lineText = line.text;
  const linkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(lineText))) {
    const from = line.from + match.index;
    const to = from + match[0].length;

    if (position >= from && position <= to) {
      return match[1].trim();
    }
  }

  return null;
}
