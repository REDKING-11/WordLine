import { useMemo } from "react";
import { buildFolderGroups } from "../project/folders";
import type { SortOrder } from "../project/folders";
import type { ProjectData } from "../types";

export function useProjectFilters(
  project: ProjectData | null,
  activeType: string,
  searchInput: string,
  sortOrder: SortOrder = "az",
) {
  const noteTypes = useMemo(() => {
    const types = project?.notes
      .map((note) => note.frontmatter.type)
      .filter((type): type is string => Boolean(type));

    return Array.from(new Set(types)).sort();
  }, [project]);

  const filteredNotes = useMemo(() => {
    if (!project) {
      return [];
    }

    const query = searchInput.trim().toLowerCase();

    return project.notes
      .filter((note) => activeType === "all" || note.frontmatter.type === activeType)
      .filter((note) => {
        if (!query) {
          return true;
        }

        return [
          note.title,
          note.path,
          note.frontmatter.type ?? "",
          note.frontmatter.tags.join(" "),
          note.content,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [activeType, project, searchInput]);

  const folderGroups = useMemo(
    () => (project ? buildFolderGroups(project, filteredNotes, sortOrder) : []),
    [filteredNotes, project, sortOrder],
  );

  return {
    filteredNotes,
    folderGroups,
    noteTypes,
  };
}
