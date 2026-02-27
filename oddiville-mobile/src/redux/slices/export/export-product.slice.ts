import { createSlice } from "@reduxjs/toolkit";

type ExportStatusState = {
  selectedProduct: string[];
};

const initialState: ExportStatusState = {
  selectedProduct: [],
};

const exportProductSlice = createSlice({
  name: "exportProduct",
  initialState,
  reducers: {
    setProducts(state, action) {
      state.selectedProduct = action.payload;
    },

    toggleProduct(state, action) {
      const value = action.payload;

      if (state.selectedProduct.includes(value)) {
        state.selectedProduct = state.selectedProduct.filter(
          (s) => s !== value,
        );
      } else {
        state.selectedProduct = [
          ...new Set([...state.selectedProduct, value]),
        ];
      }
    },

    clearProduct(state) {
      state.selectedProduct = [];
    },
  },
});

export const { setProducts, toggleProduct, clearProduct } =
  exportProductSlice.actions;

export default exportProductSlice.reducer;