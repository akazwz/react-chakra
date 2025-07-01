import {
	Menu,
	IconButton,
	Portal,
	Icon,
	HStack,
	Badge,
} from "@chakra-ui/react";
import { useRef } from "react";
import { RiAddLine, RiFolderAddLine, RiUploadLine } from "react-icons/ri";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useDialogStore } from "~/stores/dialog";
import { toaster } from "~/components/ui/toaster";
import { calculateFileHash } from "~/utils/upload";
import { nodeClient, uploadClient } from "~/client/connect";
import type { Node } from "~/gen/node/v1/node_pb";

interface CreateActionsMenuProps {
	parentId?: string;
}

export default function CreateActionsMenu({
	parentId,
}: CreateActionsMenuProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setCreateFolderDialog } = useDialogStore();

	const queryClient = useQueryClient();

	function addNodeToCache(node: Node) {
		queryClient.setQueryData(["nodes", parentId], (old: Node[]) => [
			node,
			...old,
		]);
	}

	function triggerFileInput() {
		fileInputRef.current?.click();
	}

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		const file = files?.[0];
		if (!file) return;
		const hash = await calculateFileHash(file);
		const existsResponse = await uploadClient.checkFileHash({ fileHash: hash });
		if (existsResponse.exists) {
			const response = await nodeClient.createNode({
				parentId,
				name: file.name,
				hash,
			});
			if (response.node) {
				addNodeToCache(response.node);
				toaster.success({
					title: "秒传成功",
				});
			} else {
				toaster.error({
					title: "创建文件失败",
				});
			}
			return;
		}
		const response = await uploadClient.getUploadUrl({
			fileHash: hash,
		});
		const url = response.uploadUrl;
		if (!url) {
			toaster.error({
				title: "获取上传url失败",
			});
			return;
		}
		const storageKey = response.storageKey;
		if (!storageKey) {
			toaster.error({
				title: "获取存储key失败",
			});
			return;
		}
		await axios.put(url, file, {
			onUploadProgress(progressEvent) {
				console.log(progressEvent);
			},
		});
		const completeUploadResponse = await uploadClient.completeUpload({
			fileHash: hash,
			storageKey,
		});
		if (!completeUploadResponse.success) {
			toaster.error({
				title: "上传失败",
			});
			return;
		}
		const createNodeResponse = await nodeClient.createNode({
			parentId,
			name: file.name,
			hash,
		});
		if (!createNodeResponse.node) {
			toaster.error({
				title: "创建文件失败",
			});
			return;
		}
		addNodeToCache(createNodeResponse.node);
		toaster.success({
			title: "上传成功",
		});
	}

	return (
		<>
			<HStack gap={2}>
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
								<Menu.Item value="upload-files" onClick={triggerFileInput}>
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
