import { Command as CommandPrimitive } from "cmdk";
import type * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Command = CommandPrimitive;
export const CommandList = CommandPrimitive.List;
export const CommandGroup = CommandPrimitive.Group;
export const CommandEmpty = CommandPrimitive.Empty;

export function CommandInput(props: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b border-zinc-200/80 px-3 dark:border-white/10">
      <Search className="mr-2 h-4 w-4 text-zinc-400" />
      <CommandPrimitive.Input
        className="h-12 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        {...props}
      />
    </div>
  );
}

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-950 dark:text-zinc-200 dark:aria-selected:bg-white/8 dark:aria-selected:text-white",
        className,
      )}
      {...props}
    />
  );
}
