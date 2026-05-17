import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

// thunks
import {
  followUser,
  unfollowUser,
  blockUser,
} from "../relation/relation.slice";
import { deletePost, updatePost } from "../post/post.slice";

// utilities
import { api, getApiErrorMessage } from "../../shared/api/client";
import { UserMapper } from "./user.mapper";
import { PostMapper } from "../post/post.mapper";

// Types && DTOs
import type { ListPostResponse, Post, PostError } from "../post/post.types";
import type {
  User,
  ListUserResponse,
  UserResponse,
  UserError,
} from "./user.types";
import { UpdateProfileBodyDTO } from "@social/shared";

type PaginatedState<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  status: "idle" | "loading" | "failed";
  error: UserError | PostError | null;
};

type UsersState = {
  items: User[];
  entitiesById: Record<string, User | undefined>;
  entitiesByUsername: Record<string, User | undefined>;
  status: "idle" | "loading" | "failed";
  error: UserError | null;
  query: string;
  nextCursor: string | null;
  hasMore: boolean;
  // Per-user lists (keyed by userId)
  userPosts: Record<string, PaginatedState<Post> | undefined>;
  followers: Record<string, PaginatedState<User> | undefined>;
  following: Record<string, PaginatedState<User> | undefined>;
};

const PAGE_SIZE = 20;

const initialPaginatedState = <T>(): PaginatedState<T> => ({
  items: [],
  nextCursor: null,
  hasMore: true,
  status: "idle",
  error: null,
});

const initialState: UsersState = {
  items: [],
  entitiesById: {},
  entitiesByUsername: {},
  status: "idle",
  error: null,
  query: "",
  nextCursor: null,
  hasMore: true,
  userPosts: {},
  followers: {},
  following: {},
};

export const searchUsers = createAsyncThunk<
  { data: { items: User[]; nextCursor: string | null }; isReset: boolean },
  { query: string; cursor?: string | null; reset?: boolean }
>("users/search", async ({ query, cursor, reset }, { rejectWithValue }) => {
  try {
    const res = await api.get<ListUserResponse>("/users/search", {
      params: { query, cursor, take: PAGE_SIZE },
    });
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return {
      data: {
        items: res.data.items.map((item) => UserMapper.toUser(item)),
        nextCursor: res.data.nextCursor,
      },
      isReset: !!reset,
    };
  } catch (e) {
    return rejectWithValue({
      code: "FRONTEND_ERROR",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchUserPosts = createAsyncThunk<
  {
    userId: string;
    data: { items: Post[]; nextCursor: string | null };
    isReset: boolean;
  },
  { userId: string; cursor?: string | null; reset?: boolean }
>(
  "users/fetchPosts",
  async ({ userId, cursor, reset }, { rejectWithValue }) => {
    try {
      const res = await api.get<ListPostResponse>(`/users/${userId}/posts`, {
        params: { cursor, take: PAGE_SIZE },
      });
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return {
        userId,
        data: {
          items: res.data.items.map((item) => PostMapper.toPost(item)),
          nextCursor: res.data.nextCursor,
        },
        isReset: !!reset,
      };
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const fetchFollowers = createAsyncThunk<
  {
    userId: string;
    data: { items: User[]; nextCursor: string | null };
    isReset: boolean;
  },
  { userId: string; cursor?: string | null; reset?: boolean }
>(
  "users/fetchFollowers",
  async ({ userId, cursor, reset }, { rejectWithValue }) => {
    try {
      const res = await api.get<ListUserResponse>(
        `/users/${userId}/followers`,
        {
          params: { cursor, take: PAGE_SIZE },
        }
      );
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return {
        userId,
        data: {
          items: res.data.items.map((item) => UserMapper.toUser(item)),
          nextCursor: res.data.nextCursor,
        },
        isReset: !!reset,
      };
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const fetchFollowing = createAsyncThunk<
  {
    userId: string;
    data: { items: User[]; nextCursor: string | null };
    isReset: boolean;
  },
  { userId: string; cursor?: string | null; reset?: boolean }
>(
  "users/fetchFollowing",
  async ({ userId, cursor, reset }, { rejectWithValue }) => {
    try {
      const res = await api.get<ListUserResponse>(
        `/users/${userId}/following`,
        {
          params: { cursor, take: PAGE_SIZE },
        }
      );
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return {
        userId,
        data: {
          items: res.data.items.map((item) => UserMapper.toUser(item)),
          nextCursor: res.data.nextCursor,
        },
        isReset: !!reset,
      };
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const fetchUserById = createAsyncThunk<User, { userId: string }>(
  "users/fetchById",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const res = await api.get<UserResponse>(`/users/${userId}`);
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return UserMapper.toUser(res.data);
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const fetchUserByUsername = createAsyncThunk<User, { username: string }>(
  "users/fetchByUsername",
  async ({ username }, { rejectWithValue }) => {
    try {
      const res = await api.get<UserResponse>(`/users/by-username/${username}`);
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return UserMapper.toUser(res.data);
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const updateMyProfile = createAsyncThunk<User, UpdateProfileBodyDTO>(
  "users/updateMyProfile",
  async (dto, { rejectWithValue }) => {
    try {
      const res = await api.patch<UserResponse>("/users/me/profile", dto);
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return UserMapper.toUser(res.data);
    } catch (e) {
      return rejectWithValue({
        code: "FRONTEND_ERROR",
        message: getApiErrorMessage(e),
      });
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetSearch(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.query = "";
      state.nextCursor = null;
      state.hasMore = true;
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearEntities(state) {
      state.entitiesById = {};
      state.entitiesByUsername = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        const { data, isReset } = action.payload;
        if (isReset) {
          state.items = data.items;
        } else {
          const existingIds = new Set(state.items.map((u) => u.id));
          const newUsers = data.items.filter((u) => !existingIds.has(u.id));
          state.items = [...state.items, ...newUsers];
        }

        // Cache individual users
        data.items.forEach((user) => {
          state.entitiesById[user.id] = user;
          state.entitiesByUsername[user.username] = user;
        });

        state.status = "idle";
        state.nextCursor = data.nextCursor;
        state.hasMore = data.nextCursor !== null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "SEARCH_USERS_FAILED",
          message: "Failed to search users",
        };
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "idle";
        state.entitiesById[action.payload.id] = action.payload;
        state.entitiesByUsername[action.payload.username] = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "FETCH_USER_FAILED",
          message: "Failed to fetch user",
        };
      })
      .addCase(fetchUserByUsername.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.status = "idle";
        state.entitiesById[action.payload.id] = action.payload;
        state.entitiesByUsername[action.payload.username] = action.payload;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "FETCH_USER_FAILED",
          message: "Failed to fetch user",
        };
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.entitiesById[action.payload.id] = action.payload;
        state.entitiesByUsername[action.payload.username] = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "UPDATE_PROFILE_FAILED",
          message: "Failed to update profile",
        };
      })
      // User Posts
      .addCase(fetchUserPosts.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.userPosts[userId])
          state.userPosts[userId] = initialPaginatedState();
        state.userPosts[userId]!.status = "loading";
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { userId, data, isReset } = action.payload;
        if (!state.userPosts[userId])
          state.userPosts[userId] = initialPaginatedState();
        const pState = state.userPosts[userId]!;
        pState.status = "idle";
        pState.nextCursor = data.nextCursor;
        pState.hasMore = !!data.nextCursor;
        if (isReset) {
          pState.items = data.items;
        } else {
          pState.items = [...pState.items, ...data.items];
        }
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (state.userPosts[userId]) {
          state.userPosts[userId]!.status = "failed";
          state.userPosts[userId]!.error = (action.payload as PostError) ?? {
            code: "FETCH_POSTS_FAILED",
            message: "Failed to fetch posts",
          };
        }
      })
      // Followers
      .addCase(fetchFollowers.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.followers[userId])
          state.followers[userId] = initialPaginatedState();
        state.followers[userId]!.status = "loading";
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        const { userId, data, isReset } = action.payload;
        if (!state.followers[userId])
          state.followers[userId] = initialPaginatedState();
        const fState = state.followers[userId]!;
        fState.status = "idle";
        fState.nextCursor = data.nextCursor;
        fState.hasMore = !!data.nextCursor;
        if (isReset) {
          fState.items = data.items;
        } else {
          fState.items = [...fState.items, ...data.items];
        }
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (state.followers[userId]) {
          state.followers[userId]!.status = "failed";
          state.followers[userId]!.error = (action.payload as
            | UserError
            | PostError) ?? {
            code: "FETCH_FOLLOWERS_FAILED",
            message: "Failed to fetch followers",
          };
        }
      })
      // Following
      .addCase(fetchFollowing.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.following[userId])
          state.following[userId] = initialPaginatedState();
        state.following[userId]!.status = "loading";
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        const { userId, data, isReset } = action.payload;
        if (!state.following[userId])
          state.following[userId] = initialPaginatedState();
        const fState = state.following[userId]!;
        fState.status = "idle";
        fState.nextCursor = data.nextCursor;
        fState.hasMore = !!data.nextCursor;
        if (isReset) {
          fState.items = data.items;
        } else {
          fState.items = [...fState.items, ...data.items];
        }
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (state.following[userId]) {
          state.following[userId]!.status = "failed";
          state.following[userId]!.error = (action.payload as UserError) ?? {
            code: "FETCH_FOLLOWING_FAILED",
            message: "Failed to fetch following",
          };
        }
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { targetUserId, result } = action.payload;

        if (result.status === "FOLLOWING") {
          const userById = state.entitiesById[targetUserId];
          if (userById) {
            userById.followersCount += 1;
          }

          for (const username in state.entitiesByUsername) {
            const u = state.entitiesByUsername[username];
            if (u && u.id === targetUserId) {
              u.followersCount =
                userById?.followersCount ?? u.followersCount + 1;
            }
          }
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { targetUserId } = action.payload;
        const userById = state.entitiesById[targetUserId];
        if (userById) {
          userById.followersCount = Math.max(0, userById.followersCount - 1);
        }

        for (const username in state.entitiesByUsername) {
          const u = state.entitiesByUsername[username];
          if (u && u.id === targetUserId) {
            u.followersCount =
              userById?.followersCount ?? Math.max(0, u.followersCount - 1);
          }
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload;
        for (const uid of Object.keys(state.userPosts)) {
          const up = state.userPosts[uid];
          if (!up) continue;
          const i = up.items.findIndex((p) => p.id === updated.id);
          if (i !== -1) up.items[i] = updated;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        for (const uid of Object.keys(state.userPosts)) {
          const up = state.userPosts[uid];
          if (!up) continue;
          up.items = up.items.filter((p) => p.id !== postId);
        }
      });
  },
});

//TODO: Make user to unfollow first when user block following user
//TODO: Make user to unblock first when user follow blocked user

export const { resetSearch, setQuery, clearEntities } = usersSlice.actions;
export default usersSlice.reducer;
