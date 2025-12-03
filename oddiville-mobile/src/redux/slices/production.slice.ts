import { createSlice } from "@reduxjs/toolkit";

const ProductionSlice = createSlice({
    name: "production-slice",
    initialState: { isLoading: false },
    reducers: {
        setProductionLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    },
});

export const { setProductionLoading } = ProductionSlice.actions;
export default ProductionSlice.reducer;
