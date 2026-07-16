import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import recordReducer from './slices/recordSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordReducer
  }
});

export default store;
