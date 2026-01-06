import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PackageProductRating = {
    rating: number;
    message: string
}

interface PackageProductRatingState {
  packageProductRating: PackageProductRating;
}

const initialState: PackageProductRatingState = {
 packageProductRating: {
    rating: 5,
    message: "Excellent",
 }
};

const PackageProductRatingSlice = createSlice({
  name: "package-product-rating",
  initialState,
  reducers: {
    setPackageProductRating: (state, action: PayloadAction<PackageProductRating>) => {
        state.packageProductRating = action.payload;
      },
      clearPackageProductRating: (state) => {
        state.packageProductRating = {
          rating: 5,
          message: "Excellent",
        };
      },
  },
});

export const {
  setPackageProductRating,
  clearPackageProductRating
} = PackageProductRatingSlice.actions;

export default PackageProductRatingSlice.reducer;