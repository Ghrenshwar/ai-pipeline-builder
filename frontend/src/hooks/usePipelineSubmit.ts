import { useState } from "react";
import { toast } from "sonner";
import type { PipelineEdge, PipelineNode, PipelineParseResult } from "@/types/pipeline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function usePipelineSubmit(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PipelineParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }
      const payload = (await response.json()) as PipelineParseResult;
      setResult(payload);
      setOpen(true);
      toast.success("Pipeline analyzed", {
        description: payload.is_dag ? "No cycles detected." : "Cycle detected in the graph.",
      });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to reach the FastAPI backend.";
      setError(message);
      setOpen(true);
      toast.error("Analysis failed", {
        description: "Start FastAPI on http://localhost:8000 and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, result, error, open, setOpen };
}
