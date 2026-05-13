import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { GraphOptions } from "../../hooks/useGraphOptions";
import type { GraphEdge, GraphNode } from "../../types";
import {
  clientToSvgPoint,
  getArrowMarkerId,
  getFocusedNodeIds,
  getGraphNodeClassName,
  randomVelocity,
  simulateGraphStep,
} from "./graphSimulation";
import type { GraphNodeState } from "./graphSimulation";
import "./graph.css";

export function GraphPanel({
  nodes,
  edges,
  options,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  options: GraphOptions;
  selectedNodeId: string;
  onSelectNode: (node: GraphNode) => void;
}) {
  const [nodeState, setNodeState] = useState<Record<string, GraphNodeState>>({});
  const nodeStateRef = useRef<Record<string, GraphNodeState>>({});
  const draggingNodeId = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setNodeState((currentState) => {
      const nextState: Record<string, GraphNodeState> = {};

      for (const node of nodes) {
        const existing = currentState[node.id];
        nextState[node.id] = {
          ...node,
          x: existing?.x ?? node.x,
          y: existing?.y ?? node.y,
          vx: existing?.vx ?? randomVelocity(),
          vy: existing?.vy ?? randomVelocity(),
          pinned: existing?.pinned ?? false,
        };
      }

      nodeStateRef.current = nextState;
      return nextState;
    });
  }, [nodes]);

  useEffect(() => {
    let animationFrame = 0;

    function tick() {
      const nextState = simulateGraphStep(
        nodeStateRef.current,
        edges,
        options,
        draggingNodeId.current,
      );
      nodeStateRef.current = nextState;
      setNodeState(nextState);
      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [edges, options]);

  const nodesById = new Map(Object.values(nodeState).map((node) => [node.id, node]));
  const focusedNodeIds = useMemo(
    () => getFocusedNodeIds(selectedNodeId, edges),
    [edges, selectedNodeId],
  );

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!draggingNodeId.current || !svgRef.current) {
      return;
    }

    const point = clientToSvgPoint(svgRef.current, event.clientX, event.clientY);
    const currentNode = nodeStateRef.current[draggingNodeId.current];

    if (!currentNode) {
      return;
    }

    const nextState = {
      ...nodeStateRef.current,
      [draggingNodeId.current]: {
        ...currentNode,
        x: point.x,
        y: point.y,
        vx: 0,
        vy: 0,
        pinned: true,
      },
    };

    nodeStateRef.current = nextState;
    setNodeState(nextState);
  }

  function handlePointerUp() {
    draggingNodeId.current = null;
  }

  return (
    <section className="graph-panel" aria-label="Project graph">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Live graph</span>
          <h2>Notes and relationships</h2>
        </div>
        <span>{nodes.length} nodes</span>
      </div>

      <svg
        className="graph-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        ref={svgRef}
        role="img"
        viewBox="0 0 560 420"
      >
        <title>WordLine project graph</title>
        <defs>
          <marker
            id="graph-arrow-wiki"
            markerHeight="6"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="3"
          >
            <path d="M0,0 L8,3 L0,6 Z" />
          </marker>
          <marker
            id="graph-arrow-relationship"
            markerHeight="6"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="3"
          >
            <path d="M0,0 L8,3 L0,6 Z" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const from = nodesById.get(edge.from);
          const to = nodesById.get(edge.to);

          if (!from || !to) {
            return null;
          }

          const midpointX = (from.x + to.x) / 2;
          const midpointY = (from.y + to.y) / 2;

          const dimmed =
            options.focusNeighbors &&
            (!focusedNodeIds.has(edge.from) || !focusedNodeIds.has(edge.to));
          const edgeClassName = [
            "graph-edge",
            edge.kind,
            dimmed ? "dimmed" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <g className={edgeClassName} key={edge.id}>
              <line
                markerEnd={options.showArrows ? `url(#${getArrowMarkerId(edge.kind)})` : undefined}
                style={{ strokeWidth: 2 * options.lineThickness }}
                x1={from.x}
                x2={to.x}
                y1={from.y}
                y2={to.y}
              />
              {edge.kind === "relationship" && (
                <text x={midpointX} y={midpointY - 6}>
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {Object.values(nodeState).map((node) => (
          <g
            className={getGraphNodeClassName(
              node,
              selectedNodeId,
              options.focusNeighbors,
              focusedNodeIds,
            )}
            key={node.id}
            onClick={() => onSelectNode(node)}
            onPointerDown={(event) => {
              draggingNodeId.current = node.id;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            role="button"
            tabIndex={0}
          >
            <circle cx={node.x} cy={node.y} r={34 * options.nodeSize} />
            <text x={node.x} y={node.y - 3}>
              {node.title}
            </text>
            <text className="node-type" x={node.x} y={node.y + 14}>
              {node.missing ? "new note" : node.type ?? "note"}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
