import {
	HStack,
	Breadcrumb,
	IconButton,
	Icon,
	Button,
	Spinner,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { RiCloudFill } from "react-icons/ri";
import { Fragment } from "react";

import { nodeClient } from "~/client/connect";

export function NodePath() {
	const [parentId, setParentId] = useQueryState("parentId");

	const { data: pathSegments, isLoading: isLoadingPathSegments } = useQuery({
		queryKey: ["path", parentId],
		queryFn: async () => {
			const response = await nodeClient.getNodePath({
				nodeId: parentId || undefined,
			});
			return response.pathSegments || [];
		},
		enabled: !!parentId,
	});

	return (
		<HStack w="full" borderBottomWidth={0.5} p={0.5}>
			<Breadcrumb.Root>
				<Breadcrumb.List gap={0}>
					<Breadcrumb.Item asChild>
						<IconButton variant="ghost" onClick={() => setParentId(null)}>
							<Icon as={RiCloudFill} />
						</IconButton>
					</Breadcrumb.Item>
					{isLoadingPathSegments && <Spinner size="sm" />}
					{pathSegments?.map((path) => (
						<Fragment key={path.id}>
							<Breadcrumb.Separator />
							<Breadcrumb.Item key={path.id} asChild>
								<Button
									variant="ghost"
									size="xs"
									onClick={() => setParentId(path.id)}
								>
									{path.name}
								</Button>
							</Breadcrumb.Item>
						</Fragment>
					))}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</HStack>
	);
}
