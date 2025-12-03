import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ChangeView = {
    viewIs: "admin" | "supervisor";
}

const initialState: ChangeView = { viewIs: "admin" }

const changeViewSlice = createSlice({
    name: "change view",
    initialState,
    reducers: {
        changeViewTo: (state, action: PayloadAction<"admin" | "supervisor">) => {
            state.viewIs = action.payload;
        },
    },
});

export const { changeViewTo } = changeViewSlice.actions;
export default changeViewSlice.reducer;
