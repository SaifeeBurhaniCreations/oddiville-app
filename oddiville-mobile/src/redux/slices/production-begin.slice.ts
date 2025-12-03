import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { string } from "zod";

type ProductionBeginProps = {
    chambers: {
        chamberName: string
        quantity: string
    }[];
    chamberCapacityWithName: {
        chamberName: string
        chamberCapacity: string
    }[];
    total: number;
    productName: string;
}
const initialState: ProductionBeginProps = {
    chambers: [],
    chamberCapacityWithName: [],
    total: 0,
    productName: '',
}

const ProductionBeginSlice = createSlice({
    name: "production begins",
    initialState: initialState,
    reducers: {
        setChambersAndTotal: (state, action: PayloadAction<ProductionBeginProps>) => {
            state.chambers = action.payload.chambers;
            state.chamberCapacityWithName = action.payload.chamberCapacityWithName;
            state.total = action.payload.total;
        },
        setProductName: (state, action: PayloadAction<string>) => {
        state.productName = action.payload;
        },
    },
});

export const { setChambersAndTotal, setProductName } = ProductionBeginSlice.actions;
export default ProductionBeginSlice.reducer;
