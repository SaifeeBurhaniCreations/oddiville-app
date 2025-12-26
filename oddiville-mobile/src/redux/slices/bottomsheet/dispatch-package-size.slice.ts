import { DataAccordianEnum } from '@/src/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DispatchPackageSize = {
    key: string;
  name: string;
  icon: DataAccordianEnum;
  isChecked: boolean;
  size: number;
  rawSize: string;
  count: number;
  unit: "kg" | "gm" | "qn" | null;
};

type DispatchPackageSizeState = {
  selectedSizesByProduct: Record<string, DispatchPackageSize[]>;
};

const initialState: DispatchPackageSizeState = {
  selectedSizesByProduct: {},
};

const dispatchPackageSizeSlice = createSlice({
  name: "dispatchPackageSize",
  initialState,
  reducers: {
    toggleDispatchPackageSize(
      state,
      action: PayloadAction<{
        productId: string;
        pkg: DispatchPackageSize;
      }>
    ) {
      const { productId, pkg } = action.payload;

      const current = state.selectedSizesByProduct[productId] ?? [];

       const exists = current.find(s => s.key === pkg.key);

      state.selectedSizesByProduct[productId] = exists
        ? current.filter(s => s.key !== pkg.key)
        : [...current, pkg];
    },

    setDispatchPackageSizes(
      state,
      action: PayloadAction<{
        productId: string;
        packages: DispatchPackageSize[];
      }>
    ) {
      state.selectedSizesByProduct[action.payload.productId] =
        action.payload.packages;
    },

    resetDispatchPackageSizesForProduct(
      state,
      action: PayloadAction<string>
    ) {
      delete state.selectedSizesByProduct[action.payload];
    },

    resetAllDispatchPackageSizes(state) {
      state.selectedSizesByProduct = {};
    },
  },
});

export const {
  toggleDispatchPackageSize,
  setDispatchPackageSizes,
  resetDispatchPackageSizesForProduct,
  resetAllDispatchPackageSizes,
} = dispatchPackageSizeSlice.actions;

export default dispatchPackageSizeSlice.reducer;
