import { useState } from "react";

export type GraphOptions = {
  showWikiLinks: boolean;
  showRelationships: boolean;
  showUnresolved: boolean;
  showOrphans: boolean;
  showArrows: boolean;
  focusNeighbors: boolean;
  centerStrength: number;
  repelStrength: number;
  linkStrength: number;
  linkDistance: number;
  nodeSize: number;
  lineThickness: number;
};

export const defaultGraphOptions: GraphOptions = {
  showWikiLinks: true,
  showRelationships: true,
  showUnresolved: true,
  showOrphans: true,
  showArrows: true,
  focusNeighbors: true,
  centerStrength: 0.16,
  repelStrength: 10,
  linkStrength: 0.38,
  linkDistance: 145,
  nodeSize: 1,
  lineThickness: 1,
};

export function useGraphOptions() {
  return useState<GraphOptions>(defaultGraphOptions);
}
