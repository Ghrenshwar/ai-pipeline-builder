import { memo, type ReactNode } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { AlertCircle, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNodeStore } from "@/store/useNodeStore";
import type { NodeConfig, NodePort, PipelineNodeProps } from "@/types/pipeline";

const nodeChrome: Record<string, { gradient: string }> = {
  customInput: { gradient: "from-blue-500 via-sky-500 to-cyan-400" },
  llm: { gradient: "from-violet-500 via-purple-500 to-fuchsia-500" },
  customOutput: { gradient: "from-emerald-500 via-green-500 to-teal-400" },
  text: { gradient: "from-indigo-500 via-blue-500 to-sky-400" },
  custom: { gradient: "from-fuchsia-500 via-purple-500 to-violet-500" },
  api: { gradient: "from-cyan-500 via-sky-500 to-blue-500" },
  filter: { gradient: "from-orange-500 via-amber-500 to-yellow-400" },
  transform: { gradient: "from-teal-500 via-emerald-500 to-lime-400" },
  branch: { gradient: "from-amber-500 via-orange-500 to-rose-500" },
  database: { gradient: "from-pink-500 via-rose-500 to-red-400" },
};

interface BaseNodeProps extends PipelineNodeProps {
  config: NodeConfig;
  inputs?: NodePort[];
  width?: number;
  height?: number;
  children?: ReactNode;
  error?: string;
}

export const BaseNode = memo(function BaseNode({
  id,
  data,
  selected,
  config,
  inputs = config.inputs,
  width = 280,
  height,
  children,
  error,
}: BaseNodeProps) {
  const updateNodeField = useNodeStore((state) => state.updateNodeField);
  const Icon = config.icon;
  const chrome = nodeChrome[config.type] ?? nodeChrome.custom;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "group relative overflow-visible rounded-2xl border border-zinc-200/80 bg-white/92 shadow-node backdrop-blur-xl transition dark:border-white/10 dark:bg-zinc-900/92 dark:shadow-node-dark",
        selected &&
          "ring-2 ring-teal-500/70 ring-offset-2 ring-offset-zinc-50 dark:ring-teal-300/70 dark:ring-offset-zinc-950",
      )}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      style={{ width, minHeight: height }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={cn("rounded-t-2xl bg-gradient-to-r px-3.5 py-3 text-white", chrome.gradient)}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/18 text-white ring-1 ring-white/25 backdrop-blur">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold leading-5 tracking-[-0.01em]">{config.title}</h3>
            <p className="truncate text-xs font-medium text-white/78">{config.description}</p>
          </div>
          <button
            aria-label={`${config.title} node actions`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/16 hover:text-white active:scale-95"
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-3.5">
        {children ?? (
          <div className="grid gap-3">
            {config.fields.map((field) => {
              const value = data.fields[field.name] ?? field.defaultValue;
              return (
                <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300" key={field.name}>
                  <span className="tracking-[0.01em]">{field.label}</span>
                  {field.type === "select" && field.options ? (
                    <Select
                      options={field.options}
                      value={String(value)}
                      onChange={(event) => updateNodeField(id, field.name, event.target.value)}
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.placeholder}
                      rows={field.rows ?? 3}
                      value={String(value)}
                      onChange={(event) => updateNodeField(id, field.name, event.target.value)}
                    />
                  ) : field.type === "checkbox" ? (
                    <input
                      checked={Boolean(value)}
                      className="h-4 w-4 rounded border-zinc-300 accent-teal-600 dark:border-zinc-700"
                      type="checkbox"
                      onChange={(event) => updateNodeField(id, field.name, event.target.checked)}
                    />
                  ) : (
                    <Input
                      placeholder={field.placeholder}
                      value={String(value)}
                      onChange={(event) => updateNodeField(id, field.name, event.target.value)}
                    />
                  )}
                </label>
              );
            })}
          </div>
        )}

        {error ? (
          <div className="mt-3 flex items-start gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      {inputs.map((input, index) => (
        <div
          className="absolute left-0 flex -translate-x-full items-center gap-1.5 pr-2 text-[10px] font-semibold text-zinc-500 opacity-80 transition-all group-hover:opacity-100 dark:text-zinc-400"
          key={input.id}
          style={{ top: `${((index + 1) * 100) / (inputs.length + 1)}%` }}
        >
          <span className="max-w-[76px] truncate rounded-lg bg-white/90 px-1.5 py-0.5 shadow-sm ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-900/90 dark:ring-white/10">
            {input.label}
          </span>
          <Handle
            className="!h-3.5 !w-3.5 !border-2 !border-white dark:!border-zinc-950"
            id={input.id}
            position={Position.Left}
            style={{ background: config.accentColor }}
            type="target"
          />
        </div>
      ))}

      {config.outputs.map((output, index) => (
        <div
          className="absolute right-0 flex translate-x-full items-center gap-1.5 pl-2 text-[10px] font-semibold text-zinc-500 opacity-80 transition-all group-hover:opacity-100 dark:text-zinc-400"
          key={output.id}
          style={{ top: `${((index + 1) * 100) / (config.outputs.length + 1)}%` }}
        >
          <Handle
            className="!h-3.5 !w-3.5 !border-2 !border-white dark:!border-zinc-950"
            id={output.id}
            position={Position.Right}
            style={{ background: config.accentColor }}
            type="source"
          />
          <span className="max-w-[76px] truncate rounded-lg bg-white/90 px-1.5 py-0.5 shadow-sm ring-1 ring-zinc-200/70 backdrop-blur dark:bg-zinc-900/90 dark:ring-white/10">
            {output.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
});
