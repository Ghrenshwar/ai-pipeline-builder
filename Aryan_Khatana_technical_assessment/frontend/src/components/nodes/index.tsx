import type { NodeTypes } from "reactflow";
import { createConfiguredNode } from "@/components/nodes/ConfiguredNode";
import { TextNode } from "@/components/nodes/TextNode";
import { nodeConfigs } from "@/components/nodes/nodeConfigs";

export const nodeTypes: NodeTypes = Object.fromEntries(
  nodeConfigs.map((config) => [
    config.type,
    config.type === "text" ? TextNode : createConfiguredNode(config),
  ]),
);
