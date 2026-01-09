// 1. React and React Native core
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";

// 2. Third-party dependencies
import {
  clearChambers,
  setSource,
} from "@/src/redux/slices/bottomsheet/raw-material.slice";
import {
  clearProduct,
  setRawMaterials,
} from "@/src/redux/slices/product.slice";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import SearchInput from "@/src/components/ui/SearchInput";
import PackageCard from "@/src/components/ui/PackageCard";
import Loader from "@/src/components/ui/Loader";
import Button from "@/src/components/ui/Buttons/Button";
import BottomSheet from "@/src/components/ui/BottomSheet";
import EmptyState from "@/src/components/ui/EmptyState";
import Tabs from "@/src/components/ui/Tabs";
import { B1, B4, H3, H6 } from "@/src/components/typography/Typography";

// 4. Project hooks
import { usePackages } from "@/src/hooks/Packages";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { PACKET_ITEMS } from "@/src/constants/Packets";
import { getEmptyStateData, mapPackageIcon, toPackageIconInput } from "@/src/utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { sortBy } from "@/src/utils/numberUtils";
import { FlatList } from "react-native";
import {
  Chamber as DryChambersTypes,
  useChambersSummary,
  useDryChambers,
  useFrozenChambers,
} from "@/src/hooks/useChambers";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";
import { AddProductPackageForm } from "@/src/components/ui/bottom-sheet/InputWithSelectComponent";
import Select from "@/src/components/ui/Select";
import ItemsRepeater from "@/src/components/ui/ItemsRepeater";
import {
  useProductItems,
  useProductPackage,
  useRawMaterialByProduct,
} from "@/src/hooks/productItems";

// 6. Types
// No items of this type

// 7. Schemas
// No items of this type

// 8. Assets
import noPackageImage from "@/src/assets/images/illustrations/no-packaging.png";
import { useFormValidator } from "@/src/sbc/form";
import { IconRatingProps, ItemCardProps, PackageItem } from "@/src/types";
import DetailsToast from "@/src/components/ui/DetailsToast";
import FiveStarIcon from "@/src/components/icons/page/Rating/FiveStarIcon";
import FourStarIcon from "@/src/components/icons/page/Rating/FourStarIcon";
import ThreeStarIcon from "@/src/components/icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "@/src/components/icons/page/Rating/TwoStarIcon";
import OneStarIcon from "@/src/components/icons/page/Rating/OneStarIcon";
import Input from "@/src/components/ui/Inputs/Input";
import TrashIcon from "@/src/components/icons/common/TrashIcon";
import FormField from "@/src/sbc/form/FormField";
import ChamberIcon from "@/src/components/icons/common/ChamberIcon";
import { useCreatePackedItem, usePackedItemsFromChamberStock, usePackingSummaryToday } from "@/src/hooks/packedItem";
import {
  resetPackageSizes,
  setPackageSizes,
} from "@/src/redux/slices/bottomsheet/package-size.slice";
import { RefreshControl } from "react-native-gesture-handler";
import {
  useChamberStock,
  useChamberStockByName,
} from "@/src/hooks/useChamberStock";
import { clearDispatchRatings } from "@/src/redux/slices/bottomsheet/dispatch-rating.slice";
import { clearRatings } from "@/src/redux/slices/bottomsheet/storage.slice";
import { convertToKg, getMaxPackagesFor } from "@/src/utils/weightutils";
import RefreshableContent from "@/src/components/ui/RefreshableContent";
import ItemsFlatList from "@/src/components/ui/ItemsFlatList";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";

interface Chamber {
  id: string | number;
  name: string | number;
  stored_quantity: number | string;
  quantity: number | string;
  rating?: number | string;
}

interface Product {
  name: string;
  chambers: Chamber[];
}

interface SubmitChamber {
  id: string;
  quantity: number;
  rating: number;
}

interface SubmitProduct {
  name: string;
  chambers: SubmitChamber[];
}

interface PackedChamber {
  id: string;
  quantity: number | string;
}

type RMChamberQuantityMap = {
  [rmName: string]: {
    [chamberId: string]: {
       count: number;   
      quantity: number; 
      rating: number;
    };
  };
};


export type StorageForm = {
  image: string;
  product_name: string;
  packages: PackageItem[];
  products: Product[];
  submitProducts?: SubmitProduct[];
  packedChambers?: PackedChamber[];
  rmChamberQuantities: RMChamberQuantityMap;
  rating: number;
};


const validatePackageQuantity = (
  packages: PackageItem[],
  totalOrderQuantity: number
): boolean => {
  if (!Array.isArray(packages) || packages?.length === 0) return false;

  let totalPackageQuantity = 0;

  for (const pkg of packages) {
    const packageSize = Number(pkg.size);
    const packageQuantity = Number(pkg.quantity);

    if (
      isNaN(packageSize) ||
      isNaN(packageQuantity) ||
      packageSize <= 0 ||
      packageQuantity <= 0
    ) {
      return false;
    }

    totalPackageQuantity += packageSize * packageQuantity;
  }

  return totalPackageQuantity >= totalOrderQuantity;
};

const calculateTotalPackedQuantity = (
  packedChambers?: PackedChamber[]
): number => {
  if (!Array.isArray(packedChambers) || packedChambers.length === 0) return 0;

  return packedChambers.reduce((total, chamber) => {
    const qty = Number(chamber.quantity) || 0;
    return total + qty;
  }, 0);
};

const PackageScreen = () => {
  const { height: screenHeight } = useWindowDimensions()
  const [searchText, setSearchText] = useState("");
  const {
    data: packageData,
    isLoading: packageLoading,
    fromCache,
    refetch: packageRefetch,
    isFetching: packageFetching,
  } = usePackages(searchText);

  const {
    productPackages,
    isLoading: productPackagesLoading,
    refetch: productPackageRefetch,
    isFetching: productPackageFetching,
  } = useProductPackage();

  const { mutate: createPacked, isPending, error } = useCreatePackedItem();

  const 
  { data: packedItems, isFetching, refetch } = usePackedItemsFromChamberStock();
  const { data: DryChambersRaw } = useDryChambers();
  const DryChambers = DryChambersRaw || [];

  const dispatch = useDispatch();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const {
    productItems: product_items,
    isLoading: productsLoading,
    isFetching: productsFetching,
    refetch: productItemsRefetch,
  } = useProductItems();

  const {
    data: frozenChambers,
    isLoading: frozenLoading,
    refetch: frozenChambersRefetch,
    isFetching: frozenChambersFetching,
  } = useFrozenChambers();

  const isProductLoading = useSelector(
    (state: RootState) => state.product.isProductLoading
  );
  const selectedPackage = useSelector(
    (state: RootState) => state.packageSize.selectedSizes
  );
  const { product: selectedProduct, rawMaterials: selectedRawMaterials } =
    useSelector((state: RootState) => state.product);

  const storeRawMaterials = useSelector(
    (state: RootState) => state.product.rawMaterials
  );
  const choosedChambers = useSelector(
    (state: RootState) => state.rawMaterial.selectedChambers
  );
  const productRating = useSelector(
    (state: RootState) => state.packageProductRating.packageProductRating
  );
  const {chamberStock} = useChamberStockByName(selectedRawMaterials);
  const chamberRatingMap = useMemo(() => {
    const map = new Map<string, number>();

    chamberStock?.forEach((stock) => {
      stock.chamber?.forEach((ch) => {
        map.set(ch.id, Number(ch.rating));
      });
    });

    return map;
  }, [chamberStock]);

  
  const {
    rawMaterials,
    isLoading: rmInitialLoading,
    refetch: refetchRM,
    isFetching: rmLoading,
  } = useRawMaterialByProduct(selectedProduct);

  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );

  const {
    summaries: choosedChamberSummary,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useChambersSummary(choosedChambers);

const { data: packingSummaryToday, isLoading: packingSummaryTodayLoading } = usePackingSummaryToday();

  const [isLoading, setIsLoading] = useState(false);
  const [openTab, setOpenTab] = useState<number>(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");

  const { values, setField, errors, validateForm, resetForm } =
    useFormValidator<StorageForm>(
      {
        product_name: "",
        image:
          "https://c1e1fba659f7.ngrok-free.app/chamber-stock/packed-item/packaging.png",
        packages: [],
        products: [],
        packedChambers: [],
        rmChamberQuantities: {},
      },
      {
        packages: [
          {
            type: "custom" as const,
            validate: (value: any, allValues: Record<string, any>) => {
              const packages: PackageItem[] = value;
              const formValues = allValues as StorageForm;

              if (!Array.isArray(packages) || packages.length === 0) {
                return false;
              }

              const hasValidFields = packages.every(
                (pkg) =>
                  pkg &&
                  pkg.size !== null &&
                  pkg.size !== undefined &&
                  pkg.size !== "" &&
                  pkg.rawSize !== null &&
                  pkg.rawSize !== undefined &&
                  pkg.unit !== null &&
                  pkg.unit !== undefined &&
                  ["kg", "gm", "qn"].includes(pkg.unit) &&
                  pkg.quantity !== null &&
                  pkg.quantity !== undefined &&
                  pkg.quantity !== "" &&
                  Number(pkg.size) > 0 &&
                  Number(pkg.quantity) > 0
              );

              if (!hasValidFields) return false;

              const totalOrderQuantity = calculateTotalPackedQuantity(
                formValues.packedChambers
              );

              return validatePackageQuantity(packages, totalOrderQuantity);
            },
            message:
              "Package quantities must cover the total order quantity. Each package must have valid size, unit, and quantity greater than 0.",
          },
        ],
        product_name: [
          { type: "required" as const, message: "Product name is required!" },
        ],
        products: [],
        image: [],
        rmChamberQuantities: [],
      },
      {
        validateOnChange: true,
        debounce: 300,
      }
    );

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleToggleToast = () => {
    showToast(
      "error",
      "Entered quantity exceeds available quantity in chamber!"
    );
  };

  useEffect(() => {
    if (!selectedProduct) return;

    if (rmLoading || rmInitialLoading) return;

    const noRM = !Array.isArray(rawMaterials) || rawMaterials.length === 0;

    if (noRM) {
      showToast(
        "error",
        `${selectedProduct} raw materials are not in your chambers!`
      );
    }
  }, [selectedProduct, rawMaterials, rmLoading, rmInitialLoading]);

  useEffect(() => {
    setField("products", product_items);
  }, [product_items]);

  useEffect(() => {
    setField("product_name", selectedProduct);
  }, [selectedProduct]);

  useEffect(() => {
    if (JSON.stringify(storeRawMaterials) !== JSON.stringify(rawMaterials)) {
      dispatch(setRawMaterials(rawMaterials));
    }
  }, [dispatch, rawMaterials, storeRawMaterials]);

  useEffect(() => {
    if (!productPackages || !selectedPackage) return;

    const updated = selectedPackage
      .map((sp) => {
        const match = productPackages.find(
          (pp) =>
            `${pp.rawSize} ${pp.unit}` === sp.rawSize && pp.unit === sp.unit
        );
        if (!match) return null;

        const existing = values.packages?.find(
          (p) => p.rawSize === sp.rawSize && p.unit === sp.unit
        );

        return {
          ...match,
          rawSize: sp.rawSize,
          quantity: existing?.quantity ?? "",
        };
      })
      .filter(Boolean) as PackageItem[];

    const same =
      updated?.length === values.packages?.length &&
      updated.every((up) =>
        values.packages.some(
          (vp) =>
            vp.size === up?.size &&
            vp.unit === up.unit &&
            vp.quantity === up?.quantity
        )
      );

    if (!same) {
      setField("packages", updated);
    }
  }, [productPackages, selectedPackage, values.packages]);

  const ratingByRM = useSelector(
    (state: RootState) => state.StorageRMRating.ratingByRM
  );

  const formattedData = useMemo(() => {
    return !packageLoading
      ? sortBy(PACKET_ITEMS(packageData), "name", true)
      : [];
  }, [packageData]);

  const chamberSelectLabel =
    choosedChamberSummary.length === 0
      ? "Select chambers"
      : choosedChamberSummary.length === 1
      ? choosedChamberSummary[0].chamber_name
      : `${choosedChamberSummary[0].chamber_name}, +${
          choosedChamberSummary.length - 1
        }`;

  const handleOpenAddNewPackage = async () => {
    const addProductPackage = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Add Packing Material",
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter Product",
            label: "Product name",
            placeholder_second: "Enter RM",
            label_second: "Raw Material",
            alignment: "half",
            key: "add-raw-material",
            formField_1: "product_name",
            source: "add-product-package",
            source2: "product-package",
          },
        },
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter SKU",
            label: "Packing Size",
            key: "package-weight",
            formField_1: "size",
            label_second: "Unit",
            keyboardType: "number-pad",
            source: "add-product-package",
          },
        },
        {
          type: "input",
          data: {
            placeholder: "Enter counts",
            label: "No. of Pouches",
            keyboardType: "number-pad",
            formField: "quantity",
          },
        },
        {
          type: "select",
          data: {
            placeholder:
              productPackageForm.values.chamber_name || "Select Chamber",
            label: "Select Chamber",
            options:
              DryChambers && DryChambers.length === 0
                ? []
                : DryChambers.map((dch: DryChambersTypes) => dch.chamber_name),
            key: "product-package",
          },
        },
        {
          type: "file-upload",
          data: {
            label: "Upload pouch image",
            uploadedTitle: "Uploaded pouch image",
            title: "Upload pouch image",
            key: "package-image",
          },
        },
        {
          type: "file-upload",
          data: {
            label: "Upload packed image",
            uploadedTitle: "Uploaded packed image",
            title: "Upload packed image",
            key: "image",
          },
        },
      ],
      buttons: [
        {
          text: "Add package",
          variant: "fill",
          color: "green",
          alignment: "full",
          disabled: false,
          actionKey: "add-product-package",
        },
      ],
    };
    setIsLoading(true);
    await validateAndSetData(
      "temp123",
      "add-product-package",
      addProductPackage
    );
    setIsLoading(false);
  };

  const emptyStateData = getEmptyStateData("products");

  async function handleToggleProductBottomSheet() {
    setIsLoading(true);
    dispatch(setSource("choose"));
    await validateAndSetData("Abc1", "add-product");
    setIsLoading(false);
  }

  const totalPackageQuantityKg = useMemo(() => {
    return (values.packages || []).reduce((sum, pkg) => {
      return (
        sum +
        convertToKg(Number(pkg.size), pkg.unit!) * (Number(pkg.quantity) || 0)
      );
    }, 0);
  }, [values.packages]);

  const totalPackedQuantity = useMemo(() => {
    return calculateTotalPackedQuantity(values.packedChambers);
  }, [values.packedChambers]);

const totalRawMaterialUsed = useMemo(() => {
  const rmMap = values.rmChamberQuantities || {};

  return Object.values(rmMap).reduce((rmSum, chamberMap) => {
    return rmSum +
      Object.values(chamberMap || {}).reduce(
        (sum, v) => sum + (Number(v?.quantity) || 0),
        0
      );
  }, 0);
}, [values.rmChamberQuantities]);

const handlePackageQuantityChange = useCallback(
  (index: number, text: string) => {
    const numeric = parseInt(text.replace(/[^0-9]/g, ""), 10);

    if (isNaN(numeric)) {
      setField(`packages.${index}.quantity`, "");
      return;
    }

    const updatedPackages = [...(values.packages || [])];
    const currentPackage = updatedPackages[index];
    if (!currentPackage) return;

    const maxPackages = getMaxPackagesFor(currentPackage);

    let finalQty = numeric;

    if (maxPackages !== null && numeric > maxPackages) {
      finalQty = maxPackages;

      showToast(
        "error",
        `You can pack maximum ${maxPackages} units for this SKU`
      );
    }

    // 🔒 CHECK TOTAL KG ALSO
    const newTotalKg = updatedPackages.reduce((sum, pkg, i) => {
      const qty = i === index ? finalQty : Number(pkg.quantity) || 0;
      return sum + convertToKg(Number(pkg.size), pkg.unit!) * qty;
    }, 0);

    if (newTotalKg > totalPackedQuantity) {
      showToast(
        "error",
        "Total package quantity cannot exceed packed chamber quantity"
      );
      return;
    }

    updatedPackages[index] = {
      ...currentPackage,
      quantity: String(finalQty),
    };

    setField("packages", updatedPackages);
  },
  [values.packages, setField, totalPackedQuantity]
);

  const chamberNameMap = useMemo(() => {
    const map = new Map<string, string>();

    frozenChambers?.forEach((ch) => {
      map.set(String(ch.id), ch.chamber_name);
    });

    return map;
  }, [frozenChambers]);

  const handleRemovePackage = (pkg: PackageItem) => {
    dispatch(
      setPackageSizes(
        selectedPackage.filter((sp) => sp.rawSize !== pkg.rawSize)
      )
    );
  };

  async function handleTogglePackageSizeBottomSheet() {
    if (!productPackages) return;
    const choosePackaging = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Packaging size",
          },
        },
        {
          type: "search",
          data: {
            searchTerm: "",
            placeholder: "Search size",
            searchType: "add-package",
          },
        },
        {
          type: "package-size-choose-list",
          data: {
            list: productPackages?.map((pack) => {
            const unit = pack?.unit?.toLowerCase();
            let grams = Number(pack.size);

            switch (unit) {
              case "kg":
                grams = Number(pack.size) * 1000;
                break;
              case "gm":
                grams = Number(pack.size);
                break;
              default:
                return null;
            }

            let icon = "paper-roll";

            if (grams <= 250) {
              icon = "paper-roll";
            } else if (grams <= 500) {
              icon = "bag";
            } else {
              icon = "big-bag";
            }
            return {
              name: `${pack?.rawSize} ${pack?.unit}`,
              icon: icon,
              count: Number(pack?.quantity),
              isChecked: false,
            };
          }),
          source: "package",
        },
        },
      ],
      buttons: [
        {
          text: "Add",
          variant: "fill",
          color: "green",
          alignment: "full",
          disabled: false,
          actionKey: "add-package-by-product",
        },
      ],
    };
    await validateAndSetData("Abc1", "choose-package", choosePackaging);
    setIsLoading(false);
  }
  // --- END PACKAGE LOGIC ---

  const onSubmit = async () => {
    try {
        const totalRM = Object.values(values.rmChamberQuantities || {})
          .reduce((rmSum, chamberMap) => {
            return (
              rmSum +
             Object.values(chamberMap || {}).reduce(
              (sum, v) => sum + (Number(v?.quantity) || 0),
              0
            )
            );
          }, 0);

      if (totalRM === 0) {
        showToast(
          "error",
          "Please enter raw material quantity before submitting."
        );
        return;
      }

      if (totalRM !== totalPackedQuantity) {
        showToast(
          "error",
          `Raw material quantity (${totalRM} kg) must exactly match packed quantity (${totalPackedQuantity} kg).`
        );
        return;
      }

      const result = validateForm();

      
      if (!result.success) return;

      const formData = result.data as StorageForm;

      const rmChamberEntries = Object.entries(values.rmChamberQuantities || {});

      const submitProducts: SubmitProduct[] = rmChamberEntries.map(
        ([rmName, chambers]) => ({
          name: rmName,
          chambers: Object.entries(chambers)
            .filter(([, qty]) => qty.quantity > 0)
          .map(([chamberId, data]) => ({
                  id: chamberId,
                  quantity: data.quantity,
                  rating: data.rating,
                }))
        })
      );

      const packedChambersWithId = (choosedChamberSummary || [])
        .map((ch, idx) => ({
          id: String(ch.chamber_id),
          quantity: Number(formData.packedChambers?.[idx]?.quantity || 0),
        }))
        .filter((item) => item.quantity > 0);

      const finalPayload: StorageForm = {
        ...formData,
        packedChambers: packedChambersWithId,
        submitProducts,
        rating: productRating.rating,
      };

      setIsLoading(true);
      createPacked(finalPayload);
      setIsLoading(false);

      resetForm();
      dispatch(clearProduct());
      dispatch(setRawMaterials([]));
      dispatch(resetPackageSizes());
      dispatch(clearChambers());
      dispatch(clearRatings());
      dispatch(clearDispatchRatings());

      showToast("success", "Packed item created!");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleToggleChamberBottomSheet = async () => {
    if (frozenChambers?.length === 0) return;
    const MULTIPLE_CHAMBER_LIST = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Select Chambers",
          },
        },
        {
          type: "productCard",
          data: frozenChambers?.map((chamber) => ({
            name: chamber.chamber_name,
          })),
        },
      ],
      buttons: [
        {
          text: "Cancel",
          variant: "outline",
          color: "green",
          alignment: "half",
          disabled: false,
          actionKey: "cancel",
        },
        {
          text: "select",
          variant: "fill",
          color: "green",
          alignment: "half",
          disabled: false,
          actionKey: "choose-chamber",
        },
      ],
    };
    validateAndSetData("Abc1", "multiple-chamber-list", MULTIPLE_CHAMBER_LIST);
    dispatch(setSource("product-chamber"));

    setIsLoading(false);
  };

  type StockChamber = {
    id: string | number;
    name: string | number;
    quantity: number;
    stored_quantity: number | string;
    rating?: number | string;
  };

  type ChambersByRM = Map<string, StockChamber[]>;

const chambersByRM: ChambersByRM = useMemo(() => {
  const map = new Map<string, Map<string, StockChamber>>();

  chamberStock?.forEach((stock) => {
    const rmName = stock.product_name;
    if (!rmName) return;

    if (!map.has(rmName)) {
      map.set(rmName, new Map());
    }

    const chamberMap = map.get(rmName)!;

    stock.chamber?.forEach((ch) => {
      const id = String(ch.id);

      if (!chamberMap.has(id)) {
        chamberMap.set(id, {
          id,
          name: chamberNameMap.get(id) ?? "Unknown Chamber", 
          quantity: Number(ch.quantity) || 0,
          stored_quantity: Number(ch.quantity) || 0,
          rating: Number(ch.rating) || 0,
        });
      }
    });
  });

  const finalMap = new Map<string, StockChamber[]>();
  map.forEach((value, key) => {
    finalMap.set(key, Array.from(value.values()));
  });

  return finalMap;
}, [chamberStock, chamberNameMap]);

  const selectedLabel = selectedProduct || "Select products";

  const rmMatchStatus = useMemo(() => {
    if (totalRawMaterialUsed === 0) return "neutral";
    if (totalRawMaterialUsed < totalPackedQuantity) return "less";
    if (totalRawMaterialUsed > totalPackedQuantity) return "more";
    return "equal";
  }, [totalRawMaterialUsed, totalPackedQuantity]);

  const rmColor = {
    neutral: getColor("green", 700),
    less: getColor("red", 500),
    more: getColor("yellow", 500),
    equal: getColor("green", 500),
  }[rmMatchStatus];

  const packageMatchStatus = useMemo(() => {
    if (totalPackageQuantityKg === 0) return "neutral";
    if (totalPackageQuantityKg < totalPackedQuantity) return "less";
    if (totalPackageQuantityKg > totalPackedQuantity) return "more";
    return "equal";
  }, [totalPackageQuantityKg, totalPackedQuantity]);

  const packageColor = {
    neutral: getColor("green", 700),
    less: getColor("red", 500),
    more: getColor("yellow", 500),
    equal: getColor("green", 500),
  }[packageMatchStatus];

  const allGood = rmMatchStatus === "equal" && packageMatchStatus === "equal";

      const { packingSummary } = useMemo(() => {
        const buckets = {
          packingSummary: [] as ItemCardProps[],
        };

        if (!Array.isArray(packingSummaryToday)) {
          return buckets;
        }

        const query = searchText.trim().toLowerCase();

        for (const packedEvent of packingSummaryToday) {
          if (!packedEvent.size) continue;

          const productName = packedEvent.product_name?.toLowerCase() ?? "";
          const sizeLabel = packedEvent.size.size?.toLowerCase() ?? "";

          if (
            query &&
            !productName.includes(query) &&
            !sizeLabel.includes(query)
          ) {
            continue;
          }

          buckets.packingSummary.push({
            id: packedEvent.eventId,
            name: packedEvent.product_name,
            weight: `${packedEvent.size.size} | ${packedEvent.size.packets} packets`,
            rating: String(packedEvent.size.rating),
          });
        }

        return buckets;
      }, [packingSummaryToday, searchText]);

         const RatingIconMap: Record<
        number,
        React.FC<IconRatingProps>
      > = {
        5: FiveStarIcon,
        4: FourStarIcon,
        3: ThreeStarIcon,
        2: TwoStarIcon,
        1: OneStarIcon,
      };

      const ProductRatingIcon = RatingIconMap[productRating.rating]
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.pageContainer}>
        <PageHeader page={"Packing"} />
        <View style={styles.wrapper}>
          <Tabs
            tabTitles={["Stock", "Packing material", "Daily packing"]}
            color="green"
            style={styles.flexGrow}
          >
            <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 4 }}
                refreshControl={
                  <RefreshControl
                    refreshing={
                      productPackageFetching ||
                      productsFetching ||
                      frozenChambersFetching ||
                      isSummaryFetching ||
                      rmLoading
                    }
                    onRefresh={() => {
                      productPackageRefetch();
                      productItemsRefetch();
                      frozenChambersRefetch();
                      refetchSummary();
                      refetchRM();
                    }}
                  />
                }
              >
                <View style={styles.storageColumn}>
                  <Select
                    value={selectedLabel}
                    style={{ paddingHorizontal: 8 }}
                    showOptions={false}
                    onPress={handleToggleProductBottomSheet}
                  >
                    Product name
                  </Select>
                            <Select
                                value={productRating.message}
                                showOptions={false}
                                preIcon={ProductRatingIcon ?? FiveStarIcon}
                                selectStyle={{ paddingHorizontal: 8 }}
                                onPress={() =>
                                  validateAndSetData(
                                    `product:${productRating.rating}`,
                                    "storage-rm-rating"
                                  )
                                }
                              />
                              
                  <View style={[styles.rawMaterialColumn, styles.borderBottom]}>
                    {product_items?.length > 0 &&
                      selectedRawMaterials.map((item: string) => {
                        const rmPackaging = chamberStock?.find(
                          (s) => s.product_name === item
                        )?.packaging;

                        const rmPackagingObj =
                            rmPackaging && !Array.isArray(rmPackaging)
                            ? rmPackaging
                            : null;

                        const ratingForThisRM = ratingByRM[item] ?? {
                          rating: 5,
                          message: "Excellent",
                        };

                        const selectedRating = ratingForThisRM.rating;

                        const rmChambers = chambersByRM.get(item) || [];

                        const visibleChambers = rmChambers.filter((chamber) => {
                          const chamberRating =
                            chamberRatingMap.get(String(chamber.id)) ?? 5;

                          return (
                            chamberRating === selectedRating &&
                            Number(chamber.quantity) > 0
                          );
                        });

                        const RatingIcon =
                          RatingIconMap[selectedRating] ?? FiveStarIcon;
                          if (!rmPackagingObj) {
                            return (
                              <EmptyState
                                stateData={{
                                  title: "Packaging missing",
                                  description: `${item} packaging data not found`,
                                }}
                                 style={{marginTop: -(screenHeight/ 7)}}
                                compact
                              />
                            );
                          }

                        return (
                          <ItemsRepeater
                            key={item}
                            title={item}
                            description={item}
                            noValue={true}
                          >
                            <View style={styles.cardBody}>
                              <Select
                                value={ratingForThisRM.message}
                                showOptions={false}
                                preIcon={RatingIcon ?? FiveStarIcon}
                                style={{ flex: 0.5 }} 
                                onPress={() =>
                                  validateAndSetData(
                                    `${item}:${ratingForThisRM.rating}`,
                                    "storage-rm-rating"
                                  )
                                }
                              />

                              {/* <View style={styles.separator} /> */}
                              {visibleChambers.length === 0 ? (
                                 <View style={{marginBottom: 16, alignItems: "center"}}>
                                   <EmptyState
                                    stateData={{
                                      title: "No stock found",
                                      description: `${item} is not available in any chamber`,
                                    }}
                                 style={{marginTop: -(screenHeight/ 16)}}
                                    compact
                                  />
                                 </View>
                                ) : (
                                  visibleChambers.map((chamber) => {
                                    const chamberName =
                                      chamberNameMap.get(String(chamber.id)) ?? "Unknown Chamber";

                                    return (
                                      <View
                                        key={`${item}-${chamber.id}`} 
                                        style={[styles.chamberCard, styles.borderBottom]}
                                      >
                                        <View style={styles.Hstack}>
                                          <View style={styles.iconWrapper}>
                                            <ChamberIcon color={getColor("green")} size={32} />
                                          </View>

                                          <View style={styles.Vstack}>
                                            <B1>{String(chamberName).slice(0, 12)}...</B1>
                                         <B4>
                                    {chamber.quantity} qty.  | {rmPackagingObj.size.value} {rmPackagingObj.size.unit} bag
                                  </B4>

                                          </View>
                                        </View>

                                        <View style={{ flex: 0.7 }}>
                                          <Input
                                            placeholder=""
                                            addonText="bags"
                                            mask="addon"
                                            post
                                            keyboardType="numeric"
                                            value={
                                              values.rmChamberQuantities?.[item]?.[chamber.id]?.count
                                                ? String(values.rmChamberQuantities[item][chamber.id].count)
                                                : ""
                                            }
                                            onChangeText={(text: string) => {
                                              if (!rmPackagingObj) return;

                                              const bagCount = Number(text.replace(/[^0-9]/g, ""));
                                              if (isNaN(bagCount)) return;
                                              const kgPerBag = convertToKg(
                                                rmPackagingObj.size.value,
                                                rmPackagingObj.size.unit
                                              );

                                              const usedKg = bagCount * kgPerBag;

                                              if (usedKg > Number(chamber.stored_quantity)) {
                                                handleToggleToast();
                                                return;
                                              }

                                              setField(`rmChamberQuantities.${item}.${chamber.id}`, {
                                                count: bagCount,
                                                quantity: usedKg,
                                                rating: selectedRating,
                                              });
                                            }}
                                          />

                                        </View>
                                      </View>
                                    );
                                  })
                                )}
                            </View>
                          </ItemsRepeater>
                        );
                      })}
                  </View>

                  <Select
                    value={chamberSelectLabel}
                    style={{ paddingHorizontal: 16 }}
                    showOptions={false}
                    onPress={handleToggleChamberBottomSheet}
                    disabled={
                      frozenChambers?.length === 0 ||
                      !selectedProduct ||
                      rmLoading ||
                      rawMaterials.length === 0
                    }
                  >
                    Stacking Location
                  </Select>

                  <View style={[styles.Vstack, { paddingHorizontal: 16 }]}>
                    {choosedChamberSummary?.map((chamber, idx) => (
                      <View
                        key={idx}
                        style={[styles.chamberCard, styles.borderBottom]}
                      >
                        <View style={styles.Hstack}>
                          <View style={styles.iconWrapper}>
                            <ChamberIcon color={getColor("green")} size={32} />
                          </View>
                          <View style={styles.Vstack}>
                            <B1>
                              {String(chamber.chamber_name).slice(0, 12)}...
                            </B1>
                            <B4>{chamber.remaining}kg</B4>
                          </View>
                        </View>
                        <View style={{ flex: 0.7 }}>
                          <FormField
                            name={`packedChambers.${idx}.quantity`}
                            form={{ values, setField, errors }}
                          >
                            {({ value, onChange, error }) => (
                              <Input
                                placeholder="Qty."
                                addonText="KG"
                                value={
                                  value === 0 || value == null
                                    ? ""
                                    : String(value)
                                }
                                onChangeText={(text: string) => {
                                  const numeric = text.replace(/[^0-9.]/g, "");
                                  const enteredValue =
                                    numeric === "" ? 0 : parseFloat(numeric);
                                  const maxQuantity = Number(chamber.remaining);

                                  if (enteredValue > maxQuantity) {
                                    handleToggleToast();
                                    return;
                                  }

                                  onChange(text);
                                }}
                                mask="addon"
                                post
                                keyboardType="decimal-pad"
                                error={error}
                              />
                            )}
                          </FormField>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* --- PACKAGE UI (TOP LEVEL) --- */}
                  <View style={styles.packageWrapper}>
                    <H3>Select SKU</H3>
                    <View style={[styles.sizeQtyRow]}>
                      <View style={{ flex: 0.7 }}>
                        <Select
                          showOptions={false}
                          options={["Pouch size"]}
                          onPress={handleTogglePackageSizeBottomSheet}
                          disabled={selectedProduct?.length === 0}
                        />
                      </View>
                      <View
                        style={[
                          styles.quantityCard,
                          {
                            borderColor: allGood
                              ? getColor("green", 500)
                              : getColor("green", 100),
                          },
                        ]}
                      >
                        <View style={{ alignItems: "center" }}>
                          <H6>Packed Qty</H6>
                          <B4 style={{ color: packageColor }}>
                            {totalPackageQuantityKg} / {totalPackedQuantity} kg
                          </B4>
                        </View>

                        <View style={{ alignItems: "center" }}>
                          <H6>RM Used</H6>
                          <B4 style={{ color: rmColor }}>
                            {totalRawMaterialUsed} / {totalPackedQuantity} kg
                          </B4>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        gap: 12,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 8,
                      }}
                    >
                      {values.packages?.length === 0 ? (
                        <EmptyState
                          image={noPackageImage}
                          stateData={{
                            title: "No packaging selected",
                            description: "",
                          }}
                        />
                      ) : (
                        values.packages.map((pkg, index) => {
                          const Icon = mapPackageIcon(toPackageIconInput(pkg));

                          const maxPackages = getMaxPackagesFor(pkg);

                          const currentQty = Number(
                            values.packages?.[index]?.quantity || 0
                          );
                          const remaining =
                            maxPackages !== null && !Number.isNaN(currentQty)
                              ? maxPackages - currentQty
                              : null;

                          return (
                            <View key={pkg.rawSize} style={[styles.packageRow]}>
                              <View style={styles.row}>
                                <View style={styles.iconWrapper}>
                                  {Icon && (
                                    <Icon color={getColor("green")} size={28} />
                                  )}
                                </View>
                                <B1>
                                  {pkg.rawSize}
                                  {remaining !== null && ` (${remaining})`}
                                </B1>
                              </View>

                              <View style={[styles.Hstack, { flex: 0.8 }]}>
                                <FormField
                                  name={`packages.${index}.quantity`}
                                  form={{ values, setField, errors }}
                                >
                                  {({ value, onChange, error }) => (
                                    <Input
                                      placeholder="Enter count"
                                      keyboardType="numeric"
                                      value={
                                        value === 0 ||
                                        value === null ||
                                        value === undefined
                                          ? ""
                                          : String(value)
                                      }
                                      onChangeText={(text: string) =>
                                        handlePackageQuantityChange(index, text)
                                      }
                                      error={error}
                                    />
                                  )}
                                </FormField>
                                <Pressable
                                  onPress={() => handleRemovePackage(pkg)}
                                >
                                  <TrashIcon color={getColor("green")} />
                                </Pressable>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </View>
                  </View>
                  {/* --- END PACKAGE UI --- */}
                </View>
              </ScrollView>
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <Button onPress={onSubmit} disabled={isPending} variant="fill">
                  {isPending ? "Packing product..." : "Pack product"}
                </Button>
              </View>
            </View>
            <View style={styles.flexGrow}>
              <View
                style={[
                  styles.HStack,
                  styles.justifyBetween,
                  styles.alignCenter,
                  { paddingTop: 16, paddingHorizontal: 16 },
                ]}
              >
                <H3>Package</H3>
                <Button
                  variant="outline"
                  size="md"
                  onPress={handleOpenAddNewPackage}
                >
                  Add package
                </Button>
              </View>
              <View style={styles.searchinputWrapper}>
                      <SearchWithFilter
                        value={searchText}
                        onChangeText={(text: string) => setSearchText(text)}
                        placeholder={"Search by product name"}
                        onFilterPress={() => {}}
                      />
                {/* <SearchInput
                  border
                  value={searchText}
                  cross={true}
                  onChangeText={(text: string) => setSearchText(text)}
                  onClear={() => setSearchText("")}
                  returnKeyType="search"
                  placeholder={"Search by product name"}
                /> */}
              </View>
              <FlatList
                style={{ flex: 1, paddingHorizontal: 16 }}
                data={formattedData}
                keyExtractor={(item, index) =>
                  item.id?.toString() ?? index.toString()
                }
                renderItem={({ item }) => (
                 <View style={{marginBottom: 20 }}>
                   <PackageCard
                    name={item.name}
                    id={item.id}
                    href={item.href}
                    bundle={item.bundle}
                    img={item.img}
                  />
                 </View>
                )}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  gap: 8,
                }}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                  <RefreshControl
                    refreshing={packageFetching}
                    onRefresh={packageRefetch}
                  />
                }
                ListEmptyComponent={
                  <View style={{ alignItems: "center", marginTop: 80 }}>
                    <EmptyState stateData={emptyStateData} />
                  </View>
                }
              />
            </View>
            <View style={styles.flexGrow}>
                 <View style={styles.searchinputWrapper}>
                <SearchWithFilter
                        value={searchText}
                        onChangeText={(text: string) => setSearchText(text)}
                        placeholder={"Search by product name"}
                        onFilterPress={() => {}}
                      />
                {/* <SearchInput
                  border
                  value={searchText}
                  cross={true}
                  onChangeText={(text: string) => setSearchText(text)}
                  onClear={() => setSearchText("")}
                  returnKeyType="search"
                  placeholder={"Search by product name"}
                /> */}
              </View>
                      <RefreshableContent
                        isEmpty={packingSummary.length === 0}
                        refreshing={isFetching}
                        onRefresh={refetch}
                        emptyComponent={
                            <View style={styles.emptyStateWrapper}>
                          <EmptyState
                          style={{marginTop: -(screenHeight/ 7)}}
                            image={noPackageImage}
                            stateData={{
                              title: "No packages",
                              description: "Packages will appear here.",
                            }}
                          />
                          </View>
                        }
                        listComponent={
                        <ItemsFlatList
                        isPacking
                        items={packingSummary}
                      />

                        }
                      />
                    </View>
          </Tabs>
        </View>
        <DetailsToast
          type={toastType}
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
        <BottomSheet color="green" />
        {(isLoading ||
          productPackageFetching ||
          productsFetching ||
          frozenChambersFetching ||
          isSummaryFetching ||
          rmLoading ||
          isProductLoading) && (
          <View style={styles.overlay}>
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  flexGrow: {
    flex: 1,
  },
  searchinputWrapper: {
    height: 44,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  packagesRow: {
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  content: {
    flexDirection: "column",
    gap: 16,
    height: "100%",
  },

  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storageColumn: {
    flexDirection: "column",
    gap: 16,
    paddingVertical: 24,
    flex: 1,
  },
  rawMaterialColumn: {
    flexDirection: "column",
    flex: 1,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
  Vstack: {
    flexDirection: "column",
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  justifyCenter: {
    justifyContent: "center",
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },

  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    paddingTop: 16,
  },
  card: {
    backgroundColor: getColor("green"),
    borderRadius: 16,
  },
  firstCard: {
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  cardHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardBody: {
    backgroundColor: getColor("light"),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 8,
    flexDirection: "column",
    gap: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityCard: {
    boxShadow: "0px 6px 6px -3px rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: getColor("green", 100),
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: getColor("light", 400),
    flex: 1,
    gap: 16,
  },
  packageWrapper: {
    paddingHorizontal: 12,
    gap: 8,
  },
  sizeQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packageRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  separator: {
    height: 1,
    backgroundColor: getColor("green", 100),
  },
  inlineEmptyState: {
    height: 200,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  }, 
  emptyStateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
}); 
  export default PackageScreen;