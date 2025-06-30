import { Button, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import {
	RiSettings3Fill,
	RiSettings3Line,
	RiHome3Line,
	RiHome3Fill,
	RiFolderLine,
	RiFolderFill,
	RiCloudLine,
} from "react-icons/ri";
import { Outlet, redirect, useLocation, useNavigate } from "react-router";
import CreateFolderDialog from "~/components/dialogs/create-folder-dialog";
import { useAuthStore } from "~/stores/auth";

interface NavItem {
	icon: React.ElementType;
	activeIcon: React.ElementType;
	label: string;
	href: string;
}

const navItems: NavItem[] = [
	{
		icon: RiHome3Line,
		activeIcon: RiHome3Fill,
		label: "首页",
		href: "/",
	},
	{
		icon: RiFolderLine,
		activeIcon: RiFolderFill,
		label: "文件",
		href: "/files",
	},
	{
		icon: RiSettings3Line,
		activeIcon: RiSettings3Fill,
		label: "设置",
		href: "/settings",
	},
];

export async function clientLoader() {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	if (!isAuthenticated) {
		throw redirect("/login");
	}
	return null;
}

export default function Layout() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	return (
		<HStack h="dvh" gap={0}>
			<VStack
				w={64}
				h="full"
				p={2}
				hideBelow="md"
				borderRightWidth={1}
				borderRightColor="bg.muted"
			>
				<VStack w="full" gap={0} alignItems="center" p={2}>
					<Icon as={RiCloudLine} size="2xl" />
				</VStack>
				<VStack w="full">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Button
								key={item.href}
								w="full"
								justifyContent="start"
								variant={isActive ? "subtle" : "ghost"}
								fontWeight={isActive ? "bold" : ""}
								onClick={() => navigate(item.href)}
							>
								{isActive ? (
									<Icon as={item.activeIcon} />
								) : (
									<Icon as={item.icon} />
								)}
								<Text>{item.label}</Text>
							</Button>
						);
					})}
				</VStack>
			</VStack>
			<Outlet />
			<HStack
				hideFrom="md"
				w="full"
				h={14}
				gap={0}
				justifyContent="space-between"
				position="fixed"
				bottom={0}
				right={0}
				p={1}
				borderTopWidth={1}
				borderTopColor="bg.muted"
			>
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Button
							key={item.href}
							flex={1}
							gap={0}
							h="fit"
							py={0.5}
							flexDirection="column"
							variant="plain"
							onClick={() => navigate(item.href)}
						>
							{isActive ? (
								<Icon as={item.activeIcon} />
							) : (
								<Icon as={item.icon} />
							)}
							<Text fontSize="xs">{item.label}</Text>
						</Button>
					);
				})}
			</HStack>
		</HStack>
	);
}
