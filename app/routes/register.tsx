import {
	Button,
	Input,
	Stack,
	Field,
	VStack,
	HStack,
	Heading,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { authClient } from "~/client/connect";
import { toaster } from "~/components/ui/toaster";
import { useAuthStore } from "~/stores/auth";

const formSchema = z.object({
	username: z.string().min(1, "用户名不能为空"),
	password: z.string().min(6, "密码不能少于6位"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

	const navigate = useNavigate();

	const onSubmit = handleSubmit((data) => console.log(data));

	const mutation = useMutation({
		mutationFn: async (data: FormValues) => {
			const response = await authClient.register(data);
			const user = response.user;
			if (!user) {
				throw new Error("用户不存在");
			}
			return {
				token: response.token,
				user,
			};
		},
		onSuccess: (data) => {
			toaster.success({
				title: "注册成功",
				description: "欢迎加入",
			});
			useAuthStore.getState().setToken(data.token);
			useAuthStore.getState().setUser(data.user);
			navigate("/");
		},
		onError: (error) => {
			toaster.error({
				title: "注册失败",
				description: error.message,
			});
		},
	});

	return (
		<VStack
			w="full"
			maxW="md"
			mx="auto"
			h="dvh"
			gap={8}
			alignItems="center"
			justifyContent="center"
		>
			<Heading alignSelf="flex-start">注册</Heading>
			<form onSubmit={onSubmit} style={{ width: "100%" }}>
				<Stack gap="4" align="flex-start">
					<Field.Root invalid={!!errors.username}>
						<Field.Label>用户名</Field.Label>
						<Input {...register("username")} />
						<Field.ErrorText>{errors.username?.message}</Field.ErrorText>
					</Field.Root>

					<Field.Root invalid={!!errors.password}>
						<Field.Label>密码</Field.Label>
						<Input {...register("password")} />
						<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
					</Field.Root>

					<Button type="submit" w="full">
						注册
					</Button>
				</Stack>
			</form>
			<HStack w="full" gap={4}>
				<Button
					flex={1}
					variant="ghost"
					size="sm"
					onClick={() => navigate("/login")}
					loading={mutation.isPending}
				>
					已有账号？登录
				</Button>
			</HStack>
		</VStack>
	);
}
