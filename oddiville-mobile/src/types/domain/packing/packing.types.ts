// Common
export type UUID = string;
export type ISODate = string;

export type ContainerType = "bag" | "box";

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
  rawMaterialConsumption: RawMaterialConsumptionPayload;
  packagingPlan: PackagingPlanItem[];
  packedStorageSummary: PackedStorageSummary[];
  validation: PackingValidationState;
}


export type PackageInputState = {
  bagCount?: number | undefined;
  packetsPerBag?: number | undefined;

  chambers?: Record<string, number>;
};

// inputs for ALL packages in a chamber
export type PackageInputsByKey = Record<string, PackageInputState>

// inputs for ALL chambers
export type PackageFormState = Record<string, PackageInputsByKey>

export type PacketsAvailableInput = {
  size: number;
  unit: "gm" | "kg";
  storedKg: number;
};

export type PackingChamberOption = {
    chamberId: string;
    chamberName: string;

    maxBags: number;     
    availableKg: number;   

    assignedBags: number;  
};

export type PackagingPlanValidation = {
  skuId: string;
  skuLabel: string;
  bagsProduced: number;
  bagsAssigned: number;
  isValid: boolean;
  error?: string;
};

export type RawMaterialConsumptionPayload = {
  [rmName: string]: {
    [chamberId: string]: {
      outer_used: number;
      rating: number;
    };
  };
};

// Dispatch page
export interface PackingPackages {
  size: number;
  unit: "kg" | "gm" | "unit";
  count: number;
}
export interface DispatchPackagingChambers {
  chamberName: string;
  packages: PackingPackages[];
}
