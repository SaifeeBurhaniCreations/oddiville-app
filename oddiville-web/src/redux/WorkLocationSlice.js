import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
};

const WorkLocationSlice = createSlice({
  name: "workLocationSlice",

  initialState,
  reducers: {
    resetState: (state) => {},
    handleFetchData: (state, action) => {
      state.data = action.payload;
    },
    handlePostData: (state, action) => {
      state.data.push(action.payload);
    },
    handleRemoveData: (state, action) => {
      state.data = state.data.filter(
        (project) => project?.id !== action.payload
      );
    },
    handleModifyData: (state, action) => {
      const updated = action.payload;
      state.data = updated
    },
  },
});

export default WorkLocationSlice.reducer;
export const {
  resetState,
  handleFetchData,
  handlePostData,
  handleRemoveData,
  handleModifyData,
} = WorkLocationSlice.actions;
