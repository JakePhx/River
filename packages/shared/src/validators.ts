import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(8),
});

export const createPostSchema = z.object({
  content: z.string().min(1).max(500),
});

export const followSchema = z.object({
  targetUserId: z.string().min(1),
});
