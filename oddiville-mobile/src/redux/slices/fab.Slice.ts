import { createSlice } from "@reduxjs/toolkit";

const fabSlice = createSlice({
  name: "fab",
  initialState: { isOpen: false },
  reducers: {
    toggleFab: (state, action) => {
      state.isOpen = action.payload;
    },
    closeFab: (state) => {
      state.isOpen = false;
    },
  },
});

export const { toggleFab, closeFab } = fabSlice.actions;
export default fabSlice.reducer;
