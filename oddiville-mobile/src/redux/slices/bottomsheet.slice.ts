import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BottomSheetState, BottomSheetConfig, BottomSheetMeta } from '@/src/types';

const initialState: BottomSheetState = {
  isVisible: false,
  config: null,
  meta: {
    id: "",
    type: undefined,
    mode: "select-main",
    mainSelection: undefined,
    subSelection: '',
    data: {}
  },
};

const bottomSheetSlice = createSlice({
  name: 'bottomSheet',
  initialState,
  reducers: {
    openBottomSheet: (state, action: PayloadAction<BottomSheetConfig>) => {
      state.isVisible = true;
      state.config = action.payload;
      state.meta = action.payload.meta;
    },
    closeBottomSheet: (state) => {
      state.isVisible = false;
      state.config = null;
    },
    updateBottomSheetConfig: (state, action: PayloadAction<BottomSheetConfig>) => {
      state.config = action.payload;
    },
    updateBottomSheetMeta: (
      state,
      action: PayloadAction<Partial<BottomSheetMeta>>
    ) => {
      state.meta = {
        ...state.meta,
        ...action.payload,
      };
    },
  },
});

export const {
  openBottomSheet,
  closeBottomSheet,
  updateBottomSheetConfig,
  updateBottomSheetMeta,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
