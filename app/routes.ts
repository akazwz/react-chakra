import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/home.tsx"),
		route("files", "routes/files.tsx"),
		route("settings", "routes/settings.tsx"),
	]),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
] satisfies RouteConfig;
