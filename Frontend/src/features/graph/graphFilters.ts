import type { GraphOptions } from "../../hooks/useGraphOptions";
import type { GraphEdge, GraphNode } from "../../types";

export function filterGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: GraphOptions,
  selectedNodeId: string,
) {
  const allowedNodeIds = new Set(
    nodes
      .filter((node) => options.showUnresolved || !node.missing)
      .map((node) => node.id),
  );

  const visibleEdges = edges.filter((edge) => {
    if (edge.kind === "wiki-link" && !options.showWikiLinks) {
      return false;
    }

    if (edge.kind === "relationship" && !options.showRelationships) {
      return false;
    }

    return allowedNodeIds.has(edge.from) && allowedNodeIds.has(edge.to);
  });

  if (options.showOrphans) {
    return {
      nodes: nodes.filter((node) => allowedNodeIds.has(node.id)),
      edges: visibleEdges,
    };
  }

  const connectedNodeIds = new Set<string>(selectedNodeId ? [selectedNodeId] : []);
  for (const edge of visibleEdges) {
    connectedNodeIds.add(edge.from);
    connectedNodeIds.add(edge.to);
  }

  return {
    nodes: nodes.filter((node) => allowedNodeIds.has(node.id) && connectedNodeIds.has(node.id)),
    edges: visibleEdges,
  };
}
