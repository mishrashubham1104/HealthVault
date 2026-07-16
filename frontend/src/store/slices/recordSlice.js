import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  records: [],
  reminders: [],
  visits: [],
  shares: [],
  activeFamilyMember: null, // null means the primary patient themselves
  loading: false,
  error: null
};

const recordSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      const { type, data } = action.payload; // type can be 'records', 'reminders', 'visits', 'shares'
      state[type] = data;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addRecordSuccess: (state, action) => {
      state.records.unshift(action.payload);
    },
    deleteRecordSuccess: (state, action) => {
      state.records = state.records.filter(r => r._id !== action.payload);
    },
    addReminderSuccess: (state, action) => {
      state.reminders.push(action.payload);
    },
    updateReminderSuccess: (state, action) => {
      const idx = state.reminders.findIndex(r => r._id === action.payload._id);
      if (idx !== -1) {
        state.reminders[idx] = action.payload;
      }
    },
    deleteReminderSuccess: (state, action) => {
      state.reminders = state.reminders.filter(r => r._id !== action.payload);
    },
    addVisitSuccess: (state, action) => {
      state.visits.unshift(action.payload);
    },
    addShareSuccess: (state, action) => {
      state.shares.unshift(action.payload);
    },
    revokeShareSuccess: (state, action) => {
      state.shares = state.shares.filter(s => s._id !== action.payload);
    },
    setActiveFamilyMember: (state, action) => {
      state.activeFamilyMember = action.payload;
    }
  }
});

export const {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addRecordSuccess,
  deleteRecordSuccess,
  addReminderSuccess,
  updateReminderSuccess,
  deleteReminderSuccess,
  addVisitSuccess,
  addShareSuccess,
  revokeShareSuccess,
  setActiveFamilyMember
} = recordSlice.actions;

export default recordSlice.reducer;
