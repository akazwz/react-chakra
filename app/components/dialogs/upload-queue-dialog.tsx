import {
	Dialog,
	Portal,
	CloseButton,
	Stack,
	Text,
	HStack,
	VStack,
	IconButton,
	Icon,
	Progress,
	Button,
	Separator,
	Box,
	Badge,
} from "@chakra-ui/react";
import {
	RiDeleteBin6Line,
	RiRefreshLine,
	RiCheckLine,
	RiErrorWarningLine,
	RiLoader4Line,
	RiTimeLine,
} from "react-icons/ri";

import { useUploadStore, type UploadTask } from "~/stores/upload";
import { useDialogStore } from "~/stores/dialog";

// 工具函数
const formatFileSize = (bytes: number) => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const formatDuration = (startTime: number, endTime?: number) => {
	const duration = (endTime || Date.now()) - startTime;
	const seconds = Math.floor(duration / 1000);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	return `${minutes}m ${seconds % 60}s`;
};

const getStatusText = (status: UploadTask["status"]) => {
	switch (status) {
		case "pending":
			return "等待中";
		case "hashing":
			return "计算中";
		case "checking":
			return "检查中";
		case "uploading":
			return "上传中";
		case "completing":
			return "完成中";
		case "completed":
			return "已完成";
		case "failed":
			return "失败";
		default:
			return status;
	}
};

const getStatusColor = (status: UploadTask["status"]) => {
	switch (status) {
		case "completed":
			return "green";
		case "failed":
			return "red";
		case "pending":
			return "gray";
		default:
			return "blue";
	}
};

export default function UploadQueueDialog() {
	const { tasks, removeTask, clearCompleted, clearAll, retryTask } =
		useUploadStore();
	const { uploadQueueDialog, setUploadQueueDialog } = useDialogStore();

	const activeTasks = tasks.filter(
		(task) => task.status !== "completed" && task.status !== "failed",
	);
	const completedTasks = tasks.filter((task) => task.status === "completed");
	const failedTasks = tasks.filter((task) => task.status === "failed");

	return (
		<Dialog.Root
			open={uploadQueueDialog}
			onOpenChange={(details) => setUploadQueueDialog(details.open)}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<Dialog.Header>
							<Dialog.Title>上传队列</Dialog.Title>
						</Dialog.Header>

						<Dialog.Body p={0} maxH="60vh" overflowY="auto">
							{tasks.length === 0 ? (
								<VStack py={8} gap={2}>
									<Text color="fg.muted">暂无上传任务</Text>
								</VStack>
							) : (
								<Stack gap={3} p={4}>
									{/* 进行中的任务 */}
									{activeTasks.length > 0 && (
										<>
											<Text fontSize="sm" fontWeight="medium">
												进行中 ({activeTasks.length})
											</Text>
											{activeTasks.map((task) => (
												<TaskItem key={task.id} task={task} />
											))}
										</>
									)}

									{/* 已完成的任务 */}
									{completedTasks.length > 0 && (
										<>
											{activeTasks.length > 0 && <Separator />}
											<Text fontSize="sm" fontWeight="medium">
												已完成 ({completedTasks.length})
											</Text>
											{completedTasks.map((task) => (
												<TaskItem key={task.id} task={task} />
											))}
										</>
									)}

									{/* 失败的任务 */}
									{failedTasks.length > 0 && (
										<>
											{(activeTasks.length > 0 ||
												completedTasks.length > 0) && <Separator />}
											<Text fontSize="sm" fontWeight="medium">
												失败 ({failedTasks.length})
											</Text>
											{failedTasks.map((task) => (
												<TaskItem key={task.id} task={task} />
											))}
										</>
									)}
								</Stack>
							)}
						</Dialog.Body>

						{/* Footer with action buttons */}
						{tasks.length > 0 && (
							<Dialog.Footer>
								<HStack gap={2} w="full" justifyContent="flex-end">
									{(completedTasks.length > 0 || failedTasks.length > 0) && (
										<Button variant="ghost" size="sm" onClick={clearCompleted}>
											清除已完成
										</Button>
									)}
									<Button variant="ghost" size="sm" onClick={clearAll}>
										清除全部
									</Button>
								</HStack>
							</Dialog.Footer>
						)}

						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}

function TaskItem({ task }: { task: UploadTask }) {
	const { removeTask, retryTask } = useUploadStore();

	return (
		<Box
			p={3}
			borderWidth={1}
			borderRadius="md"
			bg={task.status === "failed" ? "red.50" : undefined}
		>
			<VStack gap={2} alignItems="stretch">
				<HStack justifyContent="space-between">
					<HStack flex={1} minW={0}>
						{/* 状态图标 */}
						<Box flexShrink={0}>
							{task.status === "pending" ? (
								<Icon as={RiTimeLine} />
							) : task.status === "completed" ? (
								<Icon as={RiCheckLine} />
							) : task.status === "failed" ? (
								<Icon as={RiErrorWarningLine} />
							) : (
								<Icon as={RiLoader4Line} className="animate-spin" />
							)}
						</Box>

						{/* 文件信息 */}
						<VStack gap={0} flex={1} minW={0} alignItems="start">
							<Text fontSize="sm" fontWeight="medium" truncate w="full">
								{task.file.name}
							</Text>
							<HStack fontSize="xs" gap={2}>
								<Text>{formatFileSize(task.file.size)}</Text>
								<Badge size="sm" colorPalette={getStatusColor(task.status)}>
									{getStatusText(task.status)}
								</Badge>
								<Text>{formatDuration(task.startTime, task.endTime)}</Text>
							</HStack>
						</VStack>
					</HStack>

					{/* 操作按钮 */}
					<HStack flexShrink={0}>
						{task.status === "failed" && (
							<IconButton
								size="sm"
								variant="ghost"
								onClick={() => retryTask(task.id)}
							>
								<Icon as={RiRefreshLine} />
							</IconButton>
						)}
						{(task.status === "completed" || task.status === "failed") && (
							<IconButton
								size="sm"
								variant="ghost"
								onClick={() => removeTask(task.id)}
							>
								<Icon as={RiDeleteBin6Line} />
							</IconButton>
						)}
					</HStack>
				</HStack>

				{/* 进度条 */}
				{task.status !== "completed" && task.status !== "failed" && (
					<Progress.Root value={task.progress} max={100} size="sm">
						<Progress.Track>
							<Progress.Range />
						</Progress.Track>
					</Progress.Root>
				)}

				{/* 消息和错误 */}
				{task.message && (
					<Text
						fontSize="xs"
						color={task.status === "failed" ? "red.600" : "fg.muted"}
					>
						{task.error || task.message}
					</Text>
				)}
			</VStack>
		</Box>
	);
}
