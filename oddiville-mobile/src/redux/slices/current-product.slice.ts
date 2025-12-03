import { createSlice } from "@reduxjs/toolkit";

const ProductSlice = createSlice({
    name: "product",
    initialState: { currentProductId: "" },
    reducers: {
        setCurrentProductId: (state, action) => {
            state.currentProductId = action.payload;
        },
        clearCurrentProduct: (state) => {
            state.currentProductId = "";
        },
    },
});

export const { setCurrentProductId, clearCurrentProduct } = ProductSlice.actions;
export default ProductSlice.reducer;
