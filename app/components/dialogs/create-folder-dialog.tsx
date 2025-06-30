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
import { useQueryState } from "nuqs";

import { nodeClient } from "~/client/connect";
import { useDialogStore } from "~/stores/dialog";
import { toaster } from "~/components/ui/toaster";

const formSchema = z.object({
	name: z.string().min(1, "文件夹名称不能为空"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFolderDialog() {
	const [parentId] = useQueryState("parentId");
	const { createFolderDialog, setCreateFolderDialog } = useDialogStore();

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
			// 创建 文件夹 节点
			const response = await nodeClient.createNode({
				parentId: parentId || undefined,
				name: data.name,
				isFolder: true,
			});
			const node = response.node;
			if (!node) {
				throw new Error("创建失败");
			}
			return {
				node,
			};
		},
		onSuccess: (data) => {
			toaster.success({
				title: "创建成功",
			});
			setCreateFolderDialog(false);
		},
		onError: (error) => {
			toaster.error({
				title: "创建失败",
				description: error.message,
			});
			setCreateFolderDialog(false);
		},
	});

	return (
		<Dialog.Root
			open={createFolderDialog}
			onOpenChange={(details) => setCreateFolderDialog(details.open)}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<form onSubmit={onSubmit} style={{ width: "100%" }}>
							<Dialog.Header>
								<Dialog.Title>新建文件夹</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<Stack gap="4" align="flex-start">
									<Field.Root invalid={!!errors.name}>
										<Field.Label>文件夹名称</Field.Label>
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
