import { createSlice } from "@reduxjs/toolkit";

const PackageTypeProductionSlice = createSlice({
  name: "package type production",
  initialState: { selectedPackageType: "bag" },
  reducers: {
    selectPackageType: (state, action) => {
      state.selectedPackageType = action.payload;
    },
    clearPackageType: () => ({ selectedPackageType: "bag" }),
  },
});

export const { selectPackageType, clearPackageType } = PackageTypeProductionSlice.actions;
export default PackageTypeProductionSlice.reducer;
