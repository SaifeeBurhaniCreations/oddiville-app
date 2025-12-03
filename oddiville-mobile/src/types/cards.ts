import { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import { ViewStyle } from 'react-native'
import { ActivityProps, DetailsProps, OrderProps, PackagingDetailParam, SearchActivityProps, workAssignedMultiple } from "./ui";
import { IconProps } from "./icon";
import { BottomSheetSchemaKey } from "../schemas/BottomSheetSchema";
import { RootStackParamList } from "./navigation";
import { z } from "zod";

export const validButtons = [
  "Send alert to manager",
  "Shipped order",
  "Order raw material",
  "Create order",
  "Create Package",
] as const;

export const ButtonTypeSchema = z.enum(validButtons);

export const ButtonActionTypeSchema = z.enum([
  "alert-to-manager",
  "ship-order",
  "order-raw-material",
  "create-order",
  "package-comes-to-end",
]);

export const ActionButtonConfigSchema = z.object({
  text: ButtonTypeSchema,
  key: ButtonActionTypeSchema,
});

export const ActionButtonConfigArraySchema = z.array(ActionButtonConfigSchema);

export type ButtonType = z.infer<typeof ButtonTypeSchema>;
export type ButtonActionType = z.infer<typeof ButtonActionTypeSchema>;
export type ActionButtonConfig = z.infer<typeof ActionButtonConfigSchema>;

export interface ActivityCardProps {
  activity: ActivityProps;
  color: "red" | "green" | "blue" | "yellow";
  bgSvg: ComponentType<any>;
  onPress: (id: string, identifier: BottomSheetSchemaKey) => void;
}

export interface RecentActivityCardProps {
  activity: ActivityProps;
  color: "red" | "green" | "blue" | "yellow";
  bgSvg: ComponentType<any>;
}

export interface SearchActivityCardProps {
  activity: SearchActivityProps;
  color: "red" | "green" | "blue" | "yellow";
  bgSvg: ComponentType<any>;
  onPress: (id: string, identifier: BottomSheetSchemaKey) => void;
  style?: any;
}

export interface OrderReceiverDetailsCardProps {
  title: string,
  name: string,
  address: string,
    badge?: {
    text: string,
    icon: ReactNode
  };
  detail: {
    name: string,
    value: string,
    icon: ReactNode,
  },
  otherDetails: {
    name: string,
    value: string,
    icon: ReactNode,
  }[],
  helperDetails: {
    name: string,
    value: string,
    icon: ReactNode,
  }[],
}



export type RatingValue = 1 | 2 | 3 | 4 | 5

export interface RatingCardProps {
  children?: React.ReactNode
  active?: RatingValue | null
  onChange?: (rating: RatingValue) => void
  style?: ViewStyle
}

export interface RatingCardEntitiyProps {
  rating: RatingValue
  active?: boolean
  onPress?: () => void
}
export interface ProductionCardProps {
  productName: string,
  laneName: string,
  description: string,
  badgeText: string,
  laneNumber: number,
}

export interface ItemCardProps {
  id?: string;
  name: string;
  weight?: string;
  time?: string | null;
  lane?: string | null;
  rating?: string;
  onActionPress?: () => void;
  actionLabel?: string;
  disabled?: boolean;
  isProduction?: boolean;
  backgroundIcon?: ComponentType<any>;
  isActive?: boolean;
  style?: ViewStyle;
}


export interface ItemsFlatListProps {
  items: ItemCardProps[],
  isProduction?: boolean,
  onActionPress?: () => void,
}
  export interface SupervisorOrderCardProps {
    order: OrderProps,
    style?: any,
    color?: "red" | "green" | "blue" | "yellow";
    bgSvg?: ComponentType<any>;
    isEdit?: boolean;
  }
  export interface TruckCardProps {
    truck: OrderProps,
    color?: "red" | "green" | "blue" | "yellow";
    bgSvg?: ComponentType<any>;
    isEdit?: boolean;
  }

export interface RawMaterialStockCardProps {
  id: number;
  name: string;
  weightSentence: string;
  totalItem: number;
  image: string;
  status: "success" | "warning" | "danger";
  disabled: boolean;
  onPress?: () => void;
}
export interface ChamberEntry {
  id: string;
  quantity: string;
  rating: string;
}

export interface StockDataItem {
  id: string;
  product_name?: string;
  image?: string;
  category?: string;
  unit?: string;
  chamber?: ChamberEntry[];
}
export interface TruckWeightCardProps {
  title: string;
  description: string;
  truckWeight?: string;
  otherDescription?: string;
}
export interface PackageCardProps {
  name: string;
  id: string;
  href: keyof RootStackParamList;
  // params: PackagingDetailParam[]
  img: number;
  bundle: number;
  style?: ViewStyle;
}
export interface PackagingSizeCardProps {
  weight: string;
  quantity: string;
  disabled: boolean;
  icon: ComponentType<IconProps>;
  style?: ViewStyle;
  onPress?: () => void;
}

export interface multipleContractorProps {
  contractorName: string, 
    locations: { location: string, count: string }[],
}

export interface ContractorWorkLocationCardProps {
  workAssigned: {
    contractorName: string;
    male_count: string;
    female_count: string;
    locations: {
      location: string;
      enterCount: boolean;
      notNeeded: boolean;
      count: string;
      countMale?: string;
      countFemale?: string;
    }[];
  };
  setIsAddDisabled: Dispatch<SetStateAction<boolean>>;
  setworkerCount: Dispatch<SetStateAction<number>>;
  setWorkAssigned: Dispatch<SetStateAction<workAssignedMultiple[]>>;
  contractorIndex: number;
  isFirst?: boolean;
  isOpen: boolean;
  columns: { label: string; key: string }[];
  onPress: () => void;
  handleRadioChange: (contractorIndex: number, locationIndex: number, field: "enterCount" | "notNeeded") => void
  handleInputChange: (contractorIndex: number, locationIndex: number, field: "male" | "female", value: string) => void;
  maleCount?: string;
  femaleCount?: string;
  onMaleChange?: (text: string) => void;
  onFemaleChange?: (text: string) => void;
}
