import * as Crypto from 'expo-crypto';
import { PackingDraft } from "@/src/types/domain/packing/packing.types";

export const createEmptyPackingDraft = (): PackingDraft => ({
  meta: {
    draftId: Crypto.randomUUID(),
    status: "draft",
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  },

  product: {
    productId: null,
    productName: "",
    productType: "single",
    finalRating: 5,
    image: null,
  },

  rawMaterialConsumption: [],
  packagingPlan: [],
  packedStorageSummary: [],

  validation: {
    rmVsPackedKgMatch: true,
    packetsVsKgMatch: true,
    hasErrors: false,
    blockingErrors: [],
  },
});