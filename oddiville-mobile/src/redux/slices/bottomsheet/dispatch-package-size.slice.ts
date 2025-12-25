import { DataAccordianEnum } from '@/src/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type dispatchPackageSize = {
    name: string;
    icon: DataAccordianEnum;
    isChecked: boolean;
    size: number;
    rawSize: string;
    count: number;
    unit: "kg" | "gm" | "qn" | null;
};


interface DispatchPackageSizeState { selectedSizes: dispatchPackageSize[] };

const initialState: DispatchPackageSizeState = {
    selectedSizes: [],
};

const dispatchPackageSizeSlice = createSlice({
    name: 'dispatchPackageSize',
    initialState,
    reducers: {
   toggleDispatchPackageSize(state, action: PayloadAction<dispatchPackageSize>) {
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
        setDispatchPackageSizes(state, action: PayloadAction<dispatchPackageSize[]>) {
            state.selectedSizes = action.payload;
        },
        resetDispatchPackageSizes(state) {
            state.selectedSizes = [];
        },
    },
});

export const {
    toggleDispatchPackageSize,
    setDispatchPackageSizes,
    resetDispatchPackageSizes,
} = dispatchPackageSizeSlice.actions;

export default dispatchPackageSizeSlice.reducer;
