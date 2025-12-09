import { DataAccordianEnum } from '@/src/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type packageSize = {
    name: string;
    icon: DataAccordianEnum;
    isChecked: boolean;
    size: number;
    rawSize: string;
    unit: "gm" | "kg" | string;
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
    (s) => s.rawSize === action.payload.rawSize
  );

  if (index >= 0) {
    // remove it
    state.selectedSizes = state.selectedSizes.filter(
      (s) => s.rawSize !== action.payload.rawSize
    );
  } else {
    // add it
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
