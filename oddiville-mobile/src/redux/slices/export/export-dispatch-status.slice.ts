import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ExportDispatchStatus = "pending" | "in-progress" | "completed";

type ExportDispatchStatusState = {
  selectedDispatchStatuses: ExportDispatchStatus[];
};

const initialState: ExportDispatchStatusState = {
  selectedDispatchStatuses: [],
};

const exportDispatchStatusSlice = createSlice({
  name: "exportDispatchStatus",
  initialState,
  reducers: {
    setDispatchStatuses(state, action: PayloadAction<ExportDispatchStatus[]>) {
      state.selectedDispatchStatuses = action.payload;
    },

    toggleDispatchStatus(state, action: PayloadAction<ExportDispatchStatus>) {
      const value = action.payload;

      if (state.selectedDispatchStatuses.includes(value)) {
        state.selectedDispatchStatuses = state.selectedDispatchStatuses.filter(
          (s) => s !== value,
        );
      } else {
        state.selectedDispatchStatuses = [
          ...new Set([...state.selectedDispatchStatuses, value]),
        ];
      }
    },

    clearDispatchStatuses(state) {
      state.selectedDispatchStatuses = initialState.selectedDispatchStatuses;
    },
  },
});

export const { setDispatchStatuses, toggleDispatchStatus, clearDispatchStatuses } =
  exportDispatchStatusSlice.actions;

export default exportDispatchStatusSlice.reducer;