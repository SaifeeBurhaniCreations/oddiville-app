import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RMSearchState {
  searchTerm: string;
}

const initialState: RMSearchState = {
 searchTerm: ""
};

const RMSearchSlice = createSlice({
  name: "add-raw-material-search",
  initialState,
  reducers: {
    setRMSearchTerm: (state, action: PayloadAction<string>) => {
        state.searchTerm = action.payload;
      },
  },
});

export const {
    setRMSearchTerm
} = RMSearchSlice.actions;

export default RMSearchSlice.reducer;
