import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductSearchState {
  productSearched: string;
}

const initialState: ProductSearchState = {
 productSearched: ""
};

const ProductSearchSlice = createSlice({
  name: "choose-product-search",
  initialState,
  reducers: {
    setProductSearch: (state, action: PayloadAction<string>) => {
        state.productSearched = action.payload;
      },
  },
});

export const {
  setProductSearch
} = ProductSearchSlice.actions;

export default ProductSearchSlice.reducer;
