import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RatingFilter = {
  rating: number;
  message: string;
};

export type RatingFilterByRM = {
  [rawMaterial: string]: RatingFilter;
};

interface StorageState {
  ratingByRM: RatingFilterByRM;
}

const initialState: StorageState = {
  ratingByRM: {},
};

const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setRatingForRM: (
      state,
      action: PayloadAction<{
        rawMaterial: string;
        rating: RatingFilter;
      }>
    ) => {
      state.ratingByRM[action.payload.rawMaterial] =
        action.payload.rating;
    },

    clearRatings: (state) => {
      state.ratingByRM = {};
    },
  },
});

export const { setRatingForRM, clearRatings } =
  storageSlice.actions;
export default storageSlice.reducer;