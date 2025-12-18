import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PoliciesProps {
  name: string;
  description?: string;
}

interface PoliciesState {
  selectedPolicies: PoliciesProps[];
  isSelectionDone: boolean;
}

const initialState: PoliciesState = {
  selectedPolicies: [],
  isSelectionDone: false,
};

const PoliciesSlice = createSlice({
  name: "policies",
  initialState,
  reducers: {
    togglePolicy: (state, action: PayloadAction<PoliciesProps>) => {      
      const exists = state.selectedPolicies.find(m => m.name === action.payload.name);
      if (exists) {
        state.selectedPolicies = state.selectedPolicies.filter(m => m.name !== action.payload.name);
      } else {
        state.selectedPolicies.push(action.payload);
      }
    },
    clearPolicies: (state) => {
      state.selectedPolicies = [];
      state.isSelectionDone = false;
    },
    setPolicies: (state, action: PayloadAction<PoliciesProps[]>) => {
      state.selectedPolicies = action.payload;
      state.isSelectionDone = true;
    },
    setSelectionDone: (state) => {
      state.isSelectionDone = true;
    },
    resetSelection: (state) => {
      state.isSelectionDone = false;
    },
  }
});

export const {
  togglePolicy,
  clearPolicies,
    setPolicies,   
  setSelectionDone,
  resetSelection,
} = PoliciesSlice.actions;

export default PoliciesSlice.reducer;
