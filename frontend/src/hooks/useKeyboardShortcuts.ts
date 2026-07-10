import { useEffect } from "react";
import { useNodeStore } from "@/store/useNodeStore";

interface ShortcutOptions {
  onCommandPalette: () => void;
  onCheatsheet: () => void;
}

export function useKeyboardShortcuts({ onCommandPalette, onCheatsheet }: ShortcutOptions) {
  const undo = useNodeStore((state) => state.undo);
  const redo = useNodeStore((state) => state.redo);
  const copySelectedNode = useNodeStore((state) => state.copySelectedNode);
  const pasteCopiedNode = useNodeStore((state) => state.pasteCopiedNode);
  const duplicateSelectedNode = useNodeStore((state) => state.duplicateSelectedNode);
  const deleteSelectedNode = useNodeStore((state) => state.deleteSelectedNode);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onCommandPalette();
      }
      if (!isEditing && event.key === "?") {
        onCheatsheet();
      }
      if (!isEditing && mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (isEditing) return;
      if (mod && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelectedNode();
      }
      if (mod && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteCopiedNode();
      }
      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelectedNode();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedNode();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    copySelectedNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    onCheatsheet,
    onCommandPalette,
    pasteCopiedNode,
    redo,
    undo,
  ]);
}
