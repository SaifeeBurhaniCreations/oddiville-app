import { createSlice } from "@reduxjs/toolkit";

const PackageTypeProductionSlice = createSlice({
  name: "package type production",
  initialState: { selectedPackageType: "pouch" },
  reducers: {
    selectPackageType: (state, action) => {
      state.selectedPackageType = action.payload;
    },
    clearPackageType: () => ({ selectedPackageType: "pouch" }),
  },
});

export const { selectPackageType, clearPackageType } = PackageTypeProductionSlice.actions;
export default PackageTypeProductionSlice.reducer;
