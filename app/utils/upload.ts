import { uploadClient } from "~/client/connect";
import { nodeClient } from "~/client/connect";
import { type UploadTask } from "~/stores/upload";

/**
 * 计算文件的SHA-256 hash
 */
export async function calculateFileHash(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 上传进度回调
 */
export type UploadProgressCallback = (progress: {
	loaded: number;
	total: number;
	percentage: number;
	status: "hashing" | "checking" | "uploading" | "completing" | "done";
	message?: string;
}) => void;

/**
 * 上传单个文件
 */
export async function uploadFile(
	file: File,
	parentId: string | undefined,
	onProgress?: UploadProgressCallback,
): Promise<{ success: boolean; nodeId?: string; error?: string }> {
	try {
		// 1. 计算文件hash
		onProgress?.({
			loaded: 0,
			total: file.size,
			percentage: 0,
			status: "hashing",
			message: "正在计算文件hash...",
		});

		const fileHash = await calculateFileHash(file);

		// 2. 检查文件是否已存在（秒传）
		onProgress?.({
			loaded: 0,
			total: file.size,
			percentage: 0,
			status: "checking",
			message: "检查文件是否存在...",
		});

		const checkResponse = await uploadClient.checkFileHash({ fileHash });

		if (checkResponse.exists) {
			// 文件已存在，直接创建节点
			const nodeResponse = await nodeClient.createNode({
				parentId: parentId || "",
				name: file.name,
				isFolder: false,
				hash: fileHash,
			});

			onProgress?.({
				loaded: file.size,
				total: file.size,
				percentage: 100,
				status: "done",
				message: "文件秒传成功",
			});

			return { success: true, nodeId: nodeResponse.node?.id };
		}

		// 3. 获取上传会话
		const sessionResponse = await uploadClient.getUploadSession({
			fileHash,
			fileSize: BigInt(file.size),
		});

		const { sessionId, totalChunks, chunkSize, uploadedChunks } =
			sessionResponse;
		const chunkSizeNumber = Number(chunkSize);

		onProgress?.({
			loaded: uploadedChunks.length * chunkSizeNumber,
			total: file.size,
			percentage: Math.round((uploadedChunks.length / totalChunks) * 100),
			status: "uploading",
			message: `开始上传 (${uploadedChunks.length}/${totalChunks} 分块已完成)`,
		});

		// 4. 上传未完成的分块
		for (let i = 0; i < totalChunks; i++) {
			const chunkNumber = i + 1; // chunk number从1开始

			// 跳过已上传的分块（断点续传）
			if (uploadedChunks.includes(chunkNumber)) {
				continue;
			}

			const start = i * chunkSizeNumber;
			const end = Math.min(start + chunkSizeNumber, file.size);
			const chunkData = file.slice(start, end);
			const chunkBuffer = await chunkData.arrayBuffer();

			const chunkResponse = await uploadClient.uploadChunk({
				sessionId,
				chunkNumber,
				chunkData: new Uint8Array(chunkBuffer),
			});

			if (!chunkResponse.success) {
				throw new Error(`分块 ${chunkNumber} 上传失败`);
			}

			// 更新进度
			const uploadedBytes = (i + 1) * chunkSizeNumber;
			onProgress?.({
				loaded: Math.min(uploadedBytes, file.size),
				total: file.size,
				percentage: Math.round(
					(Math.min(uploadedBytes, file.size) / file.size) * 100,
				),
				status: "uploading",
				message: `上传中... (${i + 1}/${totalChunks})`,
			});

			// 如果所有分块都完成了，可以提前退出
			if (chunkResponse.uploadCompleted) {
				break;
			}
		}

		// 5. 完成上传
		onProgress?.({
			loaded: file.size,
			total: file.size,
			percentage: 100,
			status: "completing",
			message: "正在完成上传...",
		});

		const completeResponse = await uploadClient.completeUpload({ sessionId });

		if (!completeResponse.success) {
			throw new Error("完成上传失败");
		}

		// 6. 创建文件节点
		const nodeResponse = await nodeClient.createNode({
			parentId: parentId || "",
			name: file.name,
			isFolder: false,
			hash: completeResponse.storageHash,
		});

		onProgress?.({
			loaded: file.size,
			total: file.size,
			percentage: 100,
			status: "done",
			message: "上传完成",
		});

		return { success: true, nodeId: nodeResponse.node?.id };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "上传失败",
		};
	}
}

/**
 * 批量上传多个文件
 */
export async function uploadFiles(
	files: FileList,
	parentId: string | undefined,
	onProgress?: UploadProgressCallback,
): Promise<{
	success: boolean;
	uploaded: number;
	failed: number;
	errors: string[];
}> {
	const results = {
		success: true,
		uploaded: 0,
		failed: 0,
		errors: [] as string[],
	};

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		const result = await uploadFile(file, parentId, (progress) => {
			// 调整进度以反映多文件上传的总体进度
			const fileProgress = progress.percentage / files.length;
			const totalProgress = (i / files.length) * 100 + fileProgress;

			onProgress?.({
				loaded: 0, // 这里可以计算更精确的已上传字节数
				total: 0, // 这里可以计算总字节数
				percentage: Math.round(totalProgress),
				status: progress.status,
				message: `[${i + 1}/${files.length}] ${file.name}: ${progress.message}`,
			});
		});

		if (result.success) {
			results.uploaded++;
		} else {
			results.failed++;
			results.errors.push(`${file.name}: ${result.error}`);
		}
	}

	if (results.failed > 0) {
		results.success = false;
	}

	return results;
}

/**
 * 使用队列系统上传文件
 */
export async function uploadFileWithQueue(
	taskId: string,
	file: File,
	parentId: string | undefined,
	updateTask: (id: string, updates: Partial<UploadTask>) => void,
): Promise<void> {
	try {
		// 使用现有的uploadFile函数，但通过队列更新进度
		const result = await uploadFile(file, parentId, (progress) => {
			updateTask(taskId, {
				status: progress.status,
				progress: progress.percentage,
				message: progress.message || `${progress.status}...`,
			});
		});

		if (result.success) {
			updateTask(taskId, {
				status: "completed",
				progress: 100,
				message: "上传完成",
				nodeId: result.nodeId,
				endTime: Date.now(),
			});
		} else {
			updateTask(taskId, {
				status: "failed",
				progress: 0,
				message: "上传失败",
				error: result.error,
				endTime: Date.now(),
			});
		}
	} catch (error) {
		updateTask(taskId, {
			status: "failed",
			progress: 0,
			message: "上传失败",
			error: error instanceof Error ? error.message : "未知错误",
			endTime: Date.now(),
		});
	}
}

/**
 * 启动队列上传处理器
 */
export function startQueueProcessor(
	tasks: any[],
	updateTask: (id: string, updates: any) => void,
	retryTask: (id: string) => void,
) {
	// 处理所有等待中的任务
	const pendingTasks = tasks.filter((task) => task.status === "pending");

	// 逐个处理任务（可以改为并发处理）
	pendingTasks.forEach(async (task) => {
		await uploadFileWithQueue(task.id, task.file, task.parentId, updateTask);
	});
}
