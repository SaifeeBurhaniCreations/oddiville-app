import { createSlice } from "@reduxjs/toolkit";

const RatingSlice = createSlice({
  name: "rating",
  initialState: { selectedRating: 0 },
  reducers: {
    setRating: (state, action) => {
      state.selectedRating = action.payload;
    },
  },
});

export const { setRating } = RatingSlice.actions;
export default RatingSlice.reducer;
