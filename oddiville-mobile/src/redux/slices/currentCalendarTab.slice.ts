import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type currentTabProps = {
    currentTab: number;
};

const currentCalendarTabSlice = createSlice({
    name: "currentCalendarTab",
    initialState: { currentTab: 0 } as currentTabProps,
    reducers: {
        setCurrentTab: (state, action: PayloadAction<number>) => {
            state.currentTab = action.payload;
        },
    },
});

export const { setCurrentTab } = currentCalendarTabSlice.actions;
export default currentCalendarTabSlice.reducer;
