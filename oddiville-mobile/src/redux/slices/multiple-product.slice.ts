
import { PackageItem } from "@/src/hooks/useChamberStock";
import { createSlice } from "@reduxjs/toolkit";

type Chamber = { 
   id: string;
   quantity: string;
    rating: number
   }

export type MultipleProductType = {
  id: string;
  product_name: string;
  rating: number;
  packages: PackageItem[]; 
  chambers: {
    [chamberId: string]: Chamber;
  };
}

const ProductSlice = createSlice({
    name: "product",
   initialState: {
  selectedProducts: [] as MultipleProductType[],
  isProductLoading: false,
},
    reducers: {
      selectProduct: (state, action) => {
  const product = action.payload;

  if (!state.selectedProducts.find(p => p.id === product.id)) {
    state.selectedProducts.push({
      ...product,
      rating: 5,
      packages: [],
      chambers: {},
    });
  }
},

removeProduct: (state, action) => {
  state.selectedProducts = state.selectedProducts.filter(
    p => p.id !== action.payload
  );
},

updateProductRating: (state, action) => {
  const { productId, rating } = action.payload;
  const p = state.selectedProducts.find(p => p.id === productId);
  if (p) p.rating = rating;
},

setProductPackages: (state, action) => {
  const { productId, packages } = action.payload;
  const p = state.selectedProducts.find(p => p.id === productId);
  if (p) p.packages = packages;
},
    },
});

export const { selectProduct, removeProduct, updateProductRating, setProductPackages } = ProductSlice.actions;
export default ProductSlice.reducer;
