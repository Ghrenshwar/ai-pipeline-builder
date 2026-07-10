import type { CSSProperties, ChangeEvent, DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FolderOpen,
  Keyboard,
  LayoutDashboard,
  Moon,
  Play,
  RotateCcw,
  RotateCw,
  Save,
  Search,
  Sun,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { nodeConfigs } from "@/components/nodes/nodeConfigs";
import { downloadJson } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useNodeStore } from "@/store/useNodeStore";
import type { NodeCategory, PipelineEdge, PipelineNode } from "@/types/pipeline";

interface ToolbarProps {
  onCommandPalette: () => void;
  onCheatsheet: () => void;
}

const categoryLabels: Record<NodeCategory, string> = {
  input: "Inputs",
  llm: "AI",
  output: "Outputs",
  logic: "Logic",
  data: "Data",
};

const categoryOrder: NodeCategory[] = ["input", "llm", "logic", "data", "output"];

export function Toolbar({ onCommandPalette, onCheatsheet }: ToolbarProps) {
  const createNode = useNodeStore((state) => state.createNode);
  const undo = useNodeStore((state) => state.undo);
  const redo = useNodeStore((state) => state.redo);
  const autoLayout = useNodeStore((state) => state.autoLayout);
  const saveLocal = useNodeStore((state) => state.saveLocal);
  const loadLocal = useNodeStore((state) => state.loadLocal);
  const exportGraph = useNodeStore((state) => state.exportGraph);
  const setGraph = useNodeStore((state) => state.setGraph);
  const runPreview = useNodeStore((state) => state.runPreview);
  const isRunning = useNodeStore((state) => state.isRunning);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<NodeCategory>>(new Set());
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("vectorshift-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem("vectorshift-theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categoryOrder
      .map((category) => ({
        category,
        nodes: nodeConfigs.filter(
          (config) =>
            config.category === category &&
            (!normalized ||
              `${config.title} ${config.description} ${config.type}`.toLowerCase().includes(normalized)),
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [query]);

  const onDragStart = (event: DragEvent<HTMLButtonElement>, type: string) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType: type }));
    event.dataTransfer.effectAllowed = "move";
  };

  const importPipeline = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as { nodes: PipelineNode[]; edges: PipelineEdge[] };
    setGraph(parsed.nodes, parsed.edges);
    toast.success("Pipeline imported");
    event.target.value = "";
  };

  const toggleCategory = (category: NodeCategory) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/78 px-4 py-3 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/70">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto min-w-[210px]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">VectorShift</p>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Pipeline Builder</h1>
        </div>

        <Button aria-label="Open command palette" onClick={onCommandPalette} title="Open command palette (Ctrl+K)" variant="secondary">
          <span className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
            Ctrl K
          </span>
          Add Node
        </Button>

        <div className="hidden h-8 w-px bg-zinc-200 dark:bg-white/10 sm:block" />

        <Button onClick={undo} size="icon" title="Undo" variant="ghost"><RotateCcw className="h-4 w-4" /></Button>
        <Button onClick={redo} size="icon" title="Redo" variant="ghost"><RotateCw className="h-4 w-4" /></Button>
        <Button onClick={autoLayout} size="icon" title="Auto-layout" variant="ghost"><LayoutDashboard className="h-4 w-4" /></Button>

        <div className="hidden h-8 w-px bg-zinc-200 dark:bg-white/10 md:block" />

        <Button onClick={() => { saveLocal(); toast.success("Pipeline saved locally"); }} size="icon" title="Save" variant="ghost"><Save className="h-4 w-4" /></Button>
        <Button onClick={() => {
          const loaded = loadLocal();
          toast[loaded ? "success" : "error"](loaded ? "Pipeline loaded" : "No saved pipeline");
        }} size="icon" title="Load" variant="ghost"><FolderOpen className="h-4 w-4" /></Button>
        <Button onClick={() => downloadJson("vectorshift-pipeline.json", exportGraph())} size="icon" title="Export JSON" variant="ghost"><Download className="h-4 w-4" /></Button>
        <Button onClick={() => fileRef.current?.click()} size="icon" title="Import JSON" variant="ghost"><Upload className="h-4 w-4" /></Button>

        <Button disabled={isRunning} onClick={() => void runPreview()} title="Run preview" variant="secondary">
          <Play className="h-4 w-4" /> {isRunning ? "Running" : "Run"}
        </Button>
        <Button onClick={() => setDarkMode((value) => !value)} size="icon" title="Toggle theme" variant="ghost">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button onClick={onCheatsheet} size="icon" title="Shortcuts" variant="ghost"><Keyboard className="h-4 w-4" /></Button>
        <input accept="application/json" className="hidden" onChange={(event) => void importPipeline(event)} ref={fileRef} type="file" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            aria-label="Search nodes"
            className="h-10 w-full rounded-2xl border border-zinc-200 bg-white/80 pl-9 pr-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-white/10 dark:bg-zinc-900/68 dark:text-zinc-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search node palette..."
            value={query}
          />
        </label>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {filteredGroups.length ? (
            filteredGroups.map((group) => {
              const isCollapsed = collapsed.has(group.category);
              return (
                <section className="shrink-0 rounded-2xl border border-zinc-200/70 bg-white/62 p-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/52" key={group.category}>
                  <button
                    className="mb-2 flex w-full items-center justify-between gap-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400"
                    onClick={() => toggleCategory(group.category)}
                    type="button"
                  >
                    {categoryLabels[group.category]}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition", isCollapsed && "-rotate-90")} />
                  </button>
                  {!isCollapsed ? (
                    <motion.div className="flex gap-2" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      {group.nodes.map((config, index) => {
                        const Icon = config.icon;
                        return (
                          <button
                            aria-label={`Create ${config.title} node`}
                            className="group flex min-w-[146px] items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-zinc-950/42 dark:hover:border-teal-400"
                            draggable
                            key={config.type}
                            onClick={() => createNode(config.type, { x: 80 + index * 24, y: 80 + index * 16 })}
                            onDragStart={(event) => onDragStart(event, config.type)}
                            style={{ "--node-accent": config.accentColor } as CSSProperties}
                            type="button"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 transition group-hover:text-[var(--node-accent)] dark:bg-white/8 dark:text-zinc-300 dark:ring-white/10">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-zinc-900 dark:text-zinc-100">{config.title}</span>
                              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{config.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </section>
              );
            })
          ) : (
            <div className="grid min-h-20 w-full place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900/52 dark:text-zinc-400">
              No nodes match "{query}".
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
