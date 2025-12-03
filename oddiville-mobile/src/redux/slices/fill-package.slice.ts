import { createSlice } from "@reduxjs/toolkit";

const FillPackageSlice = createSlice({
  name: "fillPackage",
  initialState: { identifier: "", value: "", isLoading: false },
  reducers: {
    setFillPackage: (state, action) => {
      state.identifier = action.payload.identifier;
      state.value = action.payload.val;
    },
    getFillPackage: (state, action) => {
      return action.payload;
    },
    setIsLoadingPackage: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setFillPackage, getFillPackage, setIsLoadingPackage } = FillPackageSlice.actions;
export default FillPackageSlice.reducer;
