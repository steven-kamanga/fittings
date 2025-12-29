import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  scrollLeft: 0,
  scrollTop: 0,
  lastScrollLeft: 0,
  lastScrollTop: 0,
};

const scrollSlice = createSlice({
  name: "scroll",
  initialState,
  reducers: {
    updateScroll: (state, action) => {
      const { scrollLeft, scrollTop } = action.payload;
      state.lastScrollLeft = state.scrollLeft;
      state.lastScrollTop = state.scrollTop;
      state.scrollLeft = scrollLeft;
      state.scrollTop = scrollTop;
    },
  },
});

export const { updateScroll } = scrollSlice.actions;
export default scrollSlice.reducer;
