import { BaseNode } from "@/components/nodes/BaseNode";
import type { NodeConfig, PipelineNodeProps } from "@/types/pipeline";

export function createConfiguredNode(config: NodeConfig) {
  return function ConfiguredNode(props: PipelineNodeProps) {
    return <BaseNode {...props} config={config} />;
  };
}
