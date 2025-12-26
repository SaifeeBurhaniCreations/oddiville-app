import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DispatchUsedStockState = {
  [productId: string]: {
    [packageKey: string]: {
      packetsPerBag: number;
      usedBagsByChamber: {
        [chamberId: string]: number;
      };
    };
  };
};

const initialState: DispatchUsedStockState = {};

const usedStockSlice = createSlice({
  name: "usedStock",
  initialState,
  reducers: {
    setPacketsPerBag(
      state,
      action: PayloadAction<{
        productId: string;
        packageKey: string;
        packetsPerBag: number;
      }>
    ) {
      const { productId, packageKey, packetsPerBag } = action.payload;
      state[productId] ??= {};
      state[productId][packageKey] ??= { packetsPerBag: 0, usedBagsByChamber: {} };
      state[productId][packageKey].packetsPerBag = packetsPerBag;
    },

    setUsedBags(
      state,
      action: PayloadAction<{
        productId: string;
        packageKey: string;
        chamberId: string;
        bags: number;
      }>
    ) {
      const { productId, packageKey, chamberId, bags } = action.payload;
      state[productId] ??= {};
      state[productId][packageKey] ??= { packetsPerBag: 0, usedBagsByChamber: {} };
      state[productId][packageKey].usedBagsByChamber[chamberId] = bags;
    },

    clearUsedStock(state) {
      return {};
    },
  },
});

export const {
  setPacketsPerBag,
  setUsedBags,
  clearUsedStock,
} = usedStockSlice.actions;

export default usedStockSlice.reducer;