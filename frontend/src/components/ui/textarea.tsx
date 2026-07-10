import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "w-full resize-none rounded-xl border border-input bg-white/90 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 dark:bg-zinc-950/45 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600",
      className,
    )}
    ref={ref}
    {...props}
  />
));

Textarea.displayName = "Textarea";
