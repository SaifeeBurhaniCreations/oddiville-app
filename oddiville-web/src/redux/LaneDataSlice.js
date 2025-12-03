import { createSlice } from "@reduxjs/toolkit";

const laneSlice = createSlice({
  name: "lane",
  initialState: {
    data: [],
  },
  reducers: {
    handleFetchData: (state, action) => {
      state.data = action.payload;
    },

    handlePostData: (state, action) => {
      state.data.push(action.payload);
    },

    handleModifyData: (state, action) => {
      const updatedItem = action.payload;
      const index = state.data.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        state.data[index] = updatedItem;
      }
    },
    //   state.data = state.data.map((project) =>
    //     project.id === updatedItem.id ? updatedItem : project
    //   );

    // handleModifyData: (state, action) => {
    //     const updated = action.payload;
    //     state.data = state.data.map(item =>
    //         item.id == updated.id
    //             ? { ...item, ...updated }
    //             : item
    //     );
    // },

    handleDeleteData: (state, action) => {
      const id = action.payload;
      state.data = state.data.filter((lane) => (lane._id || lane.id) !== id);
    },
  },
});

export const {
  handleFetchData,
  handlePostData,
  handleModifyData,
  handleDeleteData,
} = laneSlice.actions;

export default laneSlice.reducer;
