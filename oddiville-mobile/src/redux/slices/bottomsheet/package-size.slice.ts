import { DataAccordianEnum } from '@/src/types';
import { getPackageKey } from '@/src/utils/packing/getPackageKey';
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
      const key = getPackageKey(action.payload);

      const index = state.selectedSizes.findIndex(
        (s) => getPackageKey(s) === key
      );

      if (index >= 0) {
        state.selectedSizes.splice(index, 1);
      } else {
        state.selectedSizes.push(action.payload);
      }
    },
    setPackageSizes(state, action: PayloadAction<PackageSize[]>) {
      state.selectedSizes = action.payload;
    },
    removeSelectedSize(state, action: PayloadAction<string>) {
      state.selectedSizes = state.selectedSizes.filter(
        pkg => getPackageKey(pkg) !== action.payload
      );
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
  removeSelectedSize,
} = packageSizeSlice.actions;

export default packageSizeSlice.reducer;
