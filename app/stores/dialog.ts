import { create } from "zustand";

interface DialogState {
	createFolderDialog: boolean;
	setCreateFolderDialog: (show: boolean) => void;
	deleteConfirmDialog: boolean;
	setDeleteConfirmDialog: (show: boolean) => void;
	renameNodeDialog: boolean;
	setRenameNodeDialog: (show: boolean) => void;
	uploadQueueDialog: boolean;
	setUploadQueueDialog: (show: boolean) => void;
	offlineDownloadDialog: boolean;
	setOfflineDownloadDialog: (show: boolean) => void;
	downloadFileDialog: boolean;
	setDownloadFileDialog: (show: boolean) => void;
}

export const useDialogStore = create<DialogState>()((set) => ({
	createFolderDialog: false,
	setCreateFolderDialog: (show) => set({ createFolderDialog: show }),
	deleteConfirmDialog: false,
	setDeleteConfirmDialog: (show) => set({ deleteConfirmDialog: show }),
	renameNodeDialog: false,
	setRenameNodeDialog: (show) => set({ renameNodeDialog: show }),
	uploadQueueDialog: false,
	setUploadQueueDialog: (show) => set({ uploadQueueDialog: show }),
	offlineDownloadDialog: false,
	setOfflineDownloadDialog: (show) => set({ offlineDownloadDialog: show }),
	downloadFileDialog: false,
	setDownloadFileDialog: (show) => set({ downloadFileDialog: show }),
}));
