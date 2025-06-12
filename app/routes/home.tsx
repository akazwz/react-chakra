import { HStack, VStack } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

export default function Home() {
	return (
		<VStack flex={1} h="full">
			<HStack w="full" p={2}>
				<Heading>Home</Heading>
			</HStack>
		</VStack>
	);
}
