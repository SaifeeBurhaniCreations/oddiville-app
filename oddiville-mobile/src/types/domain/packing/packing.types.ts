// Common
export type UUID = string;
export type ISODate = string;

export type ContainerType = "bag" | "unit";

// Meta
export interface PackingDraftMeta {
  draftId: UUID;
  status: "draft" | "ready" | "submitted";
  startedAt: ISODate;
  lastUpdatedAt: ISODate;
}

// Product
export interface PackingProduct {
  productId: UUID | null;
  productName: string;
  productType: "single" | "mixed";
  finalRating: number;
  image: string | null;
}

// Raw Material
export interface RMChamberSource {
  chamberId: UUID;
  chamberName: string;

  containerType: ContainerType;
  containerSize: {
    value: number;
    unit: "kg" | "gm" | "unit";
  };

  containersUsed: number;
  quantityUsedKg: number;
}

export interface RawMaterialConsumption {
  rmId: UUID;
  rmName: string;
  rating: number;
  sourceChambers: RMChamberSource[];
}

// Packaging
export interface PacketSpec {
  size: number;
  unit: "gm" | "kg" | "unit";
  packetsPerBag: number;
}

export interface PackagingStorage {
  chamberId: UUID;
  chamberName: string;
  bagsStored: number;
}

export interface PackagingPlanItem {
  skuId: UUID;
  skuLabel: string;

  packet: PacketSpec;

  bagsProduced: number;
  totalPacketsProduced: number;

  storage: PackagingStorage[];
}

// Final Storage
export interface PackedStorageSummary {
  chamberId: UUID;
  chamberName: string;
  totalKgStored: number;
}

// Validation
export interface PackingValidationState {
  rmVsPackedKgMatch: boolean;
  packetsVsKgMatch: boolean;
  hasErrors: boolean;
  blockingErrors: string[];
}

// Root Draft
export interface PackingDraft {
  meta: PackingDraftMeta;
  product: PackingProduct;
  rawMaterialConsumption: RawMaterialConsumption[];
  packagingPlan: PackagingPlanItem[];
  packedStorageSummary: PackedStorageSummary[];
  validation: PackingValidationState;
}