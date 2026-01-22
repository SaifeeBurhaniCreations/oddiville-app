import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PackingDraft,
  PackagingPlanItem,
  PackedStorageSummary,
  RawMaterialConsumptionPayload,
} from "@/src/types/domain/packing/packing.types";
import { createEmptyPackingDraft } from "@/src/initials/packing.initials";
import { PackingSubmitPayload } from "@/src/hooks/packing/usePackingForm";

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

    updateProduct(
      state,
      action: PayloadAction<Partial<PackingDraft["product"]>>
    ) {
      state.draft.product = {
        ...state.draft.product,
        ...action.payload,
      };
    },

    setRawMaterialConsumption(
      state,
      action: PayloadAction<RawMaterialConsumptionPayload>
    ) {
      state.draft.rawMaterialConsumption = action.payload;
      state.draft.meta.lastUpdatedAt = new Date().toISOString();
    },
    setPackagingPlan(state, action: PayloadAction<PackagingPlanItem[]>) {
      state.draft.packagingPlan = action.payload;
    },

    setPackedStorageSummary(
      state,
      action: PayloadAction<PackedStorageSummary[]>
    ) {
      state.draft.packedStorageSummary = action.payload;
    },

    setFinalDraft(
      state,
      action: PayloadAction<PackingSubmitPayload>
    ) {
      state.draft.product = {
        productId: state.draft.product.productId ?? null,
        productName: action.payload.product.productName,
        productType: state.draft.product.productType ?? "single",
        finalRating: action.payload.product.finalRating,
        image: state.draft.product.image ?? null,
      };

      state.draft.rawMaterialConsumption = action.payload.rmConsumption;
      state.draft.packagingPlan = action.payload.packagingPlan;

      state.draft.validation = {
        rmVsPackedKgMatch: true,
        packetsVsKgMatch: true,
        hasErrors: false,
        blockingErrors: [],
      };

      state.draft.meta.status = "ready";
      state.draft.meta.lastUpdatedAt = new Date().toISOString();
    },

    setValidation(state, action: PayloadAction<PackingDraft["validation"]>) {
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
  setFinalDraft,
} = packingDraftSlice.actions;

export default packingDraftSlice.reducer;