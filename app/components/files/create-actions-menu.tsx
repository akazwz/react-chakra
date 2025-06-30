import {
	Menu,
	IconButton,
	Portal,
	Icon,
	HStack,
	Badge,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import {
	RiAddLine,
	RiFolderAddLine,
	RiUploadLine,
	RiListCheck2,
} from "react-icons/ri";
import { useQueryClient } from "@tanstack/react-query";

import { useDialogStore } from "~/stores/dialog";
import { useUploadStore } from "~/stores/upload";
import { toaster } from "~/components/ui/toaster";
import { uploadFileWithQueue } from "~/utils/upload";

interface CreateActionsMenuProps {
	parentId?: string;
}

export default function CreateActionsMenu({
	parentId,
}: CreateActionsMenuProps) {
	const { setCreateFolderDialog, setUploadQueueDialog } = useDialogStore();
	const { tasks, addTask, updateTask } = useUploadStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	// 自动处理队列中的待处理任务
	useEffect(() => {
		const processPendingTasks = async () => {
			const pendingTasks = tasks.filter((task) => task.status === "pending");

			for (const task of pendingTasks) {
				// 启动上传
				uploadFileWithQueue(task.id, task.file, task.parentId, updateTask);
			}
		};

		processPendingTasks();
	}, [tasks, updateTask]);

	// 监听上传完成，刷新文件列表
	useEffect(() => {
		const completedTasks = tasks.filter((task) => task.status === "completed");
		if (completedTasks.length > 0) {
			queryClient.invalidateQueries({ queryKey: ["nodes"] });
		}
	}, [tasks, queryClient]);

	const handleUploadFiles = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		// 将文件添加到上传队列
		for (let i = 0; i < files.length; i++) {
			addTask(files[i], parentId);
		}

		// 显示上传队列dialog
		setUploadQueueDialog(true);

		// 显示提示
		toaster.info({
			title: "已添加到上传队列",
			description: `${files.length} 个文件已添加到上传队列`,
		});

		// 清空input，允许重复选择同一文件
		event.target.value = "";
	};

	const handleShowUploadQueue = () => {
		setUploadQueueDialog(true);
	};

	// 计算活跃任务数量
	const activeTasks = tasks.filter(
		(task) => task.status !== "completed" && task.status !== "failed",
	);

	return (
		<>
			<HStack gap={2}>
				{/* 上传队列按钮 */}
				<IconButton
					size="sm"
					variant="surface"
					rounded="full"
					onClick={handleShowUploadQueue}
					position="relative"
				>
					<Icon as={RiListCheck2} />
					{activeTasks.length > 0 && (
						<Badge
							position="absolute"
							top="-1"
							right="-1"
							size="sm"
							borderRadius="full"
							px={1}
							minW={5}
							h={5}
							fontSize="xs"
						>
							{activeTasks.length}
						</Badge>
					)}
				</IconButton>

				{/* 创建菜单 */}
				<Menu.Root>
					<Menu.Trigger asChild>
						<IconButton size="sm" rounded="full">
							<Icon as={RiAddLine} />
						</IconButton>
					</Menu.Trigger>
					<Portal>
						<Menu.Positioner>
							<Menu.Content>
								<Menu.Item value="upload-files" onClick={handleUploadFiles}>
									<Icon as={RiUploadLine} />
									上传文件
								</Menu.Item>
								<Menu.Item
									value="create-folder"
									onClick={() => setCreateFolderDialog(true)}
								>
									<Icon as={RiFolderAddLine} />
									新建文件夹
								</Menu.Item>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>
			</HStack>

			{/* 隐藏的文件上传input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>
		</>
	);
}
