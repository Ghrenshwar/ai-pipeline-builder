import type { Edge, Node, NodeProps } from "reactflow";
import type { LucideIcon } from "lucide-react";

export type NodeCategory = "input" | "llm" | "output" | "logic" | "data";
export type PortType = "string" | "json" | "boolean" | "records" | "number";
export type FieldType = "text" | "textarea" | "select" | "checkbox";

export interface NodePort {
  id: string;
  label: string;
  type: PortType;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface NodeField {
  name: string;
  label: string;
  type: FieldType;
  defaultValue: string | boolean;
  placeholder?: string;
  options?: SelectOption[];
  rows?: number;
}

export interface PipelineNodeData {
  nodeType: string;
  label: string;
  category: NodeCategory;
  fields: Record<string, string | boolean>;
  variables?: string[];
  execution?: string;
}

export type PipelineNode = Node<PipelineNodeData>;
export type PipelineEdge = Edge<{ isCycle?: boolean }>;
export type PipelineNodeProps = NodeProps<PipelineNodeData>;

export interface NodeConfig {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: NodeCategory;
  accentColor: string;
  inputs: NodePort[];
  outputs: NodePort[];
  fields: NodeField[];
}

export interface PipelineParseResult {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
}
