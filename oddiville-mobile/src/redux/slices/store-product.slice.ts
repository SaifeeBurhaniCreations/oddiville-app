import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProductionBatch = {
    batch_code: string | null;
    createdAt: string;
    end_time: string | null;
    id: string;
    lane: string;
    notes: string | null;
    product_name: string;
    quantity: number;
    rating: string;
    raw_material_id: string | null;
    raw_material_order_id: string | null;
    sample_images: any[];
    start_time: string | null;
    status: string;
    supervisor: string | null;
    unit: string;
    updatedAt: string;
    wastage_quantity: number | null;
};

interface StoreProductState {
    store: boolean;
    product: ProductionBatch;
}

const product = {
    batch_code: "",
    createdAt: "",
    end_time: "",
    id: "",
    lane: "",
    notes: "",
    product_name: "",
    quantity: 0,
    rating: "",
    raw_material_id: "",
    raw_material_order_id: "",
    sample_images: [],
    start_time: "",
    status: "",
    supervisor: "",
    unit: "",
    updatedAt: "",
    wastage_quantity: 0,
}

const initialState: StoreProductState = { store: false, product };

const StoreProductSlice = createSlice({
    name: "StoreProductSlice",
    initialState,
    reducers: {
        toggleStore: (state, action: PayloadAction<boolean>) => {
            state.store = action.payload;
        },
        setCurrentProduct: (state, action: PayloadAction<ProductionBatch>) => {
            state.product = action.payload;
        },
        resetProductStore: (state) => {
            state.product = product;
            state.store = false;
        },
    },
});

export const { toggleStore, setCurrentProduct, resetProductStore } = StoreProductSlice.actions;
export default StoreProductSlice.reducer;
