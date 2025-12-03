import { createSlice } from "@reduxjs/toolkit";

const UnitSelectSlice = createSlice({
  name: "unit select",
  initialState: { slectedUnit: "gm", source: "add-product-package" },
  reducers: {
    selectUnit: (state, action) => {
      state.slectedUnit = action.payload;
    },
    setSource: (state, action) => {
      state.source = action.payload;
    },
    clearUnit: () => ({ slectedUnit: "gm", source: "add-product-package" }),
  },
});

export const { selectUnit, setSource, clearUnit } = UnitSelectSlice.actions;
export default UnitSelectSlice.reducer;
