import { createSlice } from "@reduxjs/toolkit";
export interface Product {
  id: string;
  product_name: string;
  image?: string;
  rating?: number;
  packages?: any[];
  chambers?: any[];
}
interface ProductState {
  // product: Product | null;
  productName: string | null;
  rawMaterials: any[];
  isProductLoading: boolean;
}

const initialState: ProductState = {
  // product: null,
  productName: null,
  rawMaterials: [],
  isProductLoading: false,
};

const ProductSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // selectProduct: (state, action) => {
    //   state.product = action.payload;
    // },
    setProductName: (state, action) => {
      state.productName = action.payload;
    },
    setIsProductLoading: (state, action) => {
      state.isProductLoading = action.payload;
    },
    setRawMaterials: (state, action) => {
      state.rawMaterials = action.payload;
    },
    clearProduct: (state) => initialState,
  },
});

export const { setProductName, setRawMaterials, clearProduct, setIsProductLoading } = ProductSlice.actions;
export default ProductSlice.reducer;
