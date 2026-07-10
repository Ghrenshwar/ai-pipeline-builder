import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePipelineSubmit } from "@/hooks/usePipelineSubmit";
import { isDag } from "@/lib/dag";
import { useNodeStore } from "@/store/useNodeStore";

export function SubmitBar() {
  const nodes = useNodeStore((state) => state.nodes);
  const edges = useNodeStore((state) => state.edges);
  const dag = isDag(nodes, edges);
  const { submit, isSubmitting, result, error, open, setOpen } = usePipelineSubmit(nodes, edges);

  return (
    <footer className="z-30 border-t border-zinc-200/80 bg-white/84 px-4 py-3 shadow-[0_-12px_36px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/76">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{nodes.length} nodes</Badge>
          <Badge>{edges.length} edges</Badge>
          <Badge tone={dag ? "success" : "danger"}>{dag ? "DAG valid" : "Cycle"}</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="hidden sm:inline">Backend parse validates with Kahn's algorithm.</span>
          <Button disabled={isSubmitting} onClick={() => void submit()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit Pipeline
          </Button>
        </div>
      </div>

      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{error ? "Unable to analyze pipeline" : "Pipeline analysis complete"}</AlertDialogTitle>
            <AlertDialogDescription>
              {error
                ? `The request failed: ${error}`
                : "FastAPI parsed the graph and returned the production stats below."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {result ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/6">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Nodes</p>
                <p className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{result.num_nodes}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/6">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Edges</p>
                <p className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{result.num_edges}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/6">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">DAG</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                  {result.is_dag ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  {result.is_dag ? "Valid" : "Cycle"}
                </p>
              </div>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button>Done</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
}
