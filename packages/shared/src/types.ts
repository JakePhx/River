// Legacy aliases - prefer importing from './models'
export type { AuthUserRes, AuthRes } from "./models/auth";
export type { FeedItemRes } from "./models/post";
export type Post = import("./models/post.js").FeedItemRes;
export type SimpleUser = { id: string; username: string };
