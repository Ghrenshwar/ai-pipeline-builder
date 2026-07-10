import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select
      className={cn(
        "h-9 w-full rounded-xl border border-input bg-white/90 px-3 text-sm text-zinc-900 shadow-sm outline-none transition hover:border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 dark:bg-zinc-950/45 dark:text-zinc-100 dark:hover:border-zinc-600",
        className,
      )}
      ref={ref}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
);

Select.displayName = "Select";
