import { HStack, VStack, Heading } from "@chakra-ui/react";

export default function Home() {
	return (
		<VStack flex={1} h="full">
			<HStack w="full" p={2}>
				<Heading>首页</Heading>
			</HStack>
		</VStack>
	);
}
