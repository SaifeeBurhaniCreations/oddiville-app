import { configureStore } from '@reduxjs/toolkit';

import adminReducer from "./slices/admin.slice";
import AllVendorReducer from './slices/vendor.slice';
import BottomSheetButtonHandler from './slices/bottomsheet-button-handler.slice';
import bottomSheetReducer from "./slices/bottomsheet.slice";
import chamberReducer from "./slices/chamber.slice";
import DispatchOrdersReducer from './slices/dispatch-orders.slice';
import fabReducer from "./slices/fab.Slice";
import fillPackageReducer from "./slices/fill-package.slice";
import idStoreReducer from './slices/bottomsheet/store-productId.slice';
import LocationReducer from './slices/bottomsheet/location.slice';
import menuSheetReducer from "./slices/menusheet.slice";
import PackageSizePackagingReducer from './slices/package-size.slice';
import PackageSizeReducer from './slices/bottomsheet/package-size.slice';
import ProductReducer from './slices/product.slice';
import CurrentProductReducer from './slices/current-product.slice';
import RatingReducer from './slices/rating.slice';
import RawMaterialReducer from './slices/bottomsheet/raw-material.slice';
import SelectIconReducer from "./slices/select-icon.slice";
import selectUnitReducer from './slices/unit-select.slice';
import StoreProductReducer from './slices/store-product.slice';
import VendorReducer from './slices/bottomsheet/vendor.slice';
import chamberRatingsReducer from './slices/bottomsheet/chamber-ratings.slice';
import changeViewReducer from './slices/change-view.slice';
import productionReducer from './slices/production.slice';
import productionBeginsReducer from './slices/production-begin.slice';
import filterReducer from './slices/bottomsheet/filters.slice';
import currentTabReducer from './slices/currentCalendarTab.slice';
import selectRoleReducer from "./slices/select-role";
import productPackageChambersReducer from "./slices/bottomsheet/product-package-chamber.slice";
import rawMaterialSearchReducer from "./slices/bottomsheet/rawMaterialSearch.slice";
import productSearchReducer from "./slices/bottomsheet/product-search.slice";
import packageSizeSearchReducer from "./slices/bottomsheet/package-size-search.slice";
import deleteUserPopupReducer from "./slices/delete-popup-slice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    allvendor: AllVendorReducer,
    bottomSheet: bottomSheetReducer,
    bottomSheetButtonHandler: BottomSheetButtonHandler,
    chamber: chamberReducer,
    chamberRatings: chamberRatingsReducer,
    dispatchOrder: DispatchOrdersReducer,
    fab: fabReducer,
    fillPackage: fillPackageReducer,
    idStore: idStoreReducer,
    location: LocationReducer,
    menu: menuSheetReducer,
    packageSize: PackageSizeReducer,
    packageSizePackaging: PackageSizePackagingReducer,
    product: ProductReducer,
    currentProduct: CurrentProductReducer,
    rating: RatingReducer,
    rawMaterial: RawMaterialReducer,
    selectIcon: SelectIconReducer,
    selectUnit: selectUnitReducer,
    storeProduct: StoreProductReducer,
    vendor: VendorReducer,
    changeView: changeViewReducer,
    production: productionReducer,
    productionBegins: productionBeginsReducer,
    filter: filterReducer,
    currentTab: currentTabReducer,
    selectRole: selectRoleReducer,
    productPackageChamber: productPackageChambersReducer,
    rawMaterialSearch: rawMaterialSearchReducer,
    productSearch: productSearchReducer,
    packageSizeSearch: packageSizeSearchReducer,
    deletePopup: deleteUserPopupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;