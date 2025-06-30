import { create } from "zustand";
import type { Node } from "~/gen/node/v1/node_pb";

interface SelectionState {
	isSelectionMode: boolean;
	setSelectionMode: (mode: boolean) => void;
	selectedNodes: Set<string>;
	toggleNodeSelection: (nodeId: string) => void;
	selectNode: (nodeId: string) => void;
	deselectNode: (nodeId: string) => void;
	clearSelection: () => void;
	getSelectedNodesData: (allNodes: Node[]) => Node[];
}

export const useSelectionStore = create<SelectionState>()((set, get) => ({
	isSelectionMode: false,
	setSelectionMode: (mode) => {
		set({ isSelectionMode: mode });
		if (!mode) {
			get().clearSelection();
		}
	},
	selectedNodes: new Set(),
	toggleNodeSelection: (nodeId) => {
		const { selectedNodes } = get();
		const newSelection = new Set(selectedNodes);
		if (newSelection.has(nodeId)) {
			newSelection.delete(nodeId);
		} else {
			newSelection.add(nodeId);
		}
		set({ selectedNodes: newSelection });
	},
	selectNode: (nodeId) => {
		const { selectedNodes } = get();
		const newSelection = new Set(selectedNodes);
		newSelection.add(nodeId);
		set({ selectedNodes: newSelection });
	},
	deselectNode: (nodeId) => {
		const { selectedNodes } = get();
		const newSelection = new Set(selectedNodes);
		newSelection.delete(nodeId);
		set({ selectedNodes: newSelection });
	},
	clearSelection: () => {
		set({ selectedNodes: new Set() });
	},
	getSelectedNodesData: (allNodes) => {
		const { selectedNodes } = get();
		return allNodes.filter((node) => selectedNodes.has(node.id));
	},
}));
