import dagre from "dagre";
import type { PipelineEdge, PipelineNode } from "@/types/pipeline";

const NODE_WIDTH = 280;
const NODE_HEIGHT = 170;

export function layoutPipeline(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 64, ranksep: 96 });

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.width ?? NODE_WIDTH,
      height: node.height ?? NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - (node.width ?? NODE_WIDTH) / 2,
        y: position.y - (node.height ?? NODE_HEIGHT) / 2,
      },
    };
  });
}
