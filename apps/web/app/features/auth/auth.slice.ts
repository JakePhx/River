import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// utilities
import { api, getApiErrorMessage } from "~/shared/api/client";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "~/shared/auth/token-storage";
import { UserMapper } from "../user/user.mapper";

// Types && DTOs
import type { User } from "../user/user.types";
import type { UserLoginBodyDTO, UserRegisterBodyDTO } from "@social/shared";
import type {
  AuthError,
  AuthLoginResponse,
  AuthRegisterResponse,
} from "./auth.type";

type AuthState = {
  accessToken: string | null;
  /**
   * `false` until the client runs `hydrateFromStorage` (reads `localStorage`).
   * Must stay false on the server so SSR markup matches the first client paint.
   */
  hasHydratedFromStorage: boolean;
  user: User | null;
  status: "idle" | "loading" | "failed";
  error: AuthError | null;
};

const initialState: AuthState = {
  accessToken: null,
  hasHydratedFromStorage: false,
  user: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  { user: User; accessToken: string },
  UserLoginBodyDTO
>("auth/login", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<AuthLoginResponse>("/auth/login", dto);
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return {
      user: UserMapper.toUser(res.data.user),
      accessToken: res.data.accessToken,
    };
  } catch (e) {
    return rejectWithValue({
      code: "FRONTEND_ERROR",
      message: getApiErrorMessage(e),
    });
  }
});

export const register = createAsyncThunk<
  { user: User; accessToken: string },
  UserRegisterBodyDTO
>("auth/register", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post<AuthRegisterResponse>("/auth/register", dto);
    if ("error" in res.data) {
      return rejectWithValue(res.data.error);
    }
    return {
      user: UserMapper.toUser(res.data.user),
      accessToken: res.data.accessToken,
    };
  } catch (e) {
    return rejectWithValue({
      code: "FRONTEND_ERROR",
      message: getApiErrorMessage(e),
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      state.accessToken = getAccessToken();
      state.hasHydratedFromStorage = true;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      clearAccessToken();
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.hasHydratedFromStorage = true;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as AuthError) ?? {
          code: "LOGIN_FAILED",
          message: "Login failed",
        };
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.hasHydratedFromStorage = true;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as AuthError) ?? {
          code: "REGISTRATION_FAILED",
          message: "Registration failed",
        };
      });
  },
});

export const { hydrateFromStorage, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
