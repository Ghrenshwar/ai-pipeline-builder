import type { PipelineEdge, PipelineNode } from "@/types/pipeline";

const STORAGE_KEY = "vectorshift.pipeline.v2";

export interface PersistedPipeline {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export function savePipeline(pipeline: PersistedPipeline) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pipeline));
}

export function loadPipeline(): PersistedPipeline | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedPipeline;
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;
    return parsed;
  } catch {
    return null;
  }
}
