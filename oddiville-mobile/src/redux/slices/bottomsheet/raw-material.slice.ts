import { RawMaterialProps } from "@/src/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type sourceEnum = "add" | "choose" | "vendor" | "chamber"  | "packaging";
interface RawMaterialState {
  selectedRawMaterials: RawMaterialProps[];
  source?: sourceEnum;
  selectedChambers: string[];
}

const initialState: RawMaterialState = {
  selectedRawMaterials: [],
  source: "choose",
  selectedChambers: [],
};

const RawMaterialSlice = createSlice({
  name: "rawMaterial",
  initialState,
  reducers: {
    toggleRawMaterial: (state, action: PayloadAction<RawMaterialProps>) => {      
      const exists = state.selectedRawMaterials.find(m => m.name === action.payload.name);
      if (exists) {
        state.selectedRawMaterials = state.selectedRawMaterials.filter(m => m.name !== action.payload.name);
      } else {
        state.selectedRawMaterials.push(action.payload);
      }
    },
    toggleChambers: (state, action: PayloadAction<string>) => {
      const exists = state.selectedChambers.includes(action.payload);
      if (exists) {
        state.selectedChambers = state.selectedChambers.filter(name => name !== action.payload);
      } else {
        state.selectedChambers = [...state.selectedChambers, action.payload];
      }
    },    
    setSource: (state, action: PayloadAction<sourceEnum>) => {
      state.source = action.payload;
    },
    setRawMaterials: (state, action: PayloadAction<RawMaterialProps[]>) => {
      state.selectedRawMaterials = action.payload;
    },
    clearRawMaterials: (state) => {
      state.selectedRawMaterials = [];
    },
    clearChambers: (state) => {
      state.selectedChambers = [];
    },
  }
});

export const {
  toggleRawMaterial,
  toggleChambers,
  clearRawMaterials,
  setSource,
  setRawMaterials,
  clearChambers,
} = RawMaterialSlice.actions;

export default RawMaterialSlice.reducer;
