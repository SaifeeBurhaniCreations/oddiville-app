import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PackingDraft,
  RawMaterialConsumption,
  PackagingPlanItem,
  PackedStorageSummary,
} from "@/src/types/domain/packing/packing.types";
import { createEmptyPackingDraft } from "@/src/initials/packing.initials";

interface PackingDraftState {
  draft: PackingDraft;
}

const initialState: PackingDraftState = {
  draft: createEmptyPackingDraft(),
};

export const packingDraftSlice = createSlice({
  name: "packingDraft",
  initialState,
  reducers: {
    resetDraft(state) {
      state.draft = createEmptyPackingDraft();
    },

    updateProduct(state, action: PayloadAction<Partial<PackingDraft["product"]>>) {
      state.draft.product = {
        ...state.draft.product,
        ...action.payload,
      };
    },

    setRawMaterialConsumption(
      state,
      action: PayloadAction<RawMaterialConsumption[]>
    ) {
      state.draft.rawMaterialConsumption = action.payload;
    },

    setPackagingPlan(
      state,
      action: PayloadAction<PackagingPlanItem[]>
    ) {
      state.draft.packagingPlan = action.payload;
    },

    setPackedStorageSummary(
      state,
      action: PayloadAction<PackedStorageSummary[]>
    ) {
      state.draft.packedStorageSummary = action.payload;
    },

    setValidation(
      state,
      action: PayloadAction<PackingDraft["validation"]>
    ) {
      state.draft.validation = action.payload;
    },

    markDraftReady(state) {
      state.draft.meta.status = "ready";
      state.draft.meta.lastUpdatedAt = new Date().toISOString();
    },

    markDraftSubmitted(state) {
      state.draft.meta.status = "submitted";
      state.draft.meta.lastUpdatedAt = new Date().toISOString();
    },
  },
});

export const {
  resetDraft,
  updateProduct,
  setRawMaterialConsumption,
  setPackagingPlan,
  setPackedStorageSummary,
  setValidation,
  markDraftReady,
  markDraftSubmitted,
} = packingDraftSlice.actions;

export default packingDraftSlice.reducer;