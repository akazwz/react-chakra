import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "~/gen/auth/v1/auth_pb";

interface AuthState {
	user: User | null;
	token: string | null;
	setToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			setToken: (token) => set({ token }),
			user: null,
			setUser: (user) => set({ user }),
			isAuthenticated: () => !!get().token,
		}),
		{
			name: "auth-store",
		},
	),
);
