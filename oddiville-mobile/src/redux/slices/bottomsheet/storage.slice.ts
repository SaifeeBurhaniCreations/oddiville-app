import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StorageRmRating = {
    rating: string;
    message: string
}

interface StorageState {
  storageRmRating: StorageRmRating;
}

const initialState: StorageState = {
 storageRmRating: {
    rating: "5",
    message: "Excellent",
 }
};

const StorageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setStorageRmRating: (state, action: PayloadAction<StorageRmRating>) => {
        state.storageRmRating = action.payload;
      },
      clearStorageRmRating: (state) => {
        state.storageRmRating = {
          rating: "5",
          message: "Excellent",
        };
      },
  },
});

export const {
  setStorageRmRating,
  clearStorageRmRating
} = StorageSlice.actions;

export default StorageSlice.reducer;
