import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IdState = {
    id: string;
    type?: string;
};

const initialState: IdState = {
    id: "",
    type: undefined,
};

const idSlice = createSlice({
    name: 'idStore',
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        setIdWithType: (state, action: PayloadAction<{ id: string; type?: string }>) => {
            state.id = action.payload.id;
            state.type = action.payload.type;
        },
        clearId: (state) => {
            state.id = "";
            state.type = undefined;
        },
    },
});

export const { setId, setIdWithType, clearId } = idSlice.actions;
export default idSlice.reducer;
