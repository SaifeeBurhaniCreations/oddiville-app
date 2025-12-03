import { DataAccordianEnum } from '@/src/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type packageSize = {
    name: string;
    icon: DataAccordianEnum;
    isChecked: boolean;
    size: number;
    unit: "gm" | "kg";
};


interface PackageSizeState { selectedSizes: packageSize[] };

const initialState: PackageSizeState = {
    selectedSizes: [],
};

const packageSizeSlice = createSlice({
    name: 'packageSize',
    initialState,
    reducers: {
        togglePackageSize(state, action: PayloadAction<packageSize>) {
            const index = state.selectedSizes.findIndex(
                (s) => s.size === action.payload.size && s.unit === action.payload.unit
            );
            if (index >= 0) {
                state.selectedSizes = state.selectedSizes.filter(
                    (s) => !(s.size === action.payload.size && s.unit === action.payload.unit)
                );
            } else {
                state.selectedSizes = [...state.selectedSizes, action.payload];
            }
        },
        setPackageSizes(state, action: PayloadAction<packageSize[]>) {
            state.selectedSizes = action.payload;
        },
        resetPackageSizes(state) {
            state.selectedSizes = [];
        },
    },
});

export const {
    togglePackageSize,
    setPackageSizes,
    resetPackageSizes,
} = packageSizeSlice.actions;

export default packageSizeSlice.reducer;
