import {
	Dialog,
	Portal,
	Button,
	CloseButton,
	Stack,
	Field,
	Textarea,
	Text,
	Spacer,
	Icon,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { RiArrowRightSLine } from "react-icons/ri";
import { z } from "zod";

import { torrentClient } from "~/client/connect";
import { useDialogStore } from "~/stores/dialog";
import { toaster } from "~/components/ui/toaster";
import { useTorrentStore } from "~/stores/torrent";

const formSchema = z.object({
	magnet: z.string().min(1, "磁力链接不能为空"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OfflineDownloadDialog() {
	const {
		offlineDownloadDialog,
		setOfflineDownloadDialog,
		setDownloadFileDialog,
	} = useDialogStore();

	const { setTorrentInfo } = useTorrentStore();

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
			const response = await torrentClient.getTorrentInfo({
				magnetUri: data.magnet,
			});
			const info = response.info;
			if (!info) {
				throw new Error("磁力链接解析失败");
			}
			return info;
		},
		onSuccess: (data) => {
			toaster.success({
				title: "磁力链接解析成功",
			});
			setTorrentInfo(data);
			setDownloadFileDialog(true);
		},
		onError: (error) => {
			toaster.error({
				title: "磁力链接解析失败",
				description: error.message,
			});
		},
	});

	return (
		<Dialog.Root
			open={offlineDownloadDialog}
			onOpenChange={(details) => setOfflineDownloadDialog(details.open)}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<form onSubmit={onSubmit} style={{ width: "100%" }}>
							<Dialog.Header>
								<Dialog.Title>离线下载</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body display="flex" flexDirection="column" gap="4">
								<Stack gap="4" align="flex-start">
									<Field.Root invalid={!!errors.magnet}>
										<Field.Label>磁力链接</Field.Label>
										<Textarea {...register("magnet")} autoresize maxH={24} />
										<Field.ErrorText>{errors.magnet?.message}</Field.ErrorText>
									</Field.Root>
								</Stack>
								<Button variant="subtle" w="full">
									<Text>保存到</Text>
									<Spacer />
									<Text>根目录</Text>
									<Icon as={RiArrowRightSLine} />
								</Button>
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
