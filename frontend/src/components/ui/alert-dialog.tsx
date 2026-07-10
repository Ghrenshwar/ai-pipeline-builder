import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-sm dark:bg-black/55" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 outline-none",
          className,
        )}
        {...props}
      >
        <motion.div
          className="rounded-[22px] border border-zinc-200/80 bg-white/94 p-5 shadow-panel backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/94 dark:shadow-panel-dark"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        >
          {children}
        </motion.div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="grid gap-2" {...props} />;
}

export function AlertDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-5 flex justify-end gap-2" {...props} />;
}

export function AlertDialogTitle(props: AlertDialogPrimitive.AlertDialogTitleProps) {
  return <AlertDialogPrimitive.Title className="text-lg font-semibold text-zinc-950 dark:text-zinc-50" {...props} />;
}

export function AlertDialogDescription(
  props: AlertDialogPrimitive.AlertDialogDescriptionProps,
) {
  return (
    <AlertDialogPrimitive.Description
      className="text-sm leading-6 text-zinc-600 dark:text-zinc-400"
      {...props}
    />
  );
}
