import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token') || null;
const userJson = localStorage.getItem('user');
const user = userJson ? JSON.parse(userJson) : null;

const initialState = {
  token,
  user,
  loading: false,
  error: null,
  isAuthenticated: !!token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('lastActiveTime', Date.now().toString());
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutUser: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActiveTime');
    },
    updateUserProfileSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logoutUser,
  updateUserProfileSuccess,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
