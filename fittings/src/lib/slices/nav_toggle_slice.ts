import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToggleState {
  sidebarOpen: boolean;
  lastToggleTimestamp: number | null;
  toggleCount: number;
}

const initialState: ToggleState = {
  sidebarOpen: false,
  lastToggleTimestamp: null as number | null,
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
    setSidebarState: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, resetToggleCount, setSidebarState } =
  toggleSlice.actions;
export default toggleSlice.reducer;
