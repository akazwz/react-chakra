import { HStack, VStack } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

export default function Explore() {
	return (
		<VStack flex={1} h="full">
			<HStack w="full" p={2}>
				<Heading>Explore</Heading>
			</HStack>
		</VStack>
	);
}
