import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("sign-in", "routes/auth/sign-in.tsx"),
  route("sign-up", "routes/auth/sign-up.tsx"),
  route("/", "routes/app/layout.tsx", [
    index("routes/app/home.tsx"),
    route("feed", "routes/app/feed.tsx"),
    route("posts/:postId", "routes/app/post.tsx"),
    route("network", "routes/app/network.tsx"),
    route("notification", "routes/app/notification.tsx"),
    route("messages", "routes/app/messages.tsx"),
    route("onboarding", "routes/app/onboarding.tsx"),
    route("u/:username", "routes/app/profile.tsx"),
    route("settings", "routes/app/settings.tsx"),
    route("settings/blocked-users", "routes/app/settings/blocked-users.tsx"),
  ]),
] satisfies RouteConfig;
