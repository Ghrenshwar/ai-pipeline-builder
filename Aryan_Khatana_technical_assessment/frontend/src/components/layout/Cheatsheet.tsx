import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CheatsheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  ["Ctrl K", "Open command palette"],
  ["Ctrl Z", "Undo"],
  ["Ctrl Shift Z", "Redo"],
  ["Ctrl C / V", "Copy and paste selected node"],
  ["Ctrl D", "Duplicate selected node"],
  ["Delete", "Delete selected node"],
  ["Right click", "Open node menu"],
  ["?", "Show shortcuts"],
  ["Drag", "Connect compatible handles"],
];

export function Cheatsheet({ open, onOpenChange }: CheatsheetProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-sm dark:bg-black/55" />
        <Dialog.Content asChild>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-zinc-200/80 bg-white/92 p-5 shadow-panel backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/92 dark:shadow-panel-dark"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <Dialog.Title className="text-lg font-semibold tracking-[-0.01em] text-zinc-950 dark:text-zinc-50">
              Keyboard shortcuts
            </Dialog.Title>
            <div className="mt-4 grid gap-2">
              {shortcuts.map(([keys, description]) => (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 px-3 py-2.5 dark:bg-white/6" key={keys}>
                  <kbd className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                    {keys}
                  </kbd>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">{description}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Dialog.Close asChild>
                <Button>Close</Button>
              </Dialog.Close>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
