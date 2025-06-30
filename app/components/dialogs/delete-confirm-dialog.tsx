import {
	Dialog,
	Portal,
	Button,
	CloseButton,
	Stack,
	Text,
	HStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useDialogStore } from "~/stores/dialog";
import { useSelectionStore } from "~/stores/selection";
import { toaster } from "~/components/ui/toaster";
import { nodeClient } from "~/client/connect";

export default function DeleteConfirmDialog() {
	const queryClient = useQueryClient();
	const { deleteConfirmDialog, setDeleteConfirmDialog } = useDialogStore();
	const { selectedNodes, setSelectionMode } = useSelectionStore();

	const mutation = useMutation({
		mutationFn: async () => {
			const response = await nodeClient.batchDeleteNodes({
				nodeIds: Array.from(selectedNodes),
			});
			if (!response.success) {
				throw new Error("删除失败");
			}
			return { success: true };
		},
		onSuccess: () => {
			toaster.success({
				title: "删除成功",
				description: `已删除 ${selectedNodes.size} 个项目`,
			});
			// 刷新节点列表
			queryClient.invalidateQueries({ queryKey: ["nodes"] });
			handleClose();
		},
		onError: (error) => {
			toaster.error({
				title: "删除失败",
				description: error.message || "未知错误",
			});
		},
	});

	const handleClose = () => {
		setDeleteConfirmDialog(false);
		setSelectionMode(false); // 退出选择模式
	};

	const handleConfirm = () => {
		mutation.mutate();
	};

	const getDeleteMessage = () => {
		if (selectedNodes.size === 0) return "";

		if (selectedNodes.size === 1) {
			return "确定要删除选中的项目吗？";
		}

		return `确定要删除选中的 ${selectedNodes.size} 个项目吗？`;
	};

	return (
		<Portal>
			<Dialog.Root open={deleteConfirmDialog} onOpenChange={handleClose}>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<Stack gap={4} p={4}>
							<Dialog.Header>
								<Dialog.Title>确认删除</Dialog.Title>
								<Dialog.CloseTrigger asChild>
									<CloseButton />
								</Dialog.CloseTrigger>
							</Dialog.Header>

							<Dialog.Body>
								<Text>{getDeleteMessage()}</Text>
								<Text fontSize="sm" mt={2}>
									此操作无法撤销
								</Text>
							</Dialog.Body>

							<Dialog.Footer>
								<HStack gap={2} w="full">
									<Button
										variant="outline"
										flex={1}
										onClick={handleClose}
										disabled={mutation.isPending}
									>
										取消
									</Button>
									<Button
										flex={1}
										onClick={handleConfirm}
										loading={mutation.isPending}
										colorPalette="red"
									>
										删除
									</Button>
								</HStack>
							</Dialog.Footer>
						</Stack>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Portal>
	);
}
