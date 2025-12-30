import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PackageIconKey =
  | "paper-roll"
  | "bag"
  | "big-bag";

type PackageSizeProps = {
  disabled: boolean;
    quantity: string;
    id?: string;
    weight: string;
    iconKey: PackageIconKey;
}
type PackageSizeStateProps = {
  packages: PackageSizeProps,
  isEdit: boolean;
  isLoadingPackageSize: boolean;
}
const initialState: PackageSizeStateProps = {
  packages: {
    disabled: false,
    id: "",
    quantity: "",
    weight: "",
    iconKey: "paper-roll",
  },
  isEdit: false,
  isLoadingPackageSize: false,
}

const PackageSizeSlice = createSlice({
  name: "packageSize",
  initialState: initialState,
  reducers: {
    setPackageSize: (state, action: PayloadAction<PackageSizeProps>) => {
      state.packages = action.payload;
    },
    clearPackageSize: (state) => {
      state.packages = {
        disabled: false,
        quantity: "",
        id: "",
        weight: "",
        iconKey: "paper-roll",
      };
    },
    setIsPackageEdit: (state, action: PayloadAction<boolean>) => {
      state.isEdit = action.payload;
    },
    setIsLoadingPackageSize: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPackageSize = action.payload;
    },
  },
});

export const { setPackageSize, setIsPackageEdit, clearPackageSize, setIsLoadingPackageSize } = PackageSizeSlice.actions;
export default PackageSizeSlice.reducer;
