import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { Copy, CopyPlus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nodeTypes } from "@/components/nodes";
import { isDag } from "@/lib/dag";
import { useNodeStore } from "@/store/useNodeStore";

const proOptions = { hideAttribution: true };

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const nodes = useNodeStore((state) => state.nodes);
  const edges = useNodeStore((state) => state.edges);
  const createNode = useNodeStore((state) => state.createNode);
  const onNodesChange = useNodeStore((state) => state.onNodesChange);
  const onEdgesChange = useNodeStore((state) => state.onEdgesChange);
  const onConnect = useNodeStore((state) => state.onConnect);
  const setSelectedNode = useNodeStore((state) => state.setSelectedNode);
  const autoLayout = useNodeStore((state) => state.autoLayout);
  const copySelectedNode = useNodeStore((state) => state.copySelectedNode);
  const duplicateSelectedNode = useNodeStore((state) => state.duplicateSelectedNode);
  const deleteSelectedNode = useNodeStore((state) => state.deleteSelectedNode);
  const dag = isDag(nodes, edges);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!instance || !wrapperRef.current) return;

      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      const { nodeType } = JSON.parse(raw) as { nodeType?: string };
      if (!nodeType) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      createNode(
        nodeType,
        instance.project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        }),
      );
    },
    [createNode, instance],
  );

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.08),transparent_30%),linear-gradient(180deg,#fafafa,#f4f4f5)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.12),transparent_30%),linear-gradient(180deg,#10131d,#0b0d14)]" ref={wrapperRef}>
      <ReactFlow
        className="vectorshift-flow"
        connectionLineStyle={{ stroke: "#0d9488", strokeWidth: 2 }}
        defaultViewport={{ x: 40, y: 40, zoom: 0.94 }}
        edges={edges}
        fitView
        fitViewOptions={{ duration: 260, padding: 0.18 }}
        multiSelectionKeyCode={["Meta", "Control"]}
        nodeTypes={nodeTypes}
        nodes={nodes}
        onConnect={onConnect}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={onDrop}
        onEdgesChange={onEdgesChange}
        onInit={setInstance}
        onNodeClick={(_, node) => {
          setContextMenu(null);
          setSelectedNode(node.id);
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          const bounds = wrapperRef.current?.getBoundingClientRect();
          setSelectedNode(node.id);
          setContextMenu({
            nodeId: node.id,
            x: event.clientX - (bounds?.left ?? 0),
            y: event.clientY - (bounds?.top ?? 0),
          });
        }}
        onNodesChange={onNodesChange}
        onPaneClick={() => {
          setContextMenu(null);
          setSelectedNode(null);
        }}
        panOnScroll
        proOptions={proOptions}
        selectionOnDrag
        snapGrid={[16, 16]}
        snapToGrid
      >
        <Background color="rgba(113,113,122,0.38)" gap={24} size={1.1} variant={BackgroundVariant.Dots} />
        <Controls className="flow-controls" />
        <MiniMap
          className="flow-minimap"
          maskColor="rgba(244,244,245,0.72)"
          nodeColor={(node) => (node.selected ? "#0d9488" : "#d4d4d8")}
          pannable
          zoomable
        />
        <Panel className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/82 px-3 py-2 text-sm shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75" position="top-left">
          <Badge tone={dag ? "success" : "danger"}>{dag ? "DAG valid" : "Cycle detected"}</Badge>
          <span className="text-zinc-500 dark:text-zinc-400">{nodes.length} nodes / {edges.length} edges</span>
        </Panel>
        {nodes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 py-10">
            <div className="grid w-full max-w-[460px] justify-items-center gap-4 rounded-[24px] border border-zinc-200/70 bg-white/70 p-6 text-center shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/58 dark:shadow-panel-dark">
              <div className="relative h-32 w-60">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  className="absolute left-4 top-8 h-14 w-28 rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-400/20 dark:bg-zinc-900"
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  className="absolute right-4 top-3 h-14 w-28 rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-violet-400/20 dark:bg-zinc-900"
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  className="absolute bottom-2 left-16 h-14 w-28 rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-400/20 dark:bg-zinc-900"
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 208 112">
                  <path d="M84 45 C112 44 108 28 132 27" fill="none" stroke="#0d9488" strokeDasharray="5 5" strokeWidth="2" />
                  <path d="M94 63 C112 75 114 86 126 86" fill="none" stroke="#0d9488" strokeDasharray="5 5" strokeWidth="2" />
                </svg>
                <motion.div
                  animate={{ x: [0, 8, 0], opacity: [0.55, 1, 0.55] }}
                  className="absolute -right-2 top-14 text-2xl text-teal-600"
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {"->"}
                </motion.div>
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.01em] text-zinc-950 dark:text-zinc-50">
                  Drag nodes here to build your AI workflow
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Start with an Input, add a Text or LLM step, then connect compatible handles.
                </p>
              </div>
              <Button className="pointer-events-auto" onClick={autoLayout} variant="secondary">Auto-layout when ready</Button>
            </div>
          </div>
        ) : null}
      </ReactFlow>
      {contextMenu ? (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute z-50 min-w-44 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/92 p-1.5 text-sm shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/92"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/8"
            onClick={() => {
              copySelectedNode();
              setContextMenu(null);
            }}
            type="button"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/8"
            onClick={() => {
              duplicateSelectedNode();
              setContextMenu(null);
            }}
            type="button"
          >
            <CopyPlus className="h-4 w-4" /> Duplicate
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            onClick={() => {
              deleteSelectedNode();
              setContextMenu(null);
            }}
            type="button"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </motion.div>
      ) : null}
    </main>
  );
}

export function PipelineCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
