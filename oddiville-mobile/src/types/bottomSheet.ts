import HeaderComponent from "@/src/components/ui/bottom-sheet/HeaderComponent";
import TitleWithTagComponent from "@/src/components/ui/bottom-sheet/TitleWithTagComponent";
import AddressComponent from "@/src/components/ui/bottom-sheet/AddressComponent";
import ManageActionComponent from "@/src/components/ui/bottom-sheet/ManageUser/ManageActionComponent";
import TitleWithCheckboxComponent from "@/src/components/ui/bottom-sheet/TitleWithCheckboxComponent";
import InputComponent from "@/src/components/ui/bottom-sheet/InputComponent";
import SearchComponent from "@/src/components/ui/bottom-sheet/SearchComponent";
import SearchWithFilterComponent from "@/src/components/ui/bottom-sheet/RawMaterial/SearchWithFilterComponent";
import TitleCheckCountComponent from "@/src/components/ui/bottom-sheet/RawMaterial/TitleCheckCountComponent";
import VendorCardComponent from "@/src/components/ui/bottom-sheet/RawMaterial/VendorComponent";
import ProductCardComponent from "@/src/components/ui/bottom-sheet/RawMaterial/ProductCardComponent";
import TitleWithDetailsCrossComponent from "@/src/components/ui/bottom-sheet/TitleWithDetailsCrossComponent";
import SelectComponent from "@/src/components/ui/bottom-sheet/SelectComponent";
import OptionListComponent from "@/src/components/ui/bottom-sheet/OptionListComponent";
import AddonInputComponent from "@/src/components/ui/bottom-sheet/AddonInputComponent";
import { ReactNode } from "react";
import { TextInputProps } from "react-native";
import InputWithSelectComponent from "@/src/components/ui/bottom-sheet/InputWithSelectComponent";
import FullWidthImageComponent from "@/src/components/ui/bottom-sheet/FullWidthImageComponent";
import RatingComponent from "@/src/components/ui/bottom-sheet/RatingComponent";
import DataAccordianComponent from "@/src/components/ui/bottom-sheet/DataAccordianComponent";
import ImageGalleryComponent from "@/src/components/ui/bottom-sheet/ImageGalleryComponent";
import DataComponent from "@/src/components/ui/bottom-sheet/DataComponent";
import DescriptionComponent from "@/src/components/ui/bottom-sheet/DescriptionComponent";
import DataGroupComponent from "@/src/components/ui/bottom-sheet/DataGroupComponent";
import TableComponent from "@/src/components/ui/bottom-sheet/TableComponent";
import { Chamber, TableColumn, TableRow } from "./ui";
import ProductListComponent from "@/src/components/ui/bottom-sheet/ProductListComponent";
import ProductDetailsComponent from "@/src/components/ui/bottom-sheet/ProductDetailsComponent";
import TruckFullDetailsComponent from "../components/ui/bottom-sheet/TruckFullDetailsComponent";
import ProductListAccordianComponent from "../components/ui/bottom-sheet/ProductListAccordianComponent";
import IconTitleWithHeadingComponent from "../components/ui/bottom-sheet/IconTitleWithHeadingComponent";
import PackageSizeChooseComponent from "../components/ui/bottom-sheet/PackageSizeChooseComponent";
import ImagePreviewComponent from "../components/ui/bottom-sheet/ImagePreviewComponent";
import SelectGroupComponent from "../components/ui/bottom-sheet/SelectGroupComponents";
import FullWidthSliderComponent from "../components/ui/bottom-sheet/full-width-slider";
import { FilterEnum } from "../schemas/BottomSheetSchema";
import { BottomSheetMeta } from "./redux";
import type { sourceEnum as rmSourceEnum } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import StorageRMRatingComponent from "../components/ui/bottom-sheet/StorageRMRating";
import PoliciesCardComponent from "../components/ui/bottom-sheet/PoliciesComponent";
import FileUploadComponent from "../components/ui/bottom-sheet/FileUploadComponent";
import ChooseProductCardComponent from "../components/ui/bottom-sheet/ChooseProductCardComponent";
import { PackageItemLocal } from "../hooks/useChamberStock";
import PackageSummaryMetricsComponent from "../components/ui/bottom-sheet/PackageSummaryMetricsComponent";

export type BottomSheetActionKey =
  | "add-raw-material"
  | "add-product-package"
  | "add-package"
  | "add-package-quantity"
  | "cancel"
  | "ship-order"
  | "edit-order"
  | "cancel-order"
  | "apply-filter"
  | "verify-material"
  | "clear-filter"
  | "add-raw-material"
  | "store-product"
  | "order-reached"
  | "choose-chamber"
  | "select-policies"
  | "cancel-policies"
  | "add-dispatch-product"
  | "add-vendor"
  | "export-open"
  | "export-share"
  | "choose-export-status";
  
// ButtonConfig interface
export interface ButtonConfig {
  text: string;
  variant: "outline" | "fill" | "ghost";
  disabled?: boolean;
  color: "red" | "green" | "blue" | "yellow";
  alignment: "full" | "half" | "left" | "right";
  actionKey?: BottomSheetActionKey;
  closeOnPress?: boolean;
}

// BottomSheetProps interface
export interface BottomSheetProps {
  color: "red" | "green" | "blue" | "yellow";
}

export type validRouteOptionList = "state" | "city" | "product" | "chamber";

type aligmentEnum = "full" | "half";
type keyEnum =
  | "add-raw-material"
  | "package-weight"
  | "supervisor-production"
  | "select-package-type";
type sourceEnum =
  | "add-product-package"
  | "add-package"
  | "supervisor-production";

export type optionListEnumKeys = string[] | { name: string; isoCode: string }[];

export type NormalMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon?: "box" | "roll" | "clock";
};

export type SkuSummaryMetric = {
  id: string;
  label: string;
  type: "sku-summary"; 
  bags: number;
  packets: number;
};

export type PackageSummaryMetric = NormalMetric | SkuSummaryMetric;

// SectionConfig types
export type SectionConfig =
  | {
      type: "header";
      data: {
        label: string;
        value?: string;
        title?: string;
        icon?: string;
        description?: string;
        color?: "red" | "green" | "blue" | "yellow";
        headerDetails?: {
          label: string;
          value: string;
          icon: DataAccordianEnum;
        }[];
      };
    }
  | {
      type: "image-full-width";
      data: {
        imageUrl: string;
      };
    }
  | {
      type: "rating";
      data: {
        label: string;
        selected: number;
      };
    }
  | {
      type: "data-accordian";
      data: {
        title: string;
        details: {
          label: string;
          value: string;
          icon: DataAccordianEnum;
        }[];
        fileName?: string;
      }[];
    }
  | {
      type: "image-gallery";
      data: string[];
    }
  | {
      type: "data";
      data: {
        title: string;
        details: {
          [key: string]: {
            label: string;
            value: string;
            icon: DataAccordianEnum;
          };
        }[];
      }[];
    }
  | {
      type: "description";
      data: {
        title: string;
        data: {
          title: string;
          description: string;
        };
      };
    }
  | {
      type: "data-group";
      data: {
        title: string;
        details: {
          label: string;
          value: string;
          icon: DataAccordianEnum;
        }[];
        fileName?: string;
      }[];
    }
  | {
  type: "table";
  data: {
    label?: string;
    count?: number;
    tableHeader: TableColumn<any>[];
    tableBody: Record<string, string | number>[];
  }[];
} | {
      type: "product-list";
      data: {
        label?: string;
        detailView: {
          text: string;
          isDetailView: boolean;
        };
        products: productDetails[];
      };
    }
  | {
      type: "product-details";
      data: {
        title: string;
        details: {
          [key: string]: {
            label: string;
            value: string;
            icon: DataAccordianEnum;
          };
        }[];
        fileName: string;
      }[];
    }
  | {
      type: "truck-full-details";
      data: {
        title: string;
        driverName: string;
        number: string;
        type: string;
        agency: string;
        date_title: string;
        arrival_date: string;
        driverImage: string;
      };
    }
  | {
      type: "product-list-accordian";
      data: {
        label?: string;
        detailView?: {
          text: string;
          isDetailView: boolean;
        };
        products: productDetails[];
      };
    }
  | {
      type: "search";
      data: {
        searchTerm: string;
        placeholder: string;
        searchType?:
          | "state"
          | "city"
          | "country"
          | "add-raw-material"
          | "add-product"
          | "add-package";
      };
    }
  | {
      type: "search-with-filter";
      data: {
        searchTerm: string;
        placeholder: string;
      };
    }
  | {
      type: "manageAction";
      data: {
        title: string;
        actionKey: string;
      };
    }
  | {
      type: "icon-title-with-heading";
      data: {
        title: string;
        iconTitle: {
          label: string;
          icon: string;
          isoCode: string;
        }[];
      }[];
    }
  | {
      type: "optionList";
      data: {
        isCheckEnable?: boolean;
        isSupervisorProduction?: boolean;
        route?: validRouteOptionList;
        options: optionListEnumKeys;
        key?:
          | "user-action"
          | "vendor-action"
          | "supervisor-production"
          | "product-package"
          | string;
      };
    }
  | {
      type: "package-size-choose-list";
      data: {
    list: {
      name: string;
      size: number;
      unit: "gm" | "kg";
      icon: DataAccordianEnum;
      count: number;
      isChecked: boolean;
      }[];
    source: "package" | "dispatch";
    productId?: string;
  };
    }
  | {
      type: "title-with-details-cross";
      data: {
        title: string;
        description?: string;
        details?: {
          label?: string;
          value?: string;
          icon?: "database" | "pencil";
          isEdit?: boolean;
        };
      };
    }
  | {
      type: "vendor-card";
      data: {
        name: string;
        address: string;
        isChecked: boolean;
        materials: string[];
      }[];
    }
  | {
      type: "image-preview";
      data: {
        imageUri: string;
      };
    }
  | {
      type: "select-group";
      data: {
        labels: string[];
        values: string[];
      };
    }
  | {
      type: "input-with-select";
      data: {
        placeholder: string;
        label: string;
        value?: string;
        placeholder_second?: string;
        label_second?: string;
        value_second?: string;
        alignment?: aligmentEnum;
        key: keyEnum;
        conditionKey: ConditonIdentifier;
        hasUniqueProp: {
          key: string;
          identifier: string;
        };
        formField_1?: string;
        formField_2?: string;
        source?: sourceEnum;
        source2?: rmSourceEnum;
        keyboardType?: "default" | "number-pad" | "numeric" | "email-address";
      };
    }
  | {
      type: "input";
      data: {
        label?: string;
        placeholder?: string;
        value?: string;
        addon?: string;
        keyboardType?: TextInputProps["keyboardType"];
        formField?: string;
      };
    }
  | {
      type: "productCard";
      data: {
        name: string;
        image: string;
        description?: string;
      }[];
    }
  | {
      type: "select";
      data: {
        placeholder?: string;
        label?: string;
        options?: string[];
        key?: "product-package" | "supervisor-production";
      };
    }
  | {
      type: "addonInput";
      hasUniqueProp: {
        key: string;
        identifier: string;
      };
      conditionKey: ConditonIdentifier;
      data: {
        placeholder: string;
        label: string;
        value: string;
        addonText: string;
        formField?: string;
      };
    }
  | {
      type: "full-width-slider";
      data: string[];
    }
  | {
      type: "titleWithTag";
      data: {
        label: string;
        tag: {
          text: string;
          color: "red" | "green" | "blue" | "yellow";
          size?: "sm" | "md" | "lg";
        };
        rating?: number;
      };
    }
  | {
      type: "address";
      data: {
        label: string;
        value: string;
        icon?:
          | "calendar"
          | "calendarCheck"
          | "database"
          | "parcel"
          | "location";
      };
    }
  | {
      type: "titleWithCheckbox";
      data: {
        key: FilterEnum;
        options: {
          text: string;
          isChecked: boolean;
        }[];
      };
    }
  | {
      type: "titleCheckCount";
      data: {
        title: string;
        count: number;
        isChecked: boolean;
      };
    }
  | {
      type: "storage-rm-rating";
      data: {
        name: string;
        rating: string;
        message: string;
      }[];
    }
  | {
      type: "policies-card";
      data: {
        name: string;
        description?: string;
      }[];
    }
  | {
      type: "file-upload";
      data: {
        label: string;
        title: string;
        key: string;
        uploadedTitle?: string;
      };
    }
  | {
      type: "multiple-product-card";
      data: multipleProductCardDataProps[];
    }
  | {
      type: "packing-summary";
      data: {
        title: string;
        rating: number;
        metrics: PackageSummaryMetric[];  
      };
    };

export interface BottomSheetConfig {
  sections: SectionConfig[];
  buttons?: ButtonConfig[];
  meta: BottomSheetMeta;
}

export interface HeaderComponentProps {
  data: {
    label: string;
    value?: string;
    title?: string;
    icon?: string;
    description?: string;
    color?: "red" | "green" | "blue" | "yellow";
    headerDetails: {
      label: string;
      value: string;
      icon: DataAccordianEnum;
    }[];
  };
  onClose?: () => void;
  color?: "red" | "green" | "blue" | "yellow";
}

export interface FullWidthImageComponentProps {
  data: {
    imageUrl: string;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface RatingCardComponentProps {
  data: {
    label: string;
    selected: number;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export type DataAccordianEnum =
  | "database"
  | "user"
  | "location"
  | "calendar-check"
  | "user-square"
  | "truck"
  | "truck-num"
  | "clock"
  | "package"
  | "chamber"
  | "male"
  | "female"
  | "money"
  | "box"
  | "lane"
  | "color-swatch"
  | "trash"
  | "star"
  | "calendar-year"
  | "paper-roll"
  | "bag"
  | "big-bag"
  | "file";

export interface DataAccordianComponentProps {
  data: {
    title: string;
    details: {
      label: string;
      value: string;
      icon: DataAccordianEnum;
    }[];
    fileName?: string[];
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface ImageGalleryComponentProps {
  data: string[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface DataComponentProps {
  data: {
    title: string;
    details: {
      [key: string]: {
        label: string;
        value: string;
        icon: DataAccordianEnum;
      };
    }[];
  }[];
  color: "red" | "green" | "blue" | "yellow";
}
export interface DescriptionComponentProps {
  data: {
    title: string;
    description: string;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface DataGroupComponentProps {
  data: {
    title: string;
    details: {
      label: string;
      value: string;
      icon: DataAccordianEnum;
    }[];
    fileName?: string;
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface TableComponentProps {
  data: {
    label?: string;
    count?: number;
    tableHeader: TableColumn<any>[];
    tableBody: Record<string, string | number>[];
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface ProductSku {
  skuId?: string;
  size: number;
  unit: "kg" | "gm" | "qn" | "unit";
  totalBags: number;
}

export interface productDetails {
  title: string;
  description: string;
  image: string;
  weight: string;

  productId?: string;
  name?: string;
  rating?: number;
  skus?: ProductSku[];
}


export interface ProductListComponentProps {
  data: {
    label?: string;
    detailView: {
      text: string;
      isDetailView: boolean;
    };
    products: productDetails[];
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface ProductDetailsComponentProps {
  data: {
    title: string;
    details: {
      [key: string]: {
        label: string;
        value: string;
        icon: DataAccordianEnum;
      };
    }[];
    fileName: string;
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface TruckFullDetailsComponentProps {
  data: {
    title: string;
    driverName: string;
    number: string;
    type: string;
    agency: string;
    date_title: string;
    arrival_date: string;
    driverImage: string;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface ProductListAccordianComponentProps {
  data: {
    label?: string;
    detailView?: {
      text: string;
      isDetailView: boolean;
    };
    products: productDetails[];
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface ManageActionProps {
  data: {
    title: string;
    actionKey: string;
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface SearchProps {
  data: {
    searchTerm: string;
    placeholder: string;
    searchType?:
    | "state"
    | "city"
    | "country"
    | "add-raw-material"
    | "add-product"
    | "add-package";
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface PackageSizeChooseComponentProps {
  data: {
    list: {
      name: string;
      size: number;
      unit: "gm" | "kg";
      icon: DataAccordianEnum;
      count: number;
      isChecked: boolean;
      }[];
    source: "package" | "dispatch";
    productId?: string;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface InputWithSelectComponentProps {
  data: {
    placeholder: string;
    label: string;
    value?: string;
    placeholder_second?: string;
    label_second?: string;
    value_second?: string;
    alignment?: aligmentEnum;
    key: keyEnum;
    conditionKey: ConditonIdentifier;
    hasUniqueProp: {
      key: string;
      identifier: string;
    };
    formField_1?: string;
    formField_2?: string;
    source?: sourceEnum;
    source2?: rmSourceEnum;
     keyboardType?: "default" | "number-pad" | "numeric" | "email-address";
  };
}

export interface TitleWithTagProps {
  data: {
    label?: string;
    tag?: {
      text: string;
      color: "red" | "green" | "blue" | "yellow";
      size?: "sm" | "md" | "lg" | "xl";
    };
    rating?: number;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface AddressProps {
  data: { label?: string; value?: string; icon?: string };
  color: "red" | "green" | "blue" | "yellow";
}

export interface ProductDetailsProps {
  data: {
    title: string;
    total_weight: string;
    wastage_weight: string;
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface TitleWithCheckboxProps {
  data: {
    key: FilterEnum;
    options: {
      text: string;
      isChecked: boolean;
    }[];
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface PoliciesCardProps {
  data: {
    name: string;
    description?: string;
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface FileUploadComponentProps {
  data: {
    label: string;
    title: string;
    uploadedTitle?: string;
    key: string;
  };
}

export interface ProductDetailsAccordionProps {
  data: {
    title: string;
    total_weight: string;
    wastage_weight: string;
    data: {
      title: string;
      total_weight: string;
      wastage_weight: string;
    }[];
  }[];
  color: "red" | "green" | "blue" | "yellow";
}

type IconTitleItem = {
  label: string;
  icon: string;
  isoCode: string;
};

type IconTitleSection = {
  title: string;
  iconTitle: IconTitleItem[];
};

export interface IconTitleWithHeadingProps {
  data: IconTitleSection[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface SelectGroupProps {
  data: { labels: string[]; values: string[] };
  color: "red" | "green" | "blue" | "yellow";
}

export interface InputComponentProps {
  data: {
    label?: string;
    placeholder?: string;
    value?: string;
    addon?: string;
    keyboardType?: TextInputProps["keyboardType"];
    formField?: string;
  };
  color: "red" | "green" | "blue" | "yellow";
}

export interface ProductItem {
  name: string;
  img: string;
  weight: string;
  rating: string;
  isChecked: boolean;
}
export interface ProductCardProps {
  data: { name: string; image: string; description?: string }[];
  color: "red" | "green" | "blue" | "yellow";
}

export interface TitleCheckCountProps {
  color: "red" | "green" | "blue" | "yellow";
  data: {
    title: string;
    count: number;
    isChecked: boolean;
  };
}
export interface VendorProps {
  // id: string;
  name: string;
  address: string;
  isChecked: boolean;
  materials: string[];
  // count: { val: boolean; total: string; };
}
export interface VendorCardProps {
  color: "red" | "green" | "blue" | "yellow";
  data: VendorProps[];
}

export interface TitleWithDetailsCrossProps {
  data: {
    title: string;
    description?: string;
    details?: {
      label?: string;
      value?: string;
      icon?: "database" | "pencil";
      isEdit?: boolean;
    };
  };
  color: "red" | "green" | "blue" | "yellow";
  onClose?: () => void;
}
export interface SelectComponentProps {
  data: {
    placeholder?: string;
    label?: string;
    options?: string[];
    key?: "product-package" | "supervisor-production";
  };
}

export interface OptionListComponentProps {
  data: {
    isCheckEnable?: boolean;
    isSupervisorProduction?: boolean;
    route?: validRouteOptionList;
    options: optionListEnumKeys;
    key?:
      | "user-action"
      | "vendor-action"
      | "supervisor-production"
      | "product-package"
      | "select-package-type"
      | "choose-export-type"
      | string;
  };
}

export interface AddonInputComponentProps {
  hasUniqueProp?: { key: string; identifier: string };
  conditionKey?: ConditonIdentifier;
  data: {
    placeholder: string;
    label: string;
    value: string;
    addonText: string;
    formField?: string;
  };
}

// export interface PackageSummarySizeProps {
//   data: {
//         title: string,
//         sizes: {
//           id: string,
//         size: string;
//         // bags: number;
//         packets: number;
//         rating: number;
//       }[]
//       };
// }

export interface PackageSummaryMetricsProps {
  data: {
    title: string;
    rating: number;
    metrics: PackageSummaryMetric[];
  };
}

export interface ImagePreviewComponentProps {
  data: {
    imageUri: string;
  };
}
export interface FullWidthSliderComponentProps {
  data: string[];
}

export interface MultiplePackageSizeComponentProps {
  data: {
    name: string;
    icon?: string;
    isChecked: boolean;
  }[];
}
export type ChamberProduct = {
  id: string;
  quantity: string;
  rating: number;
};

export interface multipleProductCardDataProps {
  id: string;
  rating: string;
  product_name: string;
  description?: string;
  image: string;
  isChecked: boolean;
  // added extra
  packages: PackageItemLocal[];
  chambers: ChamberProduct[];
}
export interface multipleProductCardProps {
  data: multipleProductCardDataProps[];
}

export type ConditonIdentifier = "hideUntilChamberSelected";

// ------------------- Button Schema ------------------- //
export interface ConditionalWrapperComponentProps {
  children: ReactNode;
  conditions: {
    [key: string]: () => boolean;
  };
}

// Component mapping based on section type
export const sectionComponents: Record<
  SectionConfig["type"],
  React.FC<{
    data: any;
    color: "red" | "green" | "blue" | "yellow";
    onClose?: () => void;
  }>
> = {
  header: HeaderComponent,
  "image-full-width": FullWidthImageComponent,
  rating: RatingComponent,
  "data-accordian": DataAccordianComponent,
  "image-gallery": ImageGalleryComponent,
  data: DataComponent,
  description: DescriptionComponent,
  "data-group": DataGroupComponent,
  table: TableComponent,
  "product-list": ProductListComponent,
  "product-details": ProductDetailsComponent,
  "truck-full-details": TruckFullDetailsComponent,
  "product-list-accordian": ProductListAccordianComponent,
  search: SearchComponent,
  "search-with-filter": SearchWithFilterComponent,
  "icon-title-with-heading": IconTitleWithHeadingComponent,
  "package-size-choose-list": PackageSizeChooseComponent,
  "title-with-details-cross": TitleWithDetailsCrossComponent,
  "image-preview": ImagePreviewComponent,
  "select-group": SelectGroupComponent,
  "input-with-select": InputWithSelectComponent,
  productCard: ProductCardComponent,
  "multiple-product-card": ChooseProductCardComponent,
  select: SelectComponent,
  "full-width-slider": FullWidthSliderComponent,
  "vendor-card": VendorCardComponent,
  address: AddressComponent,
  titleWithTag: TitleWithTagComponent,
  titleWithCheckbox: TitleWithCheckboxComponent,
  manageAction: ManageActionComponent,
  input: InputComponent,
  titleCheckCount: TitleCheckCountComponent,
  optionList: OptionListComponent,
  addonInput: AddonInputComponent,
  "storage-rm-rating": StorageRMRatingComponent,
  "policies-card": PoliciesCardComponent,
  "file-upload": FileUploadComponent,
  "packing-summary": PackageSummaryMetricsComponent,
};