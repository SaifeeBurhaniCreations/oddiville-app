import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RatingFilter = {
  rating: number;
  message: string;
};

export type RatingBySize = {
  [sizeUnit: string]: RatingFilter; // "500-gm", "250-kg"
};

export type RatingByProductSize = {
  [productId: string]: RatingBySize;
};

export interface StorageRatingState {
  ratingByProductSize: RatingByProductSize;
}

export type PackageKey = `${number}-gm` | `${number}-kg`;

const initialState: StorageRatingState = {
  ratingByProductSize: {},
};

export const getProductSizeKey = (
  productId: string,
  size: number,
  unit: "gm" | "kg"
) => `${productId}|${size}|${unit}`;


const storageRatingSlice = createSlice({
  name: "storageRating",
  initialState,
  reducers: {

setRatingForProductSize: (
  state,
  action: PayloadAction<{
    productId: string;
    size: number;
    unit: "gm" | "kg";
    rating: RatingFilter;
  }>
) => {
  const { productId, size, unit, rating } = action.payload;
  const key = `${size}-${unit}`;

  if (!state.ratingByProductSize[productId]) {
    state.ratingByProductSize[productId] = {};
  }

  state.ratingByProductSize[productId][key] = rating;
},

clearRatingForProductSize: (
      state,
      action: PayloadAction<{
        productId: string;
        size: number;
        unit: "gm" | "kg";
      }>
    ) => {
      const key = getProductSizeKey(
        action.payload.productId,
        action.payload.size,
        action.payload.unit
      );

      delete state.ratingByProductSize[key];
    },

    clearAllRatings: (state) => {
      state.ratingByProductSize = {};
    },
  },
});

export const {
  setRatingForProductSize,
  clearRatingForProductSize,
  clearAllRatings,
} = storageRatingSlice.actions;

export default storageRatingSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type RatingFilter = {
//   rating: number;
//   message: string;
// };

// export type RatingFilterByRM = {
//   [rawMaterial: string]: RatingFilter;
// };

// interface StorageState {
//   ratingByRM: RatingFilterByRM;
// }

// const initialState: StorageState = {
//   ratingByRM: {},
// };

// const storageSlice = createSlice({
//   name: "storage",
//   initialState,
//   reducers: {
//     setRatingForRM: (
//       state,
//       action: PayloadAction<{
//         rawMaterial: string;
//         rating: RatingFilter;
//       }>
//     ) => {
//       state.ratingByRM[action.payload.rawMaterial] =
//         action.payload.rating;
//     },

//     clearRatings: (state) => {
//       state.ratingByRM = {};
//     },
//   },
// });

// export const { setRatingForRM, clearRatings } =
//   storageSlice.actions;
// export default storageSlice.reducer;