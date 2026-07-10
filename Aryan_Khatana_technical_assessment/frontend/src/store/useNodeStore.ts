import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from "reactflow";
import { nodeConfigByType } from "@/components/nodes/nodeConfigs";
import { getCycleEdgeIds, getTopologicalOrder } from "@/lib/dag";
import { layoutPipeline } from "@/lib/layout";
import { loadPipeline, savePipeline } from "@/lib/storage";
import type { NodeField, NodePort, PipelineEdge, PipelineNode, PortType } from "@/types/pipeline";

interface Snapshot {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

interface NodeStore {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNodeId: string | null;
  copiedNode: PipelineNode | null;
  isRunning: boolean;
  past: Snapshot[];
  future: Snapshot[];
  createNode: (type: string, position: XYPosition) => void;
  addNode: (node: PipelineNode) => void;
  setGraph: (nodes: PipelineNode[], edges: PipelineEdge[], record?: boolean) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeField: (nodeId: string, fieldName: string, value: string | boolean | string[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  copySelectedNode: () => void;
  pasteCopiedNode: () => void;
  duplicateSelectedNode: () => void;
  deleteSelectedNode: () => void;
  undo: () => void;
  redo: () => void;
  autoLayout: () => void;
  saveLocal: () => void;
  loadLocal: () => boolean;
  exportGraph: () => Snapshot;
  runPreview: () => Promise<void>;
}

function defaultFields(fields: NodeField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue])) as Record<
    string,
    string | boolean
  >;
}

function nextNodeId(type: string, nodes: PipelineNode[]) {
  const count = nodes.filter((node) => node.data.nodeType === type).length + 1;
  return `${type}-${count}`;
}

function makeEdge(connection: Connection, accentColor = "#0d9488"): PipelineEdge {
  return {
    ...connection,
    id: `${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
    style: { "--edge-color": accentColor, stroke: accentColor } as PipelineEdge["style"],
    data: { isCycle: false },
  } as PipelineEdge;
}

function getNodePort(node: PipelineNode | undefined, handleId: string | null | undefined, side: "input" | "output"): NodePort | null {
  if (!node || !handleId) return null;
  const config = nodeConfigByType.get(node.data.nodeType);
  if (!config) return null;
  const ports = side === "input" ? config.inputs : config.outputs;
  const port = ports.find((item) => item.id === handleId);
  if (port) return port;
  if (node.data.nodeType === "text" && side === "input" && node.data.variables?.includes(handleId)) {
    return { id: handleId, label: handleId, type: "string" };
  }
  return null;
}

function compatible(source: PortType, target: PortType) {
  return source === target || target === "json" || source === "json";
}

function annotateCycles(nodes: PipelineNode[], edges: PipelineEdge[]) {
  const cycleIds = getCycleEdgeIds(nodes, edges);
  return edges.map((edge) => ({
    ...edge,
    className: cycleIds.has(edge.id) ? "edge-cycle" : undefined,
    data: { ...edge.data, isCycle: cycleIds.has(edge.id) },
  }));
}

function withHistory(state: NodeStore, nodes: PipelineNode[], edges: PipelineEdge[], record = true) {
  return {
    nodes,
    edges: annotateCycles(nodes, edges),
    past: record ? [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-60) : state.past,
    future: record ? [] : state.future,
  };
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  copiedNode: null,
  isRunning: false,
  past: [],
  future: [],

  createNode: (type, position) => {
    const config = nodeConfigByType.get(type);
    if (!config) return;
    const id = nextNodeId(type, get().nodes);
    get().addNode({
      id,
      type,
      position,
      data: {
        nodeType: type,
        label: config.title,
        category: config.category,
        fields: defaultFields(config.fields),
        variables: type === "text" ? [] : undefined,
      },
    });
  },

  addNode: (node) => {
    set((state) => ({
      ...withHistory(state, [...state.nodes, node], state.edges),
      selectedNodeId: node.id,
    }));
  },

  setGraph: (nodes, edges, record = true) => {
    set((state) => withHistory(state, nodes, edges, record));
  },

  onNodesChange: (changes) => {
    set((state) => withHistory(state, applyNodeChanges(changes, state.nodes), state.edges));
  },

  onEdgesChange: (changes) => {
    set((state) => withHistory(state, state.nodes, applyEdgeChanges(changes, state.edges)));
  },

  onConnect: (connection) => {
    const state = get();
    const sourceNode = state.nodes.find((node) => node.id === connection.source);
    const targetNode = state.nodes.find((node) => node.id === connection.target);
    const sourcePort = getNodePort(sourceNode, connection.sourceHandle, "output");
    const targetPort = getNodePort(targetNode, connection.targetHandle, "input");
    if (!sourcePort || !targetPort || !compatible(sourcePort.type, targetPort.type)) return;
    const edge = makeEdge(connection, sourceNode ? nodeConfigByType.get(sourceNode.data.nodeType)?.accentColor : undefined);
    set((current) => withHistory(current, current.nodes, addEdge(edge, current.edges)));
  },

  updateNodeField: (nodeId, fieldName, value) => {
    set((state) => {
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        if (fieldName === "variables" && Array.isArray(value)) {
          return { ...node, data: { ...node.data, variables: value } };
        }
        if (fieldName === "execution" && typeof value === "string") {
          return { ...node, data: { ...node.data, execution: value } };
        }
        if (typeof value !== "string" && typeof value !== "boolean") return node;
        return {
          ...node,
          data: { ...node.data, fields: { ...node.data.fields, [fieldName]: value } },
        };
      });
      return withHistory(state, nodes, state.edges, false);
    });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  copySelectedNode: () => {
    const selected = get().nodes.find((node) => node.id === get().selectedNodeId);
    if (selected) set({ copiedNode: selected });
  },

  pasteCopiedNode: () => {
    const { copiedNode, nodes, edges } = get();
    if (!copiedNode) return;
    const id = nextNodeId(copiedNode.data.nodeType, nodes);
    const pastedNode: PipelineNode = {
      ...copiedNode,
      id,
      selected: true,
      position: {
        x: copiedNode.position.x + 36,
        y: copiedNode.position.y + 36,
      },
      data: {
        ...copiedNode.data,
        fields: { ...copiedNode.data.fields },
        variables: copiedNode.data.variables ? [...copiedNode.data.variables] : undefined,
      },
    };
    set((state) => ({
      ...withHistory(state, [...nodes, pastedNode], edges),
      selectedNodeId: id,
    }));
  },

  duplicateSelectedNode: () => {
    get().copySelectedNode();
    get().pasteCopiedNode();
  },

  deleteSelectedNode: () => {
    const selectedNodeId = get().selectedNodeId;
    if (!selectedNodeId) return;
    set((state) => ({
      ...withHistory(
        state,
        state.nodes.filter((node) => node.id !== selectedNodeId),
        state.edges.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId),
      ),
      selectedNodeId: null,
    }));
  },

  undo: () => {
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        nodes: previous.nodes,
        edges: previous.edges,
        past: state.past.slice(0, -1),
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future].slice(0, 60),
      };
    });
  },

  redo: () => {
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      return {
        nodes: next.nodes,
        edges: next.edges,
        past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-60),
        future: state.future.slice(1),
      };
    });
  },

  autoLayout: () => {
    set((state) => withHistory(state, layoutPipeline(state.nodes, state.edges), state.edges));
  },

  saveLocal: () => savePipeline({ nodes: get().nodes, edges: get().edges }),

  loadLocal: () => {
    const pipeline = loadPipeline();
    if (!pipeline) return false;
    get().setGraph(pipeline.nodes, pipeline.edges);
    return true;
  },

  exportGraph: () => ({ nodes: get().nodes, edges: get().edges }),

  runPreview: async () => {
    const { nodes, edges } = get();
    const order = getTopologicalOrder(nodes, edges);
    if (!order.length && nodes.length) return;
    set({ isRunning: true });
    for (const nodeId of order) {
      const node = get().nodes.find((item) => item.id === nodeId);
      if (!node) continue;
      const output = `${node.data.label} completed`;
      for (let index = 1; index <= output.length; index += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 18));
        get().updateNodeField(nodeId, "execution", output.slice(0, index));
      }
    }
    set({ isRunning: false });
  },
}));
