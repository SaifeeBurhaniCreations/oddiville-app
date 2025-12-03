import { createSlice } from "@reduxjs/toolkit";

const ChamberSlice = createSlice({
  name: "chamber",
  initialState: { chamber: "", chambers: [] as any, isChamberSelected: false },
  reducers: {
    selectChamber: (state, action) => {
      state.chamber = action.payload;
    },
    setIsChamberSelected: (state, action) => {
      state.isChamberSelected = action.payload;
    },
    selectChambers: (state, action: any) => {
      const exists = state.chambers.find((m: any) => m === action.payload);
      if (exists) {
        state.chambers = state.chambers.filter((m: any) => m !== action.payload);
      } else {
        state.chambers.push(action.payload);
      }
    },
    reset(state) {
      state.chamber = "";
      state.chambers = [];
      state.isChamberSelected = false;
  },
  },
});

export const { selectChamber, selectChambers, setIsChamberSelected, reset } = ChamberSlice.actions;
export default ChamberSlice.reducer;
