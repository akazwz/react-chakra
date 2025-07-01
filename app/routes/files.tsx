import {
	HStack,
	VStack,
	Heading,
	Spinner,
	IconButton,
	Icon,
	Button,
	Box,
	Image,
	Text,
	Center,
	Float,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
	RiDeleteBinLine,
	RiCloseLine,
	RiCheckboxMultipleLine,
	RiCheckboxLine,
	RiCheckLine,
	RiCheckboxCircleFill,
	RiEditBoxLine,
	RiPlayCircleLine,
	RiPlayCircleFill,
} from "react-icons/ri";

import { nodeClient } from "~/client/connect";
import { NodePath } from "~/components/nodes/node-path";
import { toaster } from "~/components/ui/toaster";
import type { Node } from "~/gen/node/v1/node_pb";
import { useDialogStore } from "~/stores/dialog";
import { useSelectionStore } from "~/stores/selection";
import CreateFolderDialog from "~/components/dialogs/create-folder-dialog";
import DeleteConfirmDialog from "~/components/dialogs/delete-confirm-dialog";
import RenameNodeDialog from "~/components/dialogs/rename-node-dialog";
import UploadQueueDialog from "~/components/dialogs/upload-queue-dialog";
import CreateActionsMenu from "~/components/files/create-actions-menu";
import PreviewDialog from "~/components/dialogs/preview-dialog";

export default function Files() {
	const [parentId] = useQueryState("parentId");
	const { setRenameNodeDialog } = useDialogStore();

	const {
		isSelectionMode,
		setSelectionMode,
		selectedNodes,
		getSelectedNodesData,
	} = useSelectionStore();
	const { setDeleteConfirmDialog } = useDialogStore();

	const { data: nodes, isLoading: isLoadingNodes } = useQuery({
		queryKey: ["nodes", parentId],
		queryFn: async () => {
			const response = await nodeClient.getNodeList({
				parentId: parentId || undefined,
			});
			return response.nodes || [];
		},
	});

	const handleDeleteSelected = () => {
		if (selectedNodes.size === 0) return;
		setDeleteConfirmDialog(true);
	};

	const handleRenameSelected = () => {
		if (selectedNodes.size !== 1) return;
		setRenameNodeDialog(true);
	};

	const handleCancelSelection = () => {
		setSelectionMode(false);
	};

	return (
		<VStack flex={1} h="full" gap={0}>
			{/* 标题栏 */}
			{!isSelectionMode ? (
				<HStack
					w="full"
					p={2}
					justifyContent="space-between"
					borderBottomWidth={1}
				>
					<Heading>文件</Heading>
					<HStack>
						<IconButton
							size="sm"
							variant="surface"
							rounded="full"
							onClick={() => setSelectionMode(true)}
						>
							<Icon as={RiCheckboxMultipleLine} />
						</IconButton>
						<CreateActionsMenu parentId={parentId || undefined} />
					</HStack>
				</HStack>
			) : (
				/* 选择模式工具栏 */
				<HStack
					w="full"
					p={2}
					justifyContent="space-between"
					borderBottomWidth={1}
				>
					<HStack>
						<IconButton
							size="sm"
							variant="ghost"
							onClick={handleCancelSelection}
						>
							<Icon as={RiCloseLine} />
						</IconButton>
						<Text fontSize="sm" fontWeight="medium">
							已选中 {selectedNodes.size} 项
						</Text>
					</HStack>
					<HStack>
						<IconButton
							size="sm"
							variant="ghost"
							disabled={selectedNodes.size !== 1}
							onClick={handleRenameSelected}
						>
							<Icon as={RiEditBoxLine} />
						</IconButton>
						<IconButton
							size="sm"
							variant="ghost"
							onClick={handleDeleteSelected}
							disabled={selectedNodes.size === 0}
							colorPalette="red"
						>
							<Icon as={RiDeleteBinLine} />
						</IconButton>
					</HStack>
				</HStack>
			)}

			<NodePath />
			<Box w="full" flex={1} overflow="auto" p={2} minH={0}>
				{isLoadingNodes && (
					<VStack w="full" pt={24}>
						<Spinner />
					</VStack>
				)}
				{nodes && nodes.length > 0 && (
					<Box
						display="grid"
						gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
						gap={4}
						w="full"
					>
						{nodes.map((node) => (
							<NodeCard key={node.id} node={node} />
						))}
					</Box>
				)}
			</Box>

			{/* 对话框 */}
			<CreateFolderDialog />
			<DeleteConfirmDialog />
			<RenameNodeDialog />
			<UploadQueueDialog />
			<PreviewDialog />
		</VStack>
	);
}

function NodeCard({ node }: { node: Node }) {
	const [_, setParentId] = useQueryState("parentId");
	const [__, setPreviewNodeId] = useQueryState("previewNodeId");
	const { isSelectionMode, selectedNodes, toggleNodeSelection } =
		useSelectionStore();

	const isSelected = selectedNodes.has(node.id);

	function handleClick() {
		if (isSelectionMode) {
			// 在选择模式下，点击切换选中状态
			toggleNodeSelection(node.id);
			return;
		}

		// 正常模式下的点击行为
		if (node.isFolder) {
			setParentId(node.id);
			return;
		}
		if (
			(node.mimeType?.startsWith("image/") ||
				node.mimeType?.startsWith("video/")) &&
			node.previewUrl !== ""
		) {
			setPreviewNodeId(node.id);
			return;
		}
		toaster.info({
			title: "暂不支持预览",
		});
	}

	return (
		<Button
			variant="ghost"
			flexDir="column"
			boxSize="full"
			borderRadius="md"
			cursor="pointer"
			justifyContent="center"
			alignItems="center"
			onClick={handleClick}
			position="relative"
		>
			{/* 选中标识 */}
			{isSelected && (
				<Center
					position="absolute"
					top={1}
					right={1}
					borderWidth={1}
					p={0.5}
					rounded="md"
				>
					<Icon as={RiCheckboxCircleFill} color="fg.info" />
				</Center>
			)}

			<Center p={2} boxSize="24" position="relative">
				<Float
					placement="middle-center"
					hidden={!node.mimeType?.startsWith("video/")}
				>
					<Icon as={RiPlayCircleFill} color="fg.inverted" shadow="sm" />
				</Float>
				<Image
					src={node.thumbnailUrl || getDefaultThumbnailUrl(node)}
					alt="预览图"
					maxW="full"
					maxH="full"
					mx="auto"
					my="auto"
					rounded="sm"
					objectFit="contain"
				/>
			</Center>
			<VStack gap={1} alignItems="center" py={1} w="full">
				<Text fontSize="sm" truncate w="full" textAlign="center">
					{node.name}
				</Text>
				<Text fontSize="xs" fontWeight="normal">
					{node.updatedAt}
				</Text>
			</VStack>
		</Button>
	);
}

function getDefaultThumbnailUrl(node: Node) {
	if (node.isFolder) {
		return "/folder.png";
	}
	switch (true) {
		case node.mimeType?.startsWith("text/"):
			return "/doc.png";
		case node.mimeType?.startsWith("application/pdf"):
			return "/doc.png";
		case node.mimeType?.includes("doc"):
			return "/doc.png";
		case node.mimeType?.startsWith("image/"):
			return "/image.png";
		case node.mimeType?.startsWith("video/"):
			return "/video.png";
		case node.mimeType?.startsWith("audio/"):
			return "/audio.png";
		default:
			return "/other.png";
	}
}
