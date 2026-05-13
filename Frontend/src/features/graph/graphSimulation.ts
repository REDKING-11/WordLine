import type { GraphEdge, GraphNode } from "../../types";
import type { GraphOptions } from "../../hooks/useGraphOptions";

export type GraphNodeState = GraphNode & {
  vx: number;
  vy: number;
  pinned: boolean;
};

export function simulateGraphStep(
  currentState: Record<string, GraphNodeState>,
  edges: GraphEdge[],
  options: GraphOptions,
  draggingNodeId: string | null,
): Record<string, GraphNodeState> {
  const nodes = Object.values(currentState);
  const nextState: Record<string, GraphNodeState> = {};

  for (const node of nodes) {
    nextState[node.id] = { ...node };
  }

  for (let index = 0; index < nodes.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
      const a = nextState[nodes[index].id];
      const b = nextState[nodes[otherIndex].id];
      const dx = a.x - b.x || 0.01;
      const dy = a.y - b.y || 0.01;
      const distanceSquared = dx * dx + dy * dy;
      const force = Math.min((180 * options.repelStrength) / distanceSquared, 1.8);
      const distance = Math.sqrt(distanceSquared);
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  for (const edge of edges) {
    const from = nextState[edge.from];
    const to = nextState[edge.to];

    if (!from || !to) {
      continue;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetLength =
      edge.kind === "relationship" ? options.linkDistance * 1.12 : options.linkDistance;
    const force = (distance - targetLength) * 0.03 * options.linkStrength;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;

    from.vx += fx;
    from.vy += fy;
    to.vx -= fx;
    to.vy -= fy;
  }

  for (const node of Object.values(nextState)) {
    if (node.id === draggingNodeId) {
      continue;
    }

    node.vx += (280 - node.x) * 0.01 * options.centerStrength;
    node.vy += (210 - node.y) * 0.01 * options.centerStrength;
    node.vx *= 0.88;
    node.vy *= 0.88;
    node.x = clamp(node.x + node.vx, 36, 524);
    node.y = clamp(node.y + node.vy, 36, 384);
  }

  return nextState;
}

export function getFocusedNodeIds(selectedNodeId: string, edges: GraphEdge[]): Set<string> {
  const focusedNodeIds = new Set<string>(selectedNodeId ? [selectedNodeId] : []);

  for (const edge of edges) {
    if (edge.from === selectedNodeId) {
      focusedNodeIds.add(edge.to);
    }

    if (edge.to === selectedNodeId) {
      focusedNodeIds.add(edge.from);
    }
  }

  return focusedNodeIds;
}

export function getGraphNodeClassName(
  node: GraphNodeState,
  selectedNodeId: string,
  focusNeighbors: boolean,
  focusedNodeIds: Set<string>,
): string {
  return [
    "graph-node",
    node.id === selectedNodeId ? "selected" : "",
    node.missing ? "missing" : "",
    focusNeighbors && !focusedNodeIds.has(node.id) ? "dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getArrowMarkerId(edgeKind: GraphEdge["kind"]): string {
  return edgeKind === "relationship" ? "graph-arrow-relationship" : "graph-arrow-wiki";
}

export function clientToSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(svg.getScreenCTM()?.inverse());
}

export function randomVelocity(): number {
  return (Math.random() - 0.5) * 0.7;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
