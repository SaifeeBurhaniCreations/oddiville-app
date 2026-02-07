import { ExportType } from "@/src/constants/exportFilterComponents";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RangeType =
    | "today"
    | "yesterday"
    | "this_week"
    | "last_week"
    | "this_month"
    | "last_month"
    | "custom";

interface ExportState {
  type: ExportType | null;

  range: RangeType;
  from: string | null;
  to: string | null;

  chamberIds: string[];

  lanes: string[];
  status: string[];

  vendors: string[];
  materials: string[];

  previewCount: number;
  loading: boolean;
}

const initialState: ExportState = {
  type: null,

  range: "today",
  from: null,
  to: null,

  chamberIds: [],

  lanes: [],
  status: [],

  vendors: [],
  materials: [],

  previewCount: 0,
  loading: false,
};

const exportSlice = createSlice({
    name: "export",
    initialState,
    reducers: {
        /* ===== core ===== */

        setType(state, action: PayloadAction<ExportType>) {
            state.type = action.payload;

            // reset filters when type changes
            state.chamberIds = [];
            state.lanes = [];
            state.status = [];
            state.vendors = [];
            state.materials = [];
        },

        setRange(state, action: PayloadAction<RangeType>) {
            state.range = action.payload;
        },

        setCustomDates(state, action: PayloadAction<{ from: string; to: string }>) {
            state.from = action.payload.from;
            state.to = action.payload.to;
        },

        /* ===== chamber ===== */

        setChambers(state, action: PayloadAction<string[]>) {
            state.chamberIds = action.payload;
        },

        /* ===== production ===== */

        setLanes(state, action: PayloadAction<string[]>) {
            state.lanes = action.payload;
        },

        setStatus(state, action: PayloadAction<string[]>) {
            state.status = action.payload;
        },

        /* ===== raw ===== */

        setVendors(state, action: PayloadAction<string[]>) {
            state.vendors = action.payload;
        },

        setMaterials(state, action: PayloadAction<string[]>) {
            state.materials = action.payload;
        },

        /* ===== meta ===== */

        setPreviewCount(state, action: PayloadAction<number>) {
            state.previewCount = action.payload;
        },

        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },

        resetExport() {
            return initialState;
        },
    },
});

export const {
    setType,
    setRange,
    setCustomDates,
    setChambers,
    setLanes,
    setStatus,
    setVendors,
    setMaterials,
    setPreviewCount,
    setLoading,
    resetExport,
} = exportSlice.actions;

export default exportSlice.reducer;