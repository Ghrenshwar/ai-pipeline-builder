import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { nodeConfigByType } from "@/components/nodes/nodeConfigs";
import { useNodeStore } from "@/store/useNodeStore";

export function ConfigPanel() {
  const selectedNodeId = useNodeStore((state) => state.selectedNodeId);
  const node = useNodeStore((state) => state.nodes.find((item) => item.id === state.selectedNodeId));
  const updateNodeField = useNodeStore((state) => state.updateNodeField);
  const setSelectedNode = useNodeStore((state) => state.setSelectedNode);
  const config = node ? nodeConfigByType.get(node.data.nodeType) : null;

  if (!node || !config) return null;
  const Icon = config.icon;

  return (
    <motion.aside
      animate={{ x: 0, opacity: 1 }}
      className="absolute right-4 top-28 z-40 w-[min(360px,calc(100vw-32px))] rounded-[22px] border border-zinc-200/80 bg-white/92 p-4 shadow-panel backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/90 dark:shadow-panel-dark"
      exit={{ x: 24, opacity: 0 }}
      initial={{ x: 24, opacity: 0 }}
      key={selectedNodeId}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-white/8 dark:text-zinc-200 dark:ring-white/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-zinc-950 dark:text-zinc-50">{config.title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{config.description}</p>
        </div>
        <Button onClick={() => setSelectedNode(null)} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3">
        {config.fields.map((field) => {
          const value = node.data.fields[field.name] ?? field.defaultValue;
          return (
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300" key={field.name}>
              <span>{field.label}</span>
              {field.type === "select" && field.options ? (
                <Select
                  options={field.options}
                  value={String(value)}
                  onChange={(event) => updateNodeField(node.id, field.name, event.target.value)}
                />
              ) : field.type === "textarea" ? (
                <Textarea
                  value={String(value)}
                  rows={5}
                  onChange={(event) => updateNodeField(node.id, field.name, event.target.value)}
                />
              ) : field.type === "checkbox" ? (
                <input
                  checked={Boolean(value)}
                  className="h-4 w-4 accent-teal-600"
                  type="checkbox"
                  onChange={(event) => updateNodeField(node.id, field.name, event.target.checked)}
                />
              ) : (
                <Input
                  value={String(value)}
                  placeholder={field.placeholder}
                  onChange={(event) => updateNodeField(node.id, field.name, event.target.value)}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/86 p-3 dark:border-white/10 dark:bg-white/6">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Live preview</p>
        <pre className="mt-2 max-h-36 overflow-auto text-xs leading-5 text-zinc-700 dark:text-zinc-300">
          {JSON.stringify({ id: node.id, type: node.data.nodeType, fields: node.data.fields }, null, 2)}
        </pre>
        {node.data.execution ? (
          <div className="mt-3 rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs text-teal-200">
            {node.data.execution}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}
