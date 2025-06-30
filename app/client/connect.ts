import {
	Code,
	ConnectError,
	createClient,
	type Interceptor,
} from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { redirect } from "react-router";

import { AuthService } from "~/gen/auth/v1/auth_pb";
import { NodeService } from "~/gen/node/v1/node_pb";
import { UploadService } from "~/gen/upload/v1/upload_pb";
import { useAuthStore } from "~/stores/auth";

// 添加认证头的拦截器
const authInterceptor: Interceptor = (next) => async (req) => {
	const token = useAuthStore.getState().token;
	if (token) {
		req.header.append("Authorization", `Bearer ${token}`);
	}
	try {
		const response = await next(req);
		return response;
	} catch (error) {
		if (error instanceof ConnectError) {
			if (error.code === Code.Unauthenticated) {
				useAuthStore.getState().setToken(null);
				useAuthStore.getState().setUser(null);
				throw redirect("/login");
			}
		}
	}
	return await next(req);
};

export const transport = createConnectTransport({
	baseUrl: import.meta.env.VITE_API_URL,
	interceptors: [authInterceptor],
});

export const authClient = createClient(AuthService, transport);
export const nodeClient = createClient(NodeService, transport);
export const uploadClient = createClient(UploadService, transport);
