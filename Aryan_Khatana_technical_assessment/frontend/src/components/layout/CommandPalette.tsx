import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { nodeConfigs } from "@/components/nodes/nodeConfigs";
import { useNodeStore } from "@/store/useNodeStore";
import type { NodeCategory } from "@/types/pipeline";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<NodeCategory, string> = {
  input: "Inputs",
  llm: "AI models",
  output: "Outputs",
  logic: "Logic",
  data: "Data",
};

const categories: NodeCategory[] = ["input", "llm", "logic", "data", "output"];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const createNode = useNodeStore((state) => state.createNode);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-sm dark:bg-black/55" />
        <Dialog.Content asChild>
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed left-1/2 top-[16vh] z-50 w-[min(92vw,640px)] -translate-x-1/2 overflow-hidden rounded-[22px] border border-zinc-200/80 bg-white/92 shadow-panel backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/92 dark:shadow-panel-dark"
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Command className="bg-transparent">
              <CommandInput autoFocus placeholder="Search nodes, actions, and workflow blocks..." />
              <CommandList className="max-h-[420px] overflow-y-auto p-2">
                <CommandEmpty className="px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No matching node. Try API, Text, LLM, or Database.
                </CommandEmpty>
                {categories.map((category) => {
                  const nodes = nodeConfigs.filter((config) => config.category === category);
                  return (
                    <CommandGroup
                      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-zinc-400"
                      heading={categoryLabels[category]}
                      key={category}
                    >
                      {nodes.map((config, index) => {
                        const Icon = config.icon;
                        return (
                          <CommandItem
                            className="rounded-2xl px-3 py-2.5"
                            key={config.type}
                            onSelect={() => {
                              createNode(config.type, { x: 120 + index * 18, y: 120 + index * 12 });
                              onOpenChange(false);
                            }}
                            value={`${config.title} ${config.description} ${categoryLabels[category]}`}
                          >
                            <span
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-white/8 dark:text-zinc-200 dark:ring-white/10"
                              style={{ color: config.accentColor }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold text-zinc-900 dark:text-zinc-100">{config.title}</span>
                              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{config.description}</span>
                            </span>
                            <span className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-400 dark:border-white/10 dark:bg-zinc-900">
                              Enter
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
