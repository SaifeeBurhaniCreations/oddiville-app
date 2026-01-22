import { DataAccordianEnum } from '@/src/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PackageSize = {
    name: string;
    icon: DataAccordianEnum;
    isChecked: boolean;
    size: number;
    rawSize: string;
  unit: "gm" | "kg" | "qn" | null;
};


interface PackageSizeState { selectedSizes: PackageSize[] };

const initialState: PackageSizeState = {
    selectedSizes: [],
};

const packageSizeSlice = createSlice({
    name: 'packageSize',
    initialState,
    reducers: {
   togglePackageSize(state, action: PayloadAction<PackageSize>) {
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
        setPackageSizes(state, action: PayloadAction<PackageSize[]>) {
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
