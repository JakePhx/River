import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiErrorMessage } from "../../shared/api/client";
import { UserMapper } from "../user/user.mapper";
import type {
  User,
  UpdatePrivacyDto,
  UserResponse,
  UserError,
} from "../user/user.types";
import { updateMyProfile } from "../user/user.slice";
import { login, register, logout } from "../auth/auth.slice";
import {
  followUser,
  unfollowUser,
  blockUser,
} from "../relation/relation.slice";
import { deletePost } from "../post/post.slice";
import type { UpdateProfileBodyDTO } from "@social/shared";

type MeState = {
  me: User | null;
  status: "idle" | "loading" | "failed";
  error: UserError | null;
};

const initialState: MeState = {
  me: null,
  status: "idle",
  error: null,
};

export const fetchMe = createAsyncThunk<User>(
  "me/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<UserResponse>("/users/me");
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return UserMapper.toUser(res.data);
    } catch (e) {
      return rejectWithValue({
        code: "FETCH_ME_FAILED",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const updateProfile = createAsyncThunk<User, UpdateProfileBodyDTO>(
  "me/updateProfile",
  async (dto, { rejectWithValue }) => {
    try {
      await api.patch("/users/me/profile", dto);
      const res = await api.get<UserResponse>("/users/me");
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return UserMapper.toUser(res.data);
    } catch (e) {
      return rejectWithValue({
        code: "UPDATE_PROFILE_FAILED",
        message: getApiErrorMessage(e),
      });
    }
  }
);

//TODO: Update Provicy: isPrivate

const meSlice = createSlice({
  name: "me",
  initialState,
  reducers: {
    clearMe(state) {
      state.me = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = "idle";
        state.me = action.payload;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "FRONTEND_ERROR",
          message: "Failed to load user",
        };
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "idle";
        state.me = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as UserError) ?? {
          code: "UPDATE_PROFILE_FAILED",
          message: "Failed to update user profile",
        };
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.me = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.me = action.payload.user;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.me = action.payload.user;
      })
      .addCase(logout, (state) => {
        state.me = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const { result } = action.payload;
        if (state.me && result.status === "FOLLOWING") {
          state.me.followingCount += 1;
        }
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        if (state.me) {
          state.me.followingCount = Math.max(0, state.me.followingCount - 1);
        }
      })
      .addCase(blockUser.fulfilled, (state) => {
        if (state.me) {
          state.me.followingCount = Math.max(0, state.me.followingCount - 1);
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { authorId } = action.payload;
        if (state.me && state.me.id === authorId) {
          state.me.postCount = Math.max(0, state.me.postCount - 1);
        }
      });
  },
});

export const { clearMe } = meSlice.actions;
export default meSlice.reducer;
