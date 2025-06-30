import { HStack, VStack, Heading, Avatar, Text } from "@chakra-ui/react";
import { redirect } from "react-router";

import { authClient } from "~/client/connect";
import { useAuthStore } from "~/stores/auth";
import type { Route } from "./+types/settings";

export async function clientLoader() {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	if (!isAuthenticated) {
		throw redirect("/login");
	}
	const user = useAuthStore.getState().user;
	if (!user) {
		throw redirect("/login");
	}
	authClient.getProfile({}).then((data) => {
		if (data.user) {
			useAuthStore.getState().setUser(data.user);
		}
	});
	return {
		user,
	};
}

export default function Settings({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;
	return (
		<VStack flex={1} h="full">
			<HStack w="full" p={2}>
				<Heading>设置</Heading>
			</HStack>
			<VStack>
				<Avatar.Root size="2xl">
					<Avatar.Image src={user?.avatar} />
					<Avatar.Fallback>{user?.username?.slice(0, 2)}</Avatar.Fallback>
				</Avatar.Root>
				<Text>{user?.username}</Text>
			</VStack>
		</VStack>
	);
}
