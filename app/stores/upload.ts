import { create } from "zustand";

export interface UploadTask {
	id: string;
	file: File;
	parentId?: string;
	status:
		| "pending"
		| "hashing"
		| "checking"
		| "uploading"
		| "completing"
		| "completed"
		| "failed";
	progress: number;
	message: string;
	error?: string;
	nodeId?: string;
	startTime: number;
	endTime?: number;
}

interface UploadState {
	tasks: UploadTask[];
	addTask: (file: File, parentId?: string) => string;
	updateTask: (id: string, updates: Partial<UploadTask>) => void;
	removeTask: (id: string) => void;
	clearCompleted: () => void;
	clearAll: () => void;
	retryTask: (id: string) => void;
}

export const useUploadStore = create<UploadState>()((set, get) => ({
	tasks: [],
	addTask: (file, parentId) => {
		const id = Math.random().toString(36).substring(2);
		const task: UploadTask = {
			id,
			file,
			parentId,
			status: "pending",
			progress: 0,
			message: "等待上传...",
			startTime: Date.now(),
		};
		set((state) => ({ tasks: [...state.tasks, task] }));
		return id;
	},
	updateTask: (id, updates) => {
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === id ? { ...task, ...updates } : task,
			),
		}));
	},
	removeTask: (id) => {
		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== id),
		}));
	},
	clearCompleted: () => {
		set((state) => ({
			tasks: state.tasks.filter(
				(task) => task.status !== "completed" && task.status !== "failed",
			),
		}));
	},
	clearAll: () => {
		set({ tasks: [] });
	},
	retryTask: (id) => {
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === id
					? {
							...task,
							status: "pending" as const,
							progress: 0,
							message: "等待重试...",
							error: undefined,
							startTime: Date.now(),
							endTime: undefined,
						}
					: task,
			),
		}));
	},
}));
