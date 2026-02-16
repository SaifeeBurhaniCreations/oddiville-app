import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ExportStatus = "pending" | "in-queue" | "in-progress" | "completed"; 

type ExportStatusState = {
  selectedStatuses: ExportStatus[];
};

const initialState: ExportStatusState = {
  selectedStatuses: [],
};

const exportStatusSlice = createSlice({
  name: "exportStatus",
  initialState,
  reducers: {
    setStatuses(state, action: PayloadAction<ExportStatus[]>) {
      state.selectedStatuses = action.payload;
    },

    toggleStatus(state, action: PayloadAction<ExportStatus>) {
      const value = action.payload;
      if (state.selectedStatuses.includes(value)) {
        state.selectedStatuses = state.selectedStatuses.filter(s => s !== value);
      } else {
        state.selectedStatuses.push(value);
      }
    },

    clearStatuses(state) {
      state.selectedStatuses = [];
    },
  },
});

export const { setStatuses, toggleStatus, clearStatuses } =
  exportStatusSlice.actions;

export default exportStatusSlice.reducer;