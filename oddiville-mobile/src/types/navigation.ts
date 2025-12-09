import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dispatch } from "@reduxjs/toolkit";
import { ComponentType } from "react";
import { RawMaterialDetailByRatingProps } from "./ui";
import { CalendarEventResponse } from "../hooks/calendar";

import { z } from "zod";

const RawMaterialChamberSchema = z.object({
  id: z.string(),
  quantity: z.string(),
  rating: z.string(),
});

const RawMaterialDetailByRatingPropsSchema = z.any();
const CalendarEventResponseSchema = z.any();

export const RootStackParamListSchema = z.object({
  "home": z.undefined(),
  "purchase": z.undefined(),
  "admin-orders": z.undefined(),
  "admin-chambers": z.undefined(),
  "admin-production": z.undefined(),

  "supervisor-raw-material": z.undefined(),
  "supervisor-orders": z.undefined(),
  "supervisor-production": z.undefined(),
  "supervisor-contractor": z.undefined(),

  login: z.undefined(),
  searchResults: z.object({
    query: z.string(),
  }),

  "raw-material-overview": z.object({
    rmId: z.string(),
  }),

  "raw-material-detail": z.object({
    data: z.object({
      id: z.string(),
      description: z.string(),
      name: z.string(),
      rating: z.string(),
      chambers: z.array(RawMaterialChamberSchema),
      quantity: z.string(),
      image: z.string(),
      detailByRating: z.array(RawMaterialDetailByRatingPropsSchema),
    }),
    source: z.enum(["chamber", "raw_material"]),
  }),

  "raw-material-order": z.undefined(),

  vendors: z.undefined(),
  "vendor-create": z.object({
    userId: z.string(),
  }),
  "vendor-orders": z.object({
    userId: z.string(),
  }),
  "vendor-order-detail": z.object({
    orderId: z.string(),
  }),

  calendar: z.undefined(),
  "calendar-event-detail": z.object({
    date: z.string(),
    scheduledDates: z.array(CalendarEventResponseSchema),
  }),

  packaging: z.undefined(),
  "packaging-details": z.object({
    id: z.string(),
    name: z.string(),
  }),

  user: z.undefined(),
  "user-form": z.object({
    userId: z.string(),
  }),

  trucks: z.undefined(),
  "truck-create": z.object({
    id: z.string().optional(),
  }),
  "truck-detail": z.object({
    id: z.string(),
  }),

  "create-orders": z.undefined(),
  "completed-order-detail": z.object({
    orderId: z.string(),
  }),
  "dispatch-summary": z.object({
    orderId: z.string(),
  }),
  "shipping-details": z.object({
    orderId: z.string(),
  }),

  "supervisor-rm-details": z.object({
    rmId: z.string(),
  }),
  "supervisor-product-details": z.object({
    id: z.string(),
  }),
  "supervisor-production-details": z.object({
    id: z.string(),
  }),
  "supervisor-contractor-details": z.object({
    wId: z.string(),
    mode: z.enum(["single", "multiple"]),
  }),
});

// export type RootStackParamList = z.infer<typeof RootStackParamListSchema>;

export type RootStackParamList = {
  "home": undefined;
  "purchase": undefined;
  "production": undefined;
  "package": undefined;
  "sales": undefined;

  "chambers": undefined;

  "raw-material-receive": { rmId: string };
  "raw-material-overview": { rmId: string };
  "raw-material-order": undefined;
  
  "production-start": { id: string };
  "production-complete": { id: string };
  "lane": undefined;

  login: undefined;

  packaging: undefined;
  "packaging-details": { id: string; name: string };

  "policies/purchase": undefined;
  "policies/production": undefined;
  "policies/package": undefined;
  "policies/sales": undefined;

  "labours": undefined;
  "labours-details": { wId: string; mode: "single" | "multiple" };


   vendors: undefined;
  "vendor-create": { userId: string };
  "vendor-orders": { userId: string };
  "vendor-order-detail": { orderId: string };

  calendar: undefined;
  "calendar-event-detail": {
    date: string;
    scheduledEvents: string;
    // scheduledEvents: CalendarEventResponse[];
  };

  user: undefined;
  "user-form": { username: string };

  trucks: undefined;
  "truck-create": { id?: string };
  "truck-detail": { id: string };

  "create-orders": undefined;

  "search-results": { query: string };

  "supervisor-raw-material": undefined;
  "supervisor-orders": undefined;
  "supervisor-production": undefined;
  "supervisor-contractor": undefined;


  "raw-material-detail": {
    data: {
      id: string;
      description: string;
      name: string;
      rating: string;
      chambers: { id: string; quantity: string; rating: string }[];
      quantity: string;
      image: string;
      detailByRating: RawMaterialDetailByRatingProps[];
    };
    source: "chamber" | "raw_material";
  };

  "completed-order-detail": { orderId: string };
  "dispatch-summary": { orderId: string };
  "shipping-details": { orderId: string };


  "other-products-detail": {
    data: string;
  };
  // "other-products-detail": {
  //   data: {
  //     id: string;
  //     category: string;
  //     product_name: string;
  //     name: string;
  //     company : string;
  //     chambers: { id: string; quantity: string; rating: string }[];
  //   };
  // };
};

// export type RootStackParamList = {
//     Main: { screen?: string }; 
//     Screens: undefined;
//     SearchResults: { query: string };
//     Login: undefined;
//     OthersProductsDetail: { data: OtherItemsProps };
//     //------Dispatch Orders-------------
//     Orders: undefined;
//     DispatchSummary: { orderId: string }
//     ShippingDetails: { orderId: string }
//     //------Dispatch Orders-------------
//     CreateOrders: undefined;
//     Warehouse: undefined;
//     OnBoarding: undefined;
//     OnBoardingDetail: undefined;
//     User: undefined;
//     UserDetails: undefined;
//     EditUser: { userId: string };
//     UnAuthorized: undefined;
//     WarehouseManagement: undefined;
//     RawMaterial: { rmId: string };
//     RawMaterialOrder: undefined;
//     RawMaterialDetail: { data: { id: string, description: string, name: string, rating: string, chambers: { id: string; quantity: string; rating: string; }[], quantity: string, image: string, detailByRating: RawMaterialDetailByRatingProps[] }, source: "chamber" | "raw_material" };
//     WarehouseManagementRawMaterial: { warehouseId: string };
//     // ----------------------------------------------
//     SuperRawMaterial : undefined;
//     SuperOrder : undefined;
//     SuperProduction : { id: string };
//     SupervisorProductionDetails : { id: string };
//     SupervisorProductDetails : { id: string };
//     SupervisorWorkerDetails : { wId: string, mode: "single" | "multiple" };
//     SupervisorRmDetails : { rmId: string };
//     Chamber: undefined;
//     // ----------------------Common------------------------
//     HelpSupport: undefined;
//     Packaging: undefined;
//     PackagingDetails: { id: string, name: string };
//     // ----------------------Vendors------------------------
//     Vendors: undefined;
//     VendorOrders: { userId: string };
//     VendorCreate: { userId: string };
//     VendorOrderDetail: {orderId: string};
//     // ----------------------Vendors------------------------
//     Trucks: undefined;
//     TruckCreate: { id?: string };
//     TruckDetail: {id: string};
//     // ----------------------Vendors------------------------
//     Calendar: { id?: string };
//     CalendarEvents: undefined;
//     CalendarEventDetail: { date: string };
// };

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


export interface BottomBarItem {
    name: string;
    component: string;
    icon: ComponentType;
    activeIcon: ComponentType;
}

export type BottomBarProps = BottomBarItem[]; 

export type ToggleMenuProps = {
    isOpen: boolean;
    dispatch: Dispatch;
};

export interface MainIntialTabProps {
    initialTab: "Home" | "Orders" | "Chamber" | "Production" | "SuperRawMaterial" | "SuperOrder" | "SuperProduction" | "SuperContractor";
}
