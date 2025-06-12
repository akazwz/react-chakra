import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		index("routes/home.tsx"),
		route("contacts", "routes/contacts.tsx"),
		route("explore", "routes/explore.tsx"),
		route("settings", "routes/settings.tsx"),
	]),
] satisfies RouteConfig;
