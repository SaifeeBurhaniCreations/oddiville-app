import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PackageSizeSearchState {
  packageSizeSearched: string;
}

const initialState: PackageSizeSearchState = {
 packageSizeSearched: ""
};

const PackageSizeSearchSlice = createSlice({
  name: "choose-package-size-search",
  initialState,
  reducers: {
    setPackageSizeSearch: (state, action: PayloadAction<string>) => {
        state.packageSizeSearched = action.payload;
      },
  },
});

export const {
  setPackageSizeSearch
} = PackageSizeSearchSlice.actions;

export default PackageSizeSearchSlice.reducer;
