import { useLayoutEffect, useMemo, useRef } from "react";
import { BaseNode } from "@/components/nodes/BaseNode";
import { nodeConfigByType } from "@/components/nodes/nodeConfigs";
import { useVariableParser } from "@/hooks/useVariableParser";
import { cn } from "@/lib/utils";
import { useNodeStore } from "@/store/useNodeStore";
import type { NodePort, PipelineNodeProps } from "@/types/pipeline";

function highlightedHtml(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/{{\s*([^{}]+?)\s*}}/g, '<mark>{{$1}}</mark>');
}

export function TextNode(props: PipelineNodeProps) {
  const config = nodeConfigByType.get("text");
  const updateNodeField = useNodeStore((state) => state.updateNodeField);
  const text = String(props.data.fields.text ?? "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { variables, invalid } = useVariableParser(text);

  const dynamicInputs = useMemo<NodePort[]>(
    () => variables.map((variable) => ({ id: variable, label: variable, type: "string" })),
    [variables],
  );

  useLayoutEffect(() => {
    updateNodeField(props.id, "variables", variables);
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "80px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 80), 400)}px`;
  }, [props.id, text, updateNodeField, variables]);

  if (!config) return null;

  const longestLine = Math.max(20, ...text.split("\n").map((line) => line.length));
  const width = Math.min(Math.max(200, longestLine * 7.6 + 88), 500);

  return (
    <BaseNode
      {...props}
      config={config}
      inputs={dynamicInputs}
      width={width}
      error={invalid.length ? `Invalid variable name: ${invalid.join(", ")}` : undefined}
    >
      <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span>Template</span>
        <div className="relative min-h-[80px] overflow-hidden rounded-xl border border-zinc-200 bg-white/90 shadow-sm transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 dark:border-white/10 dark:bg-zinc-950/45">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 whitespace-pre-wrap break-words px-3 py-2 text-sm leading-6 text-transparent",
              "[&_mark]:rounded [&_mark]:bg-teal-100 [&_mark]:px-0.5 [&_mark]:text-teal-800 dark:[&_mark]:bg-teal-500/18 dark:[&_mark]:text-teal-200",
            )}
            dangerouslySetInnerHTML={{ __html: highlightedHtml(text) }}
          />
          <textarea
            className="relative z-10 min-h-[80px] max-h-[400px] w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-zinc-900 caret-teal-700 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            onChange={(event) => updateNodeField(props.id, "text", event.target.value)}
            placeholder="Draft a prompt with {{customerName}} or {{ticket}}"
            ref={textareaRef}
            spellCheck={false}
            value={text}
          />
        </div>
      </label>
      {variables.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {variables.map((variable) => (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:border-teal-400/20 dark:bg-teal-500/10 dark:text-teal-200" key={variable}>
              {variable}
            </span>
          ))}
        </div>
      ) : null}
    </BaseNode>
  );
}
