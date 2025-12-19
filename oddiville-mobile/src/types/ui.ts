import { ComponentType, ElementType, ReactNode } from "react";
import {
  ImageSourcePropType,
  ImageResizeMode,
  TextInputProps,
  ViewStyle,
} from "react-native";
import {
  ActionButtonConfig,
  ActionButtonConfigSchema,
  ButtonType,
} from "./cards";
import { IconProps, IconRatingProps } from "./icon";
import { RootStackParamList, RootStackParamListSchema } from "./navigation";
import {
  BottomSheetSchemaKey,
  bottomSheetSchemas,
} from "../schemas/BottomSheetSchema";
import { z } from "zod";
import { TextInput } from "react-native";
import { DispatchOrderData } from "../hooks/dispatchOrder";

export interface TagProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "red" | "green" | "blue" | "yellow";
  children: ReactNode;
  icon?: ReactNode;
  style?: any;
}

export interface FabProps {
  position: "left" | "right";
  color: "red" | "green" | "blue" | "yellow";
}
export interface FebItemsProps {
  text: string;
  href: keyof RootStackParamList;
  icon: ComponentType<IconProps>;
}

// export interface ChipProps {
//     children: ReactNode;
//     color: "red" | "green" | "blue" | "yellow";
//     icon?: ComponentType<{ color?: string; size?: number }>;
//     active?: boolean
//     style?: any
// }

export interface ButtonProps {
  children: ReactNode;
  variant?: "outline" | "fill" | "ghost" | "invalid";
  color?: "red" | "green" | "blue" | "yellow" | "light";
  full?: boolean;
  half?: boolean;
  style?: any;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  disabled?: boolean;
  onPress?: () => void | Promise<void>;
  onPressIn?: () => void | Promise<void>;
  onPressOut?: () => void | Promise<void>;
  preIcon?: React.ReactNode;
  postIcon?: React.ReactNode;
}

export interface LinkButtonProps {
  children: ReactNode;
  color?: "red" | "green" | "blue" | "yellow" | "light";
  style?: any;
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  disabled?: boolean;
  onPress?: () => void | Promise<void>;
}

export interface CtaButtonProps {
  children?: ReactNode;
  color?: "red" | "green" | "blue" | "yellow";
  full?: boolean;
  disabled?: boolean;
  onPress?: () => void | Promise<void>;
}
export interface ActionButtonProps {
  children?: ReactNode;
  variant?: "default" | "outline";
  icon: ComponentType<IconProps>;
  onPress?: () => void | Promise<void>;
  btnSize?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
  disabled?: boolean;
  style?: any;
}

export interface CustomImageProps {
  src: ImageSourcePropType | string;
  width?: number | `${number}%` | "auto";
  height?: number | `${number}%` | "auto";
  style?: object;
  borderRadius?: number;
  resizeMode?: ImageResizeMode;
  fallback?: ImageSourcePropType;
  loadingIndicator?: boolean;
}

export interface TitleDescriptionProps {
  title: string;
  description: string;
}

export interface EmptyStateProps {
  stateData: TitleDescriptionProps;
  color?: "red" | "green" | "blue" | "yellow";
  image?: string | ImageSourcePropType;
  style?: any;
  button?: {
    text: string;
    href: keyof RootStackParamList;
  };
}

export interface workAssignedMultiple {
  contractorName: string;
  male_count: string;
  female_count: string;
  locations: {
    location: any;
    notNeeded: boolean;
    enterCount: boolean;
    count: string;
    countMale?: string;
    countFemale?: string;
  }[];
}

const DetailsPropsSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  icon: z.any(),
});

export type DetailsProps = z.infer<typeof DetailsPropsSchema>;

export const BottomSheetSchemaKeyEnum = z.enum(
  Object.keys(bottomSheetSchemas) as [keyof typeof bottomSheetSchemas]
);

const SupervisorCardDetailsSchema = z.object({
  name: z.string().optional(),
  value: z.union([z.string(), z.number()]),
  icon: z.any(),
});

export type SupervisorCardDetailsProps = z.infer<
  typeof SupervisorCardDetailsSchema
>;

export const ActivityPropsSchema = z.object({
  id: z.string(),
  title: z.string(),
  dateDifference: z.string().optional(),
  description: z.string().optional(),
  read: z.boolean().optional(),
  extraData: z.record(z.any()).optional(),
  type: z.string().optional(),
  sideDetails: DetailsPropsSchema.optional(),
  dateDescription: z.string().optional(),
  bottomDetails: z.array(DetailsPropsSchema).optional(),
  badgeText: z.string().optional(),
  createdAt: z.date().optional(),
  extra_details: z.array(z.string()),
  buttons: z.array(ActionButtonConfigSchema).optional(),
  href: RootStackParamListSchema.optional(),
  identifier: BottomSheetSchemaKeyEnum.nullable(),
  dispatchDetails: z.array(SupervisorCardDetailsSchema).optional(),
  params: z.any().optional(),

  //   not confirm
  data: z.any().optional(),
});

// export type ActivityProps = z.infer<typeof ActivityPropsSchema>;

// export const activityPropsTypeMap: { [x: string]: PrimitiveType | null | undefined } = schemaToTypeMap(ActivityPropsSchema);

export interface ActivityProps {
  id: string;
  itemId: string;
  title: string;
  dateDifference?: string;
  description?: string;
  read?: boolean;
  extraData?: Record<string, any>;
  type?: string;
  sideDetails?: DetailsProps;
  dateDescription?: string;
  bottomDetails?: DetailsProps[];
  badgeText?: string;
  createdAt?: Date;
  extra_details: string[];
  buttons?: ActionButtonConfig[];
  href?: keyof RootStackParamList;
  identifier: BottomSheetSchemaKey | null;
  dispatchDetails?: SupervisorCardDetailsProps[];
  metaData?: any;
  params?: any;
  category?: "informative" | "actionable" | "today";
}

export interface SearchActivityProps {
  id: string;
  itemId: string;
  title: string;
  read?: boolean;
  extraData?: Record<string, any>;
  type?: string;
  dateDescription?: string;
  badgeText?: string;
  createdAt?: Date;
  extra_details: string[];
  buttons?: ActionButtonConfig[];
  href?: keyof RootStackParamList;
  identifier: BottomSheetSchemaKey | null;
  params?: any;
}

// export interface SupervisorCardDetailsProps {
//     name?: string;
//     value: string;
//     icon: ReactNode;
// }

// export interface DetailsProps {
//     name: string;
//     value: string | number;
//     icon: ReactNode;
// }

export interface OrderProps {
  id?: string;
  title: string;
  name?: string;
  dateDifference?: string;
  sepratorDetails?: DetailsProps[];
  description?: DetailsProps[] | string;
  isImage?: boolean | string;
  details?: SupervisorCardDetailsProps[];
  buttons?: ButtonType[];
  address?: string;
  rating?: number;
  href?: keyof RootStackParamList;
  helperDetails?: SupervisorCardDetailsProps[];
  dispatchDetails?: SupervisorCardDetailsProps[];
  identifier?: BottomSheetSchemaKey | undefined;
  sideIcon?: ReactNode;
}

export interface OrderReceiverFlatListProps {
  orders: OrderProps[];
  isEdit?: boolean;
}

export interface UserProps {
  color?: "red" | "green" | "blue" | "yellow";
  name: string;
  profileImg?: string | number;
  extra_details: string;
  role?: "superadmin" | "admin" | "supervisor";
  policies?: string[];
  label?: string;
  id?: string;
  username?: string;
  access?: string[];
  disabled?: boolean;
  isShowAccess?: boolean;
  icon?: ComponentType<IconProps>;
  roleDefination?: string;
  roleDefinition?: string;
  bottomConfig?: TitleDescriptionProps;
  href?: keyof RootStackParamList;
  cardref?: keyof RootStackParamList;
  onPress?: () => void;
  onActionPress?: (username: string) => void;

  tempDisabled?: boolean;
}
export interface TruckProps {
  color?: "red" | "green" | "blue" | "yellow";
  name: string;
  profileImg?: number | string;
  bgSvg?: ComponentType<IconProps>;
  arrival_date?: Date;
  extra_details: string;
  label?: string;
  badgeText?: string;
  id?: string;
  disabled?: boolean;
  icon?: ComponentType<IconProps>;
  roleDefination?: string;
  bottomConfig?: TitleDescriptionProps;
  href?: keyof RootStackParamList;
  cardref?: keyof RootStackParamList;
}
export interface UsersFlatList {
  users: UserProps[];
  status?: "default" | "success" | "error";
  manualErrorMessage?: string;
  tooltipText?: TitleDescriptionProps;
  showTooltip?: boolean;
  onIconPress?: () => void;
  inputStyle?: any;
}

export interface TabsProps {
  tabTitles?: (string | ReactNode)[];
  children: ReactNode;
  setCurrentTab?: number;
  color?: "red" | "green" | "blue" | "yellow";
  style?: any;
  headerStyle?: any;
  variant?: "default" | "ghost";
  renderTabHeader?: (props: {
    activeTab: number;
    setActiveTab: (i: number) => void;
  }) => ReactNode;
}

export interface TabButtonProps {
  title: ReactNode;
  isActive: boolean;
  onPress: () => void;
  color: "red" | "green" | "blue" | "yellow";
  variant?: "default" | "ghost";
}

export interface InputProps {
  onChangeText: any;
  onBlur?: any;
  children?: ReactNode;
  placeholder?: string;
  value: string;
  color?: "red" | "blue" | "green" | "yellow";
  icon?: ReactNode;
  post?: boolean;
  mask?: "none" | "date" | "addon" | "textarea" | "time";
  addonText?: string;
  error?: any;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  maxLength?: number;
  status?: "default" | "success" | "error";
  manualErrorMessage?: string;
  tooltipText?: TitleDescriptionProps;
  showTooltip?: boolean;
  onIconPress?: () => void;
  inputStyle?: any;
  style?: any;
  disabled?: boolean;
  wrapperStyle?: any;
}

export interface loaderProps {
  size?: number;
  strokeWidth?: number;
  color?: "red" | "blue" | "green" | "yellow";
  style?: any;
  withOverlay?: boolean;
}
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (status: "checked" | "unchecked") => void;
  shouldBePending?: () => boolean;
  children?: React.ReactNode;
}

export interface WarehouseCardProps {
  name: string;
  image: number;
  label: string;
  icon: ComponentType<IconProps>;
  items: string[];
  address?: string;
  withCardStyle?: boolean;
  isChecked?: boolean;
  onPress?: () => void;
}

export interface WarehouseFlatListProps {
  warehouses: WarehouseCardProps[];
  isVirtualised?: boolean;
}
export interface ExtendedWarehouseFlatListProps extends WarehouseFlatListProps {
  isVirtualized?: boolean;
}
export interface WarehouseItemCardProps {
  name: string;
  description: string;
  rating: {
    text: number;
    icon: ElementType;
  };
  image: number;
  identifier: BottomSheetSchemaKey;
}

export interface WarehouseItemFlatListProps {
  warehouseItems: WarehouseItemCardProps[];
  isVirtualised?: boolean;
}

export interface RawMaterialDetailByRatingProps {
  rating: string;
  quantity?: string;
}

export interface RawMaterialProps {
  id: string;
  name: string;
  image?: string | number;
  description?: string;
  detailByRating: RawMaterialDetailByRatingProps[];
  rating: string;
  color?: "red" | "blue" | "green" | "yellow";
  category: "other" | "material" | "packed";
  quantity?: string;
  href?: keyof RootStackParamList;
  disabled?: boolean;
  chambers: { id: string; quantity: string; rating: string }[];
}

export interface SwitchProps {
  isChecked?: boolean;
  children?: ReactNode;
  post?: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface ChipsProps {
  children: ReactNode;
  textSize?: "sm" | "md";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  isClickable?: boolean;
  isActive?: boolean;
  dismisible?: boolean;
  onPress?: () => void;
  onDismiss?: (index: number) => void;
  index?: number;
  icon?: ReactNode;
  active?: boolean;
}
export interface ChipGroupProps {
  children?: ReactNode;
  data?: any[];
  type?: "default" | "radio";
  size?: "md" | "sm";
  isMultiple?: boolean;
  isActive?: boolean;
  dismisible?: boolean;
  isClickable?: boolean;
  blockSelection?: boolean;
  style?: any;
  onDismiss?: (index: number) => void;
  onPress?: () => void;
}

type RawMaterialFieldNames = "rawMaterial" | "vendor";

export interface SelectProps {
  options?: string[];
  value?: string;
  error?: string;
  disabled?: boolean;
  showOptions?: boolean;
  onPress?: () => void;
  style?: any;
  selectStyle?: any;
  children?: ReactNode;
  isVirtualised?: boolean;
  defaultDropdown?: boolean;
  onSelect?: () => void;
  preIcon?: ComponentType<IconRatingProps>;
}

export interface VendorProductProps {
  title: string;
  weight: string;
  vendors: VendorWithPriceInputProps[];
}

export interface VendorWithPriceInputProps {
  name: string;
  price: string;
  qty: string;
}

export interface ProductWithPriceInputProps {
  name: string;
  weight: string;
}

type ModalButton = {
  label: string;
  action?: () => void;
  variant?: "fill" | "outline";
  color?: "red" | "green" | "blue" | "yellow";
};

export interface ModalProps {
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  modalData: {
    title?: string;
    description?: string;
    type?: "danger" | "success" | "info" | "warning" | "plain";
    buttons: ModalButton[];
    extraDetails?: ReactNode;
  };
  markdown?: {
    title?: string[];
    description?: string[];
  };
}

export interface FileUploadGalleryProps {
  children?: ReactNode;
  fileStates: [
    capturePhotos: string[],
    setcapturePhotos: React.Dispatch<React.SetStateAction<string[]>>
  ];
  existingStates: [
    existingPhotos: string[],
    setexistingPhotos: React.Dispatch<React.SetStateAction<string[]>>
  ];
  maxImage?: number;
}

export type TableRow = Record<string, any>;

export interface TableColumn {
  label: string;
  key: string;
}

export interface TableProps {
  columns: TableColumn[];
  content: TableRow[];
  mergableRows?: [number, number][];
  children?: ReactNode;
  color?: "red" | "blue" | "green" | "yellow";
  style?: ViewStyle;
  onRadioChange?: (rowIndex: number, field: "enterCount" | "notNeeded") => void;
  onInputChange?: (
    rowIndex: number,
    field: "male" | "female",
    value: string
  ) => void;
}

export interface BackButtonProps {
  label: string;
  backParams?: any;
  backRoute?: keyof RootStackParamList;
  style?: any;
  onPress?: () => void;
}

export interface PriceInputProps {
  placeholder: string;
  editable?: boolean;
  children?: ReactNode;
  value: string;
  error?: string;
  addonText: string;
  onChangeText: (qty: string) => void;
  onBlur?: React.ComponentProps<typeof TextInput>['onBlur'];
  style?: any;
}

export interface VendorOrder {
  id: string;
  raw_material_name: string;
  order_date: Date;
  arrival_date: Date;
  est_arrival_date: Date;
  quantity: number;
  unit: string;
  price: number;
  truck_detail: {
    gross_weight: number;
    tare_weight: number;
    net_weight: number;
  };
}

export interface Vendor {
  id: string;
  name: string;
  alias?: string;
  phone: string;
  state: string;
  city: string;
  zipcode: string;
  address: string;
  materials: string[];
  orders: VendorOrder[];
}

export type UnparsedVendor = Omit<Vendor, "orders"> & {
  orders: (Omit<
    Vendor["orders"][0],
    "order_date" | "arrival_date" | "est_arrival_date"
  > & {
    arrival_date: string | null;
    est_arrival_date: string | null;
    order_date: string | null;
  })[];
};
export interface VendorInputState {
  id: string;
  name: string;
  price: number | string;
  quantity: number | string;
}

export interface Chamber {
  id: string;
  name: string;
  quantity: string; // e.g., "1000"
  unit: "kg" | "gm" | "qn" | null;
}

export interface PackageItem {
  quantity?: string;
  size: string | number;
  rawSize: string;
  unit: "kg" | "gm" | "qn" | null;

  stored_quantity?: number | string | null;
  rawUnit?: string | null;
}

export interface ProductDetail {
  id: string;
  image?: string;
  name: string;
  unit: "kg";
  price: string; // e.g., "2"
  chambers: Chamber[];
  packages: PackageItem[];
}
export interface PackageItemProp {
  id: string;
  name: string;
  img?: string;
  bundle?: string;
  params?: PackagingDetailParam[];
  href?: keyof RootStackParamList;
}

// 🚚 Truck Details Info
export interface TruckDetails {
  agency_name: string;
  driver_name: string;
  phone: string;
  type: string;
  number: string;
  challan: string;
  truck_number?: number;
  truck_weight?: number | string;
  tare_weight?: number | string;
}
export interface PackagingDetailParam {
  weight: string;
  quantity: string;
  icon: React.ComponentType<IconProps>;
  disabled: boolean;
}

export interface SummaryItem {
  message: string;
  reason?: string;
  date: string;
  icon: React.ReactNode;
}

// 📦 Full Dispatch Order
// export interface DispatchOrder {
//   id: string;
//   status: "pending" | "dispatched" | "completed" | "in-progress";
//   customer_name: string;
//   address: string;
//   total_quantity: string; // e.g., "4"
//   unit: "Ton" | "ton";
//   amount: string;
//   createdAt?: Date;
//   dispatch_date: Date;
//   est_delivered_date: Date;
//   delivered_date: Date | null;
//   packages: PackageItem[];
//   products: ProductDetail[];
//   truck_details: TruckDetails | null;
// }

// 📦 Array of Orders
export type DispatchOrder = DispatchOrderData;
export type DispatchOrderList = DispatchOrder[];

// 🧾 Unparsed Orders (e.g., from JSON with date strings)
export type UnparsedDispatchOrders = Omit<
  DispatchOrder,
  "dispatch_date" | "delivered_date" | "est_delivered_date"
> & {
  dispatch_date: string | null;
  delivered_date: string | null;
  est_delivered_date: string | null;
};

export type Lane = {
  productName: string;
  description: string;
  badgeText: string;
};

export type NotificationDotProps = {
  children: ReactNode;
  isRead: boolean;
};
export type chamberProps = {
  id: string;
  quantity: string;
  rating: string;
};
export type OtherItemsProps = {
  category: "other" | "material";
  id: string;
  chambers: chamberProps[];
  product_name: string;
  company: string;
  unit?: string;
};

interface ChamberEntry {
  id: string;
  quantity: string;
  rating: string;
}

export interface StockItem {
  id: string;
  product_name: string;
  unit: string;
  category: "other" | "material";
  chamber?: ChamberEntry[];
}

export interface ChamberData {
  id: string;
  chamber_name: string;
  capacity: number;
  items: string[];
  tag: "frozen" | "dry";
}

export interface OtherClientHistory {
  id: string;
  product_id: string;
  chamber_id: string;
  deduct_quantity: number;
  remaining_quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProductProps {
  wastage_quantity: number;
  end_time: Date;
  chambers: {
    id: string;
    quantity: number;
    rating: string;
  }[];
}

export type CountryProps = {
  label: string;
  isoCode: string;
  icon: string;
};

export type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  // participants?: Array<{ avatar: string; name: string }>;
  message?: string;
  scheduled_date?: string;
};

export interface RawMaterialOrderProps {
  id: string;
  production_id?: string | null;
  rating?: number | null;
  raw_material_name: string;
  vendor?: string | null | undefined;
  status: "completed" | "pending" | "in-progress";
  truck_details?: TruckDetails | null;
  sample_image?: any;
  sample_quantity?: string | number | null;
  quantity_ordered?: string | number | null;
  quantity_received?: string | number | null;
  warehoused_date?: string | null;
  unit?: string | null;
  price?: string | number | null;
  order_date?: string | null;
  store_date?: string | null;
  est_arrival_date?: string | null;
  arrival_date?: string | null;
  createdAt: string;
  updatedAt: string;
}
