import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ActionHandlerPayload =
    | { type: 'href'; handler: string; id: string }
    | { type: 'toggle'; handler: boolean; id: string };


const initialState = {
    href: '',
    toggle: false,
    id: ''
};

const BottomSheetButtonHandlerSlice = createSlice({
    name: 'bottomSheet',
    initialState,
    reducers: {
        actionHandler: (state, action: PayloadAction<ActionHandlerPayload>) => {
            const { type, handler, id } = action.payload;
            if (type === 'href') state.href = handler as string;
            if (type === 'toggle') state.toggle = handler as boolean;
            state.id = id;
        }
    },
});

export const { actionHandler } = BottomSheetButtonHandlerSlice.actions;
export default BottomSheetButtonHandlerSlice.reducer;