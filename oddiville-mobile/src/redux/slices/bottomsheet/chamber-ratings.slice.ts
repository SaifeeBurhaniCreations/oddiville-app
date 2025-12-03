import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ChamberRating = { name: string; rating: string };
export type ChamberQty = { name: string; quantity: string };

type State = {
    byId: Record<string, ChamberRating>;
    order: string[];
    chamberQty: Record<string, ChamberQty[]>;
};

const initialState: State = { byId: {}, order: [], chamberQty: {} };

const chamberRatingsSlice = createSlice({
    name: 'chamberRatings',
    initialState,
    reducers: {
        initFromSelection(state, action: PayloadAction<string[]>) {
            const selected = action.payload;
            const newById: Record<string, ChamberRating> = {};
            const newOrder: string[] = [];
            selected.forEach((name) => {
                const prev = state.byId[name];
                newById[name] = prev ?? { name, rating: '' };
                newOrder.push(name);
            });
            state.byId = newById;
            state.order = newOrder;
        },
        setRating(state, action: PayloadAction<{ chamber: string; rating: string }>) {
            const { chamber, rating } = action.payload;
            if (!state.byId[chamber]) state.byId[chamber] = { name: chamber, rating: '' };
            state.byId[chamber].rating = rating;
            if (!state.order.includes(chamber)) state.order.push(chamber);
        },
        setChamberQty(state, action: PayloadAction<ChamberQty>) {
            const { name, quantity } = action.payload;

            if (!state.chamberQty[name]) {
                state.chamberQty[name] = [];
            }

            const existingIndex = state.chamberQty[name].findIndex(
                (item) => item.name === name
            );

            if (existingIndex >= 0) {
                state.chamberQty[name][existingIndex].quantity = quantity;
            } else {
                state.chamberQty[name].push({ name, quantity });
            }
        },
        removeChambers(state, action: PayloadAction<string[]>) {
            const toRemove = new Set(action.payload);
            state.order = state.order.filter((n) => !toRemove.has(n));
            for (const n of toRemove) delete state.byId[n];
        },
        reset(state) {
            state.byId = {};
            state.order = [];
        },
    },
});

export const { initFromSelection, setRating, removeChambers, setChamberQty, reset } = chamberRatingsSlice.actions;
export default chamberRatingsSlice.reducer;
