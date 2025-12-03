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

      const key = updated._id ?? updated.id;
      if (!key) {
        console.warn(
          "handleModifyData: updated object missing id/_id",
          updated
        );
        return;
      }

      state.data = state.data.map((item) =>
        item[key] === updated[key] ? updated : item
      );
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
