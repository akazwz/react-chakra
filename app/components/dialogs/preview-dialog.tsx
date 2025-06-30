import {
	Dialog,
	Portal,
	CloseButton,
	Image,
	Spinner,
	Text,
	Center,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
	MediaPlayer,
	MediaProvider,
	type VideoMimeType,
} from "@vidstack/react";
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { nodeClient } from "~/client/connect";

export default function PreviewDialog() {
	const [parentId] = useQueryState("parentId");
	const [previewNodeId, setPreviewNodeId] = useQueryState("previewNodeId");

	const { data: nodes, isLoading: isLoadingNodes } = useQuery({
		queryKey: ["nodes", parentId],
		queryFn: async () => {
			const response = await nodeClient.getNodeList({
				parentId: parentId || undefined,
			});
			return response.nodes || [];
		},
	});

	const currentNode = nodes?.find((node) => node.id === previewNodeId);
	const previewUrl = currentNode?.previewUrl;

	const PreviewComponent = () => {
		if (isLoadingNodes) {
			return (
				<Center>
					<Spinner />
				</Center>
			);
		}

		if (!currentNode) {
			return (
				<Center>
					<Text>Node not found</Text>
				</Center>
			);
		}
		if (currentNode.mimeType?.startsWith("image/")) {
			return (
				<Image
					maxW="100%"
					maxH="100%"
					src={previewUrl}
					alt="preview"
					objectFit="contain"
					display="block"
				/>
			);
		}
		if (currentNode.mimeType?.startsWith("video/")) {
			return (
				<MediaPlayer
					title={currentNode.name}
					src={{
						src: previewUrl || "",
						type: currentNode.mimeType as VideoMimeType,
					}}
					style={{ maxWidth: "100%", maxHeight: "100%" }}
				>
					<MediaProvider />
					<DefaultVideoLayout icons={defaultLayoutIcons} />
				</MediaPlayer>
			);
		}
		return null;
	};

	return (
		<Dialog.Root
			open={previewNodeId !== null}
			onOpenChange={() => setPreviewNodeId(null)}
			size="full"
			motionPreset="slide-in-bottom"
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content
						p={{
							base: 2,
							md: 12,
						}}
						overflow="hidden"
						h="dvh"
						w="full"
						display="flex"
						flexDirection="column"
					>
						<Dialog.Body
							flex="1"
							display="flex"
							justifyContent="center"
							alignItems="center"
							overflow="hidden"
							minH="0"
						>
							<PreviewComponent />
						</Dialog.Body>
						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
