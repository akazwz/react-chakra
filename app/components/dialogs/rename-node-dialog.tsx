import {
	Dialog,
	Portal,
	Button,
	CloseButton,
	Stack,
	Field,
	Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { nodeClient } from "~/client/connect";
import { useDialogStore } from "~/stores/dialog";
import { toaster } from "~/components/ui/toaster";
import { useSelectionStore } from "~/stores/selection";

const formSchema = z.object({
	name: z.string().min(1, "名称不能为空"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RenameNodeDialog() {
	const { renameNodeDialog, setRenameNodeDialog } = useDialogStore();
	const { selectedNodes, setSelectionMode } = useSelectionStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = handleSubmit((data) => mutation.mutate(data));

	const mutation = useMutation({
		mutationFn: async (data: FormValues) => {
			if (selectedNodes.size !== 1) {
				throw new Error("只能选择一个节点");
			}
			const nodeId = Array.from(selectedNodes)[0];
			const response = await nodeClient.renameNode({
				nodeId,
				name: data.name,
			});
			return {
				node: response.node,
			};
		},
		onSuccess: (data) => {
			toaster.success({
				title: "重命名成功",
			});
			handleClose();
		},
		onError: (error) => {
			toaster.error({
				title: "重命名失败",
				description: error.message,
			});
		},
	});

	const handleClose = () => {
		setRenameNodeDialog(false);
		setSelectionMode(false);
	};

	return (
		<Dialog.Root open={renameNodeDialog} onOpenChange={handleClose}>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<form onSubmit={onSubmit} style={{ width: "100%" }}>
							<Dialog.Header>
								<Dialog.Title>重命名</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<Stack gap="4" align="flex-start">
									<Field.Root invalid={!!errors.name}>
										<Field.Label>名称</Field.Label>
										<Input {...register("name")} />
										<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
									</Field.Root>
								</Stack>
							</Dialog.Body>
							<Dialog.Footer>
								<Dialog.ActionTrigger asChild>
									<Button variant="outline">取消</Button>
								</Dialog.ActionTrigger>
								<Button type="submit" loading={mutation.isPending}>
									确定
								</Button>
							</Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" />
							</Dialog.CloseTrigger>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
