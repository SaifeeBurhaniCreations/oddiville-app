import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  admin: {},
  homeBanner: {},
  counter: {},
  whatWeDo: [],
};

const AdminDataSlice = createSlice({
  name: "adminDataSlice",

  initialState,
  reducers: {
    resetState: (state) => {},
    handlePostCounter: (state, action) => {
      state.counter = action.payload;
    },
    handlePostBanner: (state, action) => {
      const data = action.payload;
      state.homeBanner = data;
    },
    handlePostWhatWeDo: (state, action) => {
      state.whatWeDo = action.payload;
    },
  },
});

export default AdminDataSlice.reducer;
export const {
  resetState,
  handlePostCounter,
  handlePostBanner,
  handlePostWhatWeDo,
} = AdminDataSlice.actions;
