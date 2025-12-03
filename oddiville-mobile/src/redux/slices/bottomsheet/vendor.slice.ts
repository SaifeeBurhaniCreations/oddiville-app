import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VendorState {
  selectedVendors: {name: string; }[];
}

const initialState: VendorState = {
  selectedVendors: [],
};

const VendorSlice = createSlice({
  name: "Vendor",
  initialState,
  reducers: {
    toggleVendor: (state, action: PayloadAction<{name: string;}>) => {
      const exists = state.selectedVendors.find(m => m.name === action.payload.name);
      if (exists) {
        state.selectedVendors = state.selectedVendors.filter(m => m.name !== action.payload.name);
      } else {
        state.selectedVendors.push(action.payload);
      }
    },
    clearVendors: (state) => {
      state.selectedVendors = [];
    },
  },
});

export const {
  toggleVendor,
  clearVendors,
} = VendorSlice.actions;

export default VendorSlice.reducer;
