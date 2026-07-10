import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ConfigPanel } from "@/components/layout/ConfigPanel";
import { PipelineCanvas } from "@/components/layout/PipelineCanvas";
import { SubmitBar } from "@/components/layout/SubmitBar";
import { Toolbar } from "@/components/layout/Toolbar";
import { Cheatsheet } from "@/components/layout/Cheatsheet";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const openCommand = useCallback(() => setCommandOpen(true), []);
  const openCheatsheet = useCallback(() => setCheatsheetOpen(true), []);

  useKeyboardShortcuts({ onCommandPalette: openCommand, onCheatsheet: openCheatsheet });

  if (window.location.pathname !== "/") {
    return (
      <div className="grid h-screen place-items-center bg-zinc-50 p-6 text-center dark:bg-zinc-950">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">404</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">This workflow view does not exist</h1>
          <p className="mt-3 max-w-md text-zinc-500 dark:text-zinc-400">Return to the pipeline builder to keep composing nodes.</p>
          <Button className="mt-6" onClick={() => window.location.assign("/")}>Open builder</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Toolbar onCheatsheet={openCheatsheet} onCommandPalette={openCommand} />
      <div className="relative flex min-h-0 flex-1">
        <PipelineCanvas />
        <ConfigPanel />
      </div>
      <SubmitBar />
      <CommandPalette onOpenChange={setCommandOpen} open={commandOpen} />
      <Cheatsheet onOpenChange={setCheatsheetOpen} open={cheatsheetOpen} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
