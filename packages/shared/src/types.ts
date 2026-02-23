// Legacy aliases - prefer importing from './models/index.js'
export type { AuthUserRes, AuthRes } from "./models/auth.js";
export type { FeedItemRes } from "./models/post.js";
export type Post = import("./models/post.js").FeedItemRes;
export type SimpleUser = { id: string; username: string };
