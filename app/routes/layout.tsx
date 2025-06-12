import { Button, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import {
	RiChat3Line,
	RiChat3Fill,
	RiContactsBook3Fill,
	RiContactsBook3Line,
	RiCompass3Fill,
	RiCompass3Line,
	RiSettings3Fill,
	RiSettings3Line,
} from "react-icons/ri";
import { Outlet, useLocation, useNavigate } from "react-router";

interface NavItem {
	icon: React.ElementType;
	activeIcon: React.ElementType;
	label: string;
	href: string;
}

const navItems: NavItem[] = [
	{
		icon: RiChat3Line,
		activeIcon: RiChat3Fill,
		label: "Chat",
		href: "/",
	},
	{
		icon: RiContactsBook3Line,
		activeIcon: RiContactsBook3Fill,
		label: "Contacts",
		href: "/contacts",
	},
	{
		icon: RiCompass3Line,
		activeIcon: RiCompass3Fill,
		label: "Explore",
		href: "/explore",
	},
	{
		icon: RiSettings3Line,
		activeIcon: RiSettings3Fill,
		label: "Settings",
		href: "/settings",
	},
];

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
				<Heading>IM</Heading>
				<VStack w="full">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Button
								key={item.href}
								w="full"
								justifyContent="start"
								variant="ghost"
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
								<Icon as={item.activeIcon} size="xl" />
							) : (
								<Icon as={item.icon} size="xl" />
							)}
						</Button>
					);
				})}
			</HStack>
		</HStack>
	);
}
