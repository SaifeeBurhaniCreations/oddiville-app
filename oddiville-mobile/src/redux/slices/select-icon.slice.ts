import { createSlice } from "@reduxjs/toolkit";

const SelectIconSlice = createSlice({
  name: "selectIcon",
  initialState: { selectedIconName: "" },
  reducers: {
    toggleSelectedIcon: (state, action) => {
      state.selectedIconName = action.payload;
    },
  },
});

export const { toggleSelectedIcon } = SelectIconSlice.actions;
export default SelectIconSlice.reducer;
