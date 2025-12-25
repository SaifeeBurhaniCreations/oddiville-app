import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RatingFilter = {
  rating: number;
  message: string;
};

export type RatingFilterByRM = {
  [product_name: string]: RatingFilter;
};

interface DispatchRatingState {
  ratingByRM: RatingFilterByRM;
}

const initialState: DispatchRatingState = {
  ratingByRM: {},
};

const dispatchRatingSlice = createSlice({
  name: "dispatchRating",
  initialState,
  reducers: {
    setDispatchRatingForRM: (
      state,
      action: PayloadAction<{
        product_name: string;
        rating: RatingFilter;
      }>
    ) => {
      state.ratingByRM[action.payload.product_name] =
        action.payload.rating;
    },

    clearDispatchRatings: (state) => {
      state.ratingByRM = {};
    },
  },
});

export const { setDispatchRatingForRM, clearDispatchRatings } =
  dispatchRatingSlice.actions;
export default dispatchRatingSlice.reducer;