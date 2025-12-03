import { createSlice } from "@reduxjs/toolkit";

const ProductSlice = createSlice({
    name: "product",
    initialState: { product: "", rawMaterials: [], isProductLoading: false },
    reducers: {
        selectProduct: (state, action) => {
            state.product = action.payload;
        },
        setIsProductLoading: (state, action) => {
            state.isProductLoading = action.payload;
        },
        setRawMaterials: (state, action) => {
            state.rawMaterials = action.payload;
        },
        clearProduct: (state) => {
            state.product = "";
        },
    },
});

export const { selectProduct, setRawMaterials, clearProduct, setIsProductLoading } = ProductSlice.actions;
export default ProductSlice.reducer;
