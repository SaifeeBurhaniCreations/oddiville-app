import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SelectRoleTypes = {
  selectedRole: "admin" | "supervisor" | undefined;
};

const initialState: SelectRoleTypes = { selectedRole: undefined };

const SelectRoleSlice = createSlice({
  name: "select role",
  initialState,
  reducers: {
    selectRole: (
      state,
      action: PayloadAction<"admin" | "supervisor" | undefined>
    ) => {
      state.selectedRole = action.payload;
    },
    clearRole: () => ({ selectedRole: undefined }),
  },
});

export const { selectRole, clearRole } = SelectRoleSlice.actions;
export default SelectRoleSlice.reducer;