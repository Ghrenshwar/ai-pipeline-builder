import type { PipelineEdge, PipelineNode } from "@/types/pipeline";

export function isDag(nodes: PipelineNode[], edges: PipelineEdge[]) {
  return getCycleEdgeIds(nodes, edges).size === 0;
}

export function getTopologicalOrder(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodeIds.forEach((id) => {
    indegree.set(id, 0);
    adjacency.set(id, []);
  });

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return;
    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  });

  const queue = Array.from(indegree.entries())
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id);
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    order.push(current);
    adjacency.get(current)?.forEach((neighbor) => {
      const nextDegree = (indegree.get(neighbor) ?? 0) - 1;
      indegree.set(neighbor, nextDegree);
      if (nextDegree === 0) queue.push(neighbor);
    });
  }

  return order.length === nodes.length ? order : [];
}

export function getCycleEdgeIds(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const adjacency = new Map<string, PipelineEdge[]>();
  const state = new Map<string, "visiting" | "visited">();
  const cycleEdges = new Set<string>();

  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacency.get(edge.source)?.push(edge);
    }
  });

  const visit = (nodeId: string, trail: PipelineEdge[]) => {
    state.set(nodeId, "visiting");
    adjacency.get(nodeId)?.forEach((edge) => {
      const targetState = state.get(edge.target);
      if (targetState === "visiting") {
        const start = trail.findIndex((item) => item.source === edge.target);
        trail.slice(Math.max(start, 0)).forEach((item) => cycleEdges.add(item.id));
        cycleEdges.add(edge.id);
        return;
      }
      if (targetState !== "visited") {
        visit(edge.target, [...trail, edge]);
      }
    });
    state.set(nodeId, "visited");
  };

  nodes.forEach((node) => {
    if (!state.has(node.id)) visit(node.id, []);
  });

  return cycleEdges;
}
