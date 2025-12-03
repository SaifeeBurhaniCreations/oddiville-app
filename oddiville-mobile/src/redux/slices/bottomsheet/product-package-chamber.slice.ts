import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductPackageChambersState {
  isChoosingChambers: boolean;
}

const initialState: ProductPackageChambersState = {
  isChoosingChambers: false,
};

const productPackageChambersSlice = createSlice({
  name: "productPackageChambers",
  initialState,
  reducers: {
    setIsChoosingChambers: (state, action: PayloadAction<boolean>) => {
      state.isChoosingChambers = action.payload;
    },
  },
});

export const { setIsChoosingChambers } = productPackageChambersSlice.actions;

export default productPackageChambersSlice.reducer;
