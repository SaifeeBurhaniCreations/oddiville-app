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

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type StorageRmRating = {
//     rating: string;
//     message: string
// }

// interface StorageState {
//   storageRmRating: StorageRmRating;
// }

// const initialState: StorageState = {
//  storageRmRating: {
//     rating: "5",
//     message: "Excellent",
//  }
// };

// const StorageSlice = createSlice({
//   name: "storage",
//   initialState,
//   reducers: {
//     setStorageRmRating: (state, action: PayloadAction<StorageRmRating>) => {
//         state.storageRmRating = action.payload;
//       },
//       clearStorageRmRating: (state) => {
//         state.storageRmRating = {
//           rating: "5",
//           message: "Excellent",
//         };
//       },
//   },
// });

// export const {
//   setStorageRmRating,
//   clearStorageRmRating
// } = StorageSlice.actions;

// export default StorageSlice.reducer;
