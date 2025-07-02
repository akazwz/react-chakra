import {
	Dialog,
	Portal,
	Button,
	CloseButton,
	Checkbox,
	Text,
	Heading,
	VStack,
	Box,
	HStack,
	IconButton,
	Icon,
} from "@chakra-ui/react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	RiFolderLine,
	RiFolderOpenLine,
	RiFileLine,
	RiArrowRightSLine,
	RiArrowDownSLine,
} from "react-icons/ri";

import { useDialogStore } from "~/stores/dialog";
import { useTorrentStore } from "~/stores/torrent";

interface TreeNode {
	name: string;
	path: string;
	isFolder: boolean;
	children: TreeNode[];
	level: number;
	isExpanded: boolean;
}

// 将文件路径转换为树状结构
function buildFileTree(files: { path: string }[]): TreeNode[] {
	const root: TreeNode[] = [];
	const nodeMap = new Map<string, TreeNode>();

	for (const file of files) {
		const pathParts = file.path.split("/").filter(Boolean);
		let currentLevel = root;
		let currentPath = "";

		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			currentPath = currentPath ? `${currentPath}/${part}` : part;
			const isLast = i === pathParts.length - 1;

			let node = nodeMap.get(currentPath);
			if (!node) {
				node = {
					name: part,
					path: currentPath,
					isFolder: !isLast,
					children: [],
					level: i,
					isExpanded: false,
				};
				nodeMap.set(currentPath, node);
				currentLevel.push(node);
			}

			if (!isLast) {
				currentLevel = node.children;
			}
		}
	}

	return root;
}

// 将树状结构展平为可渲染的列表
function flattenTree(nodes: TreeNode[], result: TreeNode[] = []): TreeNode[] {
	for (const node of nodes) {
		result.push(node);
		if (node.isFolder && node.isExpanded) {
			flattenTree(node.children, result);
		}
	}
	return result;
}

export default function DownloadFileDialog() {
	const { downloadFileDialog, setDownloadFileDialog } = useDialogStore();
	const { torrentInfo, setTorrentInfo } = useTorrentStore();
	const [checkedPaths, setCheckedPaths] = useState<string[]>([]);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

	const files = torrentInfo?.files || [];

	// 初始化时展开根目录文件夹
	const [isInitialized, setIsInitialized] = useState(false);

	// 构建树状结构
	const fileTree = useMemo(() => {
		const tree = buildFileTree(files);

		// 应用展开状态
		const applyExpandedState = (nodes: TreeNode[]) => {
			for (const node of nodes) {
				if (node.isFolder) {
					node.isExpanded = expandedFolders.has(node.path);
					applyExpandedState(node.children);
				}
			}
		};
		applyExpandedState(tree);
		return tree;
	}, [files, expandedFolders]);

	// 初始化展开状态
	useEffect(() => {
		if (!isInitialized && files.length > 0) {
			const tree = buildFileTree(files);
			const rootFolders = tree
				.filter((node) => node.isFolder)
				.map((node) => node.path);
			if (rootFolders.length > 0) {
				setExpandedFolders(new Set(rootFolders));
				setIsInitialized(true);
			}
		}
	}, [files, isInitialized]);

	// 展平的树节点列表
	const flatNodes = useMemo(() => flattenTree(fileTree), [fileTree]);

	const allChecked = checkedPaths.length === files.length;
	const indeterminate = checkedPaths.length > 0 && !allChecked;

	const onClose = useCallback(() => {
		setDownloadFileDialog(false);
		setTorrentInfo(null);
		setCheckedPaths([]);
		setExpandedFolders(new Set());
		setIsInitialized(false);
	}, [setDownloadFileDialog, setTorrentInfo]);

	// 获取文件夹下所有文件路径
	const getFolderFiles = useCallback(
		(folderPath: string): string[] => {
			return files
				.filter((file) => file.path.startsWith(`${folderPath}/`))
				.map((f) => f.path);
		},
		[files],
	);

	// 处理展开/折叠
	const toggleExpanded = useCallback((path: string) => {
		setExpandedFolders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(path)) {
				newSet.delete(path);
			} else {
				newSet.add(path);
			}
			return newSet;
		});
	}, []);

	// 处理选择
	const onToggle = useCallback(
		(node: TreeNode, checked: boolean) => {
			setCheckedPaths((current) => {
				if (node.isFolder) {
					// 文件夹选择：选择/取消选择该文件夹下所有文件
					const folderFiles = getFolderFiles(node.path);
					if (checked) {
						const newPaths = new Set([...current, ...folderFiles]);
						return Array.from(newPaths);
					}
					return current.filter((p) => !folderFiles.includes(p));
				}

				// 文件选择
				if (checked) {
					return [...current, node.path];
				}
				return current.filter((p) => p !== node.path);
			});
		},
		[getFolderFiles],
	);

	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: flatNodes.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40,
		overscan: 5,
	});

	return (
		<Dialog.Root
			open={downloadFileDialog}
			onOpenChange={(details) => {
				if (!details.open) {
					onClose();
				}
			}}
			scrollBehavior="inside"
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content mx={2}>
						<Dialog.Header>
							<Dialog.Title>下载文件</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Heading size="md">{torrentInfo?.name}</Heading>
							<VStack gap="2" py={4} align="flex-start">
								<Checkbox.Root
									checked={indeterminate ? "indeterminate" : allChecked}
									onCheckedChange={(e) => {
										setCheckedPaths(() => {
											if (e.checked) {
												return files.map((file) => file.path);
											}
											return [];
										});
									}}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control>
										<Checkbox.Indicator />
									</Checkbox.Control>
									<Checkbox.Label>全部</Checkbox.Label>
								</Checkbox.Root>
								<Box
									ref={parentRef}
									width="100%"
									height="300px"
									overflow="auto"
								>
									<div
										style={{
											height: `${virtualizer.getTotalSize()}px`,
											width: "100%",
											position: "relative",
										}}
									>
										{virtualizer.getVirtualItems().map((virtualItem) => {
											const node = flatNodes[virtualItem.index];
											if (!node) return null;

											const folderFiles = node.isFolder
												? getFolderFiles(node.path)
												: [];
											const isChecked = node.isFolder
												? folderFiles.length > 0 &&
													folderFiles.every((fp) => checkedPaths.includes(fp))
												: checkedPaths.includes(node.path);
											const isIndeterminate =
												node.isFolder &&
												folderFiles.length > 0 &&
												folderFiles.some((fp) => checkedPaths.includes(fp)) &&
												!folderFiles.every((fp) => checkedPaths.includes(fp));

											return (
												<div
													key={virtualItem.key}
													style={{
														position: "absolute",
														top: 0,
														left: 0,
														width: "100%",
														height: `${virtualItem.size}px`,
														transform: `translateY(${virtualItem.start}px)`,
														paddingLeft: `${node.level * 20 + 8}px`,
													}}
												>
													<HStack align="center">
														{node.isFolder && (
															<IconButton
																size="2xs"
																variant="ghost"
																onClick={() => toggleExpanded(node.path)}
															>
																<Icon
																	as={
																		node.isExpanded
																			? RiArrowDownSLine
																			: RiArrowRightSLine
																	}
																	size="sm"
																/>
															</IconButton>
														)}
														{!node.isFolder && <Box w="6" />}
														<Checkbox.Root
															size="sm"
															checked={
																isIndeterminate ? "indeterminate" : isChecked
															}
															onCheckedChange={(e) =>
																onToggle(node, !!e.checked)
															}
														>
															<Checkbox.HiddenInput />
															<Checkbox.Control>
																<Checkbox.Indicator />
															</Checkbox.Control>
														</Checkbox.Root>
														{node.isFolder ? (
															node.isExpanded ? (
																<Icon as={RiFolderOpenLine} size="md" />
															) : (
																<Icon as={RiFolderLine} size="md" />
															)
														) : (
															<Icon as={RiFileLine} size="md" />
														)}
														<Text fontSize="xs">{node.name}</Text>
													</HStack>
												</div>
											);
										})}
									</div>
								</Box>
							</VStack>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">取消</Button>
							</Dialog.ActionTrigger>
							<Button
								type="submit"
								onClick={() => {
									console.log("选中的文件路径:", checkedPaths);
								}}
							>
								确定
							</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
}
