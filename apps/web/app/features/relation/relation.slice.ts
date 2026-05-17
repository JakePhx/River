import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiErrorMessage } from "../../shared/api/client";

import type {
  AcceptFollowBodyDTO,
  AcceptFollowResponseDTO,
  BlockTargetBodyDTO,
  BlockTargetResponseDTO,
  ErrorResponseDTO,
  FollowTargetBodyDTO,
  FollowTargetResponseDTO,
  RejectFollowBodyDTO,
  RejectFollowResponseDTO,
  RelationResponseDTO,
  UnBlockTargetBodyDTO,
  UnBlockTargetResponseDTO,
  UnFollowTargetBodyDTO,
  UnFollowTargetResponseDTO,
} from "@social/shared";
import type { ListUserResponse, User } from "../user/user.types";
import { UserMapper } from "../user/user.mapper";
import type {
  AcceptFollowRequestResponse,
  BlockTargetResponse,
  FollowTargetError,
  FollowTargetResponse,
  RejectFollowRequestResponse,
  RelationResponse,
  UnBlockTargetResponse,
  UnFollowTargetResponse,
} from "./relation.types";
import type { FollowActionResultRes, FollowTargetDto } from "@social/shared";

export type RelationStatus = "NONE" | "FOLLOWING" | "REQUESTED";

export type RelationState = {
  followStatus: RelationStatus;
  blocked: boolean;
};

type RelationsSliceState = {
  byUserId: Record<string, RelationState | undefined>;
  status: "idle" | "loading" | "failed";
  error: FollowTargetError | null;
  blockedList: {
    items: User[];
    status: "idle" | "loading" | "failed";
    error: ErrorResponseDTO | null;
  };
};

const initialState: RelationsSliceState = {
  byUserId: {},
  status: "idle",
  error: null,
  blockedList: { items: [], status: "idle", error: null },
};

export const followUser = createAsyncThunk<
  { targetUserId: string; result: FollowTargetResponseDTO },
  FollowTargetBodyDTO
>("relations/follow", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<FollowTargetResponse>("/follow", dto);
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { targetUserId: dto.targetUserId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "FOLLOW_USER_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const unfollowUser = createAsyncThunk<
  { targetUserId: string; result: UnFollowTargetResponseDTO },
  UnFollowTargetBodyDTO
>("relations/unfollow", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.delete<UnFollowTargetResponse>("/follow", {
      data: dto,
    });
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { targetUserId: dto.targetUserId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "UNFOLLOW_USER_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const cancelFollowRequest = createAsyncThunk<
  { targetUserId: string },
  FollowTargetDto
>("relations/cancelRequest", async (dto, { rejectWithValue }) => {
  try {
    await api.post("/follow/requests/cancel", dto);
    return { targetUserId: dto.targetUserId };
  } catch (e) {
    return rejectWithValue(getApiErrorMessage(e));
  }
});

export const acceptFollowRequest = createAsyncThunk<
  { requesterId: string; result: AcceptFollowResponseDTO },
  AcceptFollowBodyDTO
>("relations/acceptRequest", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<AcceptFollowRequestResponse>(
      "/follow/requests/accept",
      dto
    );
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { requesterId: dto.requesterId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "ACCEPT_FOLLOW_REQUEST_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchRelation = createAsyncThunk<
  { targetUserId: string; rel: RelationResponseDTO },
  { targetUserId: string }
>("relations/fetch", async ({ targetUserId }, { rejectWithValue }) => {
  try {
    const res = await api.get<RelationResponse>(
      `/follow/${targetUserId}/status`
    );
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { targetUserId, rel: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_RELATION_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const rejectFollowRequest = createAsyncThunk<
  { requesterId: string; result: RejectFollowResponseDTO },
  RejectFollowBodyDTO
>("relations/rejectRequest", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<RejectFollowRequestResponse>(
      "/follow/requests/reject",
      dto
    );
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { requesterId: dto.requesterId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "REJECT_FOLLOW_REQUEST_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const blockUser = createAsyncThunk<
  { targetUserId: string; result: BlockTargetResponseDTO },
  BlockTargetBodyDTO
>("relations/block", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<BlockTargetResponse>("/blocks", dto);
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { targetUserId: dto.targetUserId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "BLOCK_USER_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const unblockUser = createAsyncThunk<
  { targetUserId: string; result: UnBlockTargetResponseDTO },
  UnBlockTargetBodyDTO
>("relations/unblock", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.delete<UnBlockTargetResponse>("/blocks", {
      data: dto,
    });
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return { targetUserId: dto.targetUserId, result: res.data };
  } catch (e) {
    return rejectWithValue({
      code: "UNBLOCK_USER_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchBlockedUsers = createAsyncThunk<User[], void>(
  "relations/fetchBlockedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ListUserResponse>("/blocks");
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return res.data.items.map((u) => UserMapper.toUser(u));
    } catch (e) {
      return rejectWithValue({
        code: "FETCH_BLOCKED_USERS_FAILED",
        message: getApiErrorMessage(e),
      });
    }
  },
);

const relationsSlice = createSlice({
  name: "relations",
  initialState,
  reducers: {
    clearRelations(state) {
      state.byUserId = {};
      state.status = "idle";
      state.error = null;
      state.blockedList = { items: [], status: "idle", error: null };
    },
    setRelationState(
      state,
      action: {
        payload: { targetUserId: string; rel: Partial<RelationState> };
      }
    ) {
      const current = state.byUserId[action.payload.targetUserId] ?? {
        followStatus: "NONE" as const,
        blocked: false,
      };
      state.byUserId[action.payload.targetUserId] = {
        ...current,
        ...action.payload.rel,
      };
    },
  },
  extraReducers: (builder) => {
    const start = (state: RelationsSliceState) => {
      state.status = "loading";
      state.error = null;
    };
    const fail = (state: RelationsSliceState, action: { payload: unknown }) => {
      state.status = "failed";
      state.error = action.payload as FollowTargetError;
    };
    const done = (state: RelationsSliceState) => {
      state.status = "idle";
    };

    builder
      .addCase(followUser.pending, start)
      .addCase(unfollowUser.pending, start)
      .addCase(cancelFollowRequest.pending, start)
      .addCase(acceptFollowRequest.pending, start)
      .addCase(rejectFollowRequest.pending, start)
      .addCase(blockUser.pending, start)
      .addCase(unblockUser.pending, start)
      .addCase(fetchRelation.pending, start)
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.blockedList.status = "loading";
        state.blockedList.error = null;
      })
      .addCase(followUser.rejected, fail)
      .addCase(unfollowUser.rejected, fail)
      .addCase(cancelFollowRequest.rejected, fail)
      .addCase(acceptFollowRequest.rejected, fail)
      .addCase(rejectFollowRequest.rejected, fail)
      .addCase(blockUser.rejected, fail)
      .addCase(unblockUser.rejected, fail)
      .addCase(fetchRelation.rejected, fail)
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.blockedList.status = "failed";
        state.blockedList.error = action.payload as ErrorResponseDTO;
      })
      .addCase(fetchRelation.fulfilled, (state, action) => {
        done(state);
        state.byUserId[action.payload.targetUserId] = action.payload.rel;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.blockedList.status = "idle";
        state.blockedList.error = null;
        state.blockedList.items = action.payload;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        done(state);
        const prev = state.byUserId[action.payload.targetUserId] ?? {
          followStatus: "NONE" as const,
          blocked: false,
        };
        state.byUserId[action.payload.targetUserId] = {
          ...prev,
          followStatus: action.payload.result.status,
        };
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        done(state);
        const prev = state.byUserId[action.payload.targetUserId] ?? {
          followStatus: "NONE" as const,
          blocked: false,
        };
        state.byUserId[action.payload.targetUserId] = {
          ...prev,
          followStatus: "NONE",
        };
      })
      .addCase(cancelFollowRequest.fulfilled, (state, action) => {
        done(state);
        const prev = state.byUserId[action.payload.targetUserId] ?? {
          followStatus: "NONE" as const,
          blocked: false,
        };
        state.byUserId[action.payload.targetUserId] = {
          ...prev,
          followStatus: "NONE",
        };
      })
      .addCase(acceptFollowRequest.fulfilled, done)
      .addCase(rejectFollowRequest.fulfilled, done)
      .addCase(blockUser.fulfilled, (state, action) => {
        done(state);
        const prev = state.byUserId[action.payload.targetUserId] ?? {
          followStatus: "NONE" as const,
          blocked: false,
        };
        state.byUserId[action.payload.targetUserId] = {
          ...prev,
          blocked: true,
          followStatus: "NONE",
        };
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        done(state);
        const prev = state.byUserId[action.payload.targetUserId] ?? {
          followStatus: "NONE" as const,
          blocked: false,
        };
        state.byUserId[action.payload.targetUserId] = {
          ...prev,
          blocked: false,
        };
        state.blockedList.items = state.blockedList.items.filter(
          (u) => u.id !== action.payload.targetUserId,
        );
      });
  },
});

export const { clearRelations, setRelationState } = relationsSlice.actions;
export default relationsSlice.reducer;
