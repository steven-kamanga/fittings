import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  lastToggleTimestamp: null,
  toggleCount: 0,
};

const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      state.lastToggleTimestamp = Date.now();
      state.toggleCount += 1;
    },
    resetToggleCount: (state) => {
      state.toggleCount = 0;
    },
    setSidebarState: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, resetToggleCount, setSidebarState } =
  toggleSlice.actions;
export default toggleSlice.reducer;
