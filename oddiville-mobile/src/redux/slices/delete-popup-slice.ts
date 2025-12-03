import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DeletePopupState {
  showDeletePopup: boolean;
  showVendorDeletePopup: boolean;
}

const initialState: DeletePopupState = {
  showDeletePopup: false,
  showVendorDeletePopup: false,
};

const DeletePopupSlice = createSlice({
  name: "delete-popup",
  initialState,
  reducers: {
    setDeleteUserPopup: (state, action: PayloadAction<boolean>) => {
      state.showDeletePopup = action.payload;
    },
    setVendorDeletePopup: (state, action: PayloadAction<boolean>) => {
      state.showVendorDeletePopup = action.payload;
    },
  },
});

export const { setDeleteUserPopup, setVendorDeletePopup } = DeletePopupSlice.actions;

export default DeletePopupSlice.reducer;
