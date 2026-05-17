import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiErrorMessage } from "../../shared/api/client";
import type {
  Post,
  PostError,
  ListPostResponse,
  CreatePostResponse,
  Comment,
} from "./post.types";
import { PostMapper } from "./post.mapper";
import type {
  CreateCommentBodyDTO,
  CreatePostBodyDTO,
  CreateCommentResponseDTO,
  GetPostDetailResponseDTO,
  ListCommentsResponseDTO,
  UpdatePostBodyDTO,
  UpdatePostResponseDTO,
  DeletePostResponseDTO,
} from "@social/shared";

type PostState = {
  items: Post[];
  status: "idle" | "loading" | "failed";
  error: PostError | null;
  nextCursor: string | null;
  hasMore: boolean;
  /** Comments keyed by post id (feed expand + shared cache) */
  commentsByPostId: Record<string, Comment[]>;
  /** Load state for `GET /posts/:id/comments` */
  commentsLoadStatus: Record<string, "idle" | "loading" | "failed">;
  /** Single-post view (`/posts/:postId`) */
  detail: {
    post: Post | null;
    comments: Comment[];
    status: "idle" | "loading" | "failed";
    error: PostError | null;
  };
};

const PAGE_SIZE = 20;

const initialState: PostState = {
  items: [],
  status: "idle",
  error: null,
  nextCursor: null,
  hasMore: true,
  commentsByPostId: {},
  commentsLoadStatus: {},
  detail: {
    post: null,
    comments: [],
    status: "idle",
    error: null,
  },
};

export const fetchFeed = createAsyncThunk<
  { data: { items: Post[]; nextCursor: string | null }; isReset: boolean },
  { cursor?: string | null; reset?: boolean } | void
>("feed/fetch", async (params, { rejectWithValue }) => {
  try {
    const cursor = params ? params.cursor : undefined;
    const reset = params ? params.reset : false;
    const res = await api.get<ListPostResponse>("/posts/feed", {
      params: { cursor, take: PAGE_SIZE },
    });
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return {
      data: {
        items: res.data.items.map((item) => PostMapper.toPost(item)),
        nextCursor: res.data.nextCursor,
      },
      isReset: !!reset,
    };
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_POSTS_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchPostById = createAsyncThunk<
  { post: Post; comments: Comment[] },
  { postId: string }
>("feed/fetchPostById", async ({ postId }, { rejectWithValue }) => {
  try {
    const res = await api.get<GetPostDetailResponseDTO>(
      `/posts/${encodeURIComponent(postId)}`
    );
    return {
      post: PostMapper.toPost(res.data.post),
      comments: res.data.comments.map((c) => PostMapper.toComment(c)),
    };
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_POST_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const fetchPostComments = createAsyncThunk<
  { postId: string; comments: Comment[] },
  { postId: string }
>("feed/fetchPostComments", async ({ postId }, { rejectWithValue }) => {
  try {
    const res = await api.get<ListCommentsResponseDTO>(
      `/posts/${encodeURIComponent(postId)}/comments`
    );
    return {
      postId,
      comments: res.data.comments.map((c) => PostMapper.toComment(c)),
    };
  } catch (e) {
    return rejectWithValue({
      code: "FETCH_COMMENTS_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const createComment = createAsyncThunk<
  { postId: string; comment: Comment },
  { postId: string; content: string; parentCommentId?: string }
>("feed/createComment", async (params, { rejectWithValue }) => {
  try {
    const body: CreateCommentBodyDTO = {
      content: params.content.trim(),
      parentCommentId: params.parentCommentId,
    };
    const res = await api.post<CreateCommentResponseDTO>(
      `/posts/${encodeURIComponent(params.postId)}/comments`,
      body
    );
    return {
      postId: params.postId,
      comment: PostMapper.toComment(res.data.comment),
    };
  } catch (e) {
    return rejectWithValue({
      code: "CREATE_COMMENT_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const createPost = createAsyncThunk<Post, CreatePostBodyDTO>(
  "feed/createPost",
  async (dto, { rejectWithValue }) => {
    try {
      const res = await api.post<CreatePostResponse>("/posts", dto);
      if ("error" in res.data) {
        return rejectWithValue(res.data.error);
      }
      return PostMapper.toPost(res.data.post);
    } catch (e) {
      return rejectWithValue({
        code: "CREATE_POST_FAILED",
        message: getApiErrorMessage(e),
      });
    }
  }
);

export const updatePost = createAsyncThunk<
  Post,
  { postId: string; content: string }
>("feed/updatePost", async ({ postId, content }, { rejectWithValue }) => {
  try {
    const body: UpdatePostBodyDTO = { content: content.trim() };
    const res = await api.patch<UpdatePostResponseDTO>(
      `/posts/${encodeURIComponent(postId)}`,
      body
    );
    return PostMapper.toPost(res.data.post);
  } catch (e) {
    return rejectWithValue({
      code: "UPDATE_POST_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

export const deletePost = createAsyncThunk<
  DeletePostResponseDTO,
  { postId: string }
>("feed/deletePost", async ({ postId }, { rejectWithValue }) => {
  try {
    const res = await api.delete<DeletePostResponseDTO>(
      `/posts/${encodeURIComponent(postId)}`
    );
    return res.data;
  } catch (e) {
    return rejectWithValue({
      code: "DELETE_POST_FAILED",
      message: getApiErrorMessage(e),
    });
  }
});

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    clearFeed(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.nextCursor = null;
      state.hasMore = true;
      state.commentsByPostId = {};
      state.commentsLoadStatus = {};
      state.detail = {
        post: null,
        comments: [],
        status: "idle",
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { data, isReset } = action.payload;
        if (isReset) {
          state.items = data.items;
        } else {
          const existingIds = new Set(state.items.map((p) => p.id));
          const newItems = data.items.filter((p) => !existingIds.has(p.id));
          state.items = [...state.items, ...newItems];
        }
        state.status = "idle";
        state.nextCursor = data.nextCursor;
        state.hasMore = data.nextCursor !== null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as PostError) ?? {
          code: "FETCH_POSTS_FAILED",
          message: "Failed to load feed",
        };
      })
      .addCase(createPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as PostError) ?? {
          code: "CREATE_POST_FAILED",
          message: "Failed to create post",
        };
      })
      .addCase(fetchPostById.pending, (state) => {
        state.detail.status = "loading";
        state.detail.error = null;
        state.detail.post = null;
        state.detail.comments = [];
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.detail.status = "idle";
        state.detail.post = action.payload.post;
        state.detail.comments = action.payload.comments;
        state.detail.error = null;
        state.commentsByPostId[action.payload.post.id] = action.payload.comments;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.detail.status = "failed";
        state.detail.post = null;
        state.detail.comments = [];
        state.detail.error = (action.payload as PostError) ?? {
          code: "FETCH_POST_FAILED",
          message: "Failed to load post",
        };
      })
      .addCase(fetchPostComments.pending, (state, action) => {
        const postId = action.meta.arg.postId;
        state.commentsLoadStatus[postId] = "loading";
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsByPostId[postId] = comments;
        state.commentsLoadStatus[postId] = "idle";
      })
      .addCase(fetchPostComments.rejected, (state, { meta }) => {
        state.commentsLoadStatus[meta.arg.postId] = "failed";
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = [];
        }
        state.commentsByPostId[postId].push(comment);
        if (state.detail.post?.id === postId) {
          state.detail.comments.push(comment);
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
        if (state.detail.post?.id === updated.id) {
          state.detail.post = updated;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        state.items = state.items.filter((p) => p.id !== postId);
        delete state.commentsByPostId[postId];
        delete state.commentsLoadStatus[postId];
        if (state.detail.post?.id === postId) {
          state.detail.post = null;
          state.detail.comments = [];
          state.detail.status = "idle";
        }
      });
  },
});

export const { clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
