import { createSlice } from "@reduxjs/toolkit";

const initialState = { slectedUnit: "gm", source: "add-product-package" };
const UnitSelectSlice = createSlice({
  name: "unit select",
  initialState,
  reducers: {
    selectUnit: (state, action) => {
      state.slectedUnit = action.payload;
    },
    setSource: (state, action) => {
      state.source = action.payload;
    },
    clearUnit: () => initialState,
  },
});

export const { selectUnit, setSource, clearUnit } = UnitSelectSlice.actions;
export default UnitSelectSlice.reducer;
