// 1. React and React Native core
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
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
import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";
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
import { PackageItem } from "@/src/types";
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
import { useCreatePackedItem } from "@/src/hooks/packedItem";
import { resetPackageSizes } from "@/src/redux/slices/bottomsheet/package-size.slice";
import { RefreshControl } from "react-native-gesture-handler";

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

interface PackedChamber {
  id: string;
  quantity: number | string;
}

export type StorageForm = {
  image: string;
  product_name: string;
  packages: PackageItem[];
  products: Product[];
  packedChambers?: PackedChamber[];
};

const convertToKg = (size: number, unit: string) => {
  const lowerUnit = unit?.toLowerCase();
  if (lowerUnit === "kg") return size;
  if (lowerUnit === "gm") return size / 1000;
  return 0;
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

const validateProductChambers = (products: Product[]): boolean => {
  if (!Array.isArray(products) || products?.length === 0) return false;

  return products.every((product: Product) => {
    if (
      !product.name ||
      !Array.isArray(product.chambers) ||
      product.chambers?.length === 0
    ) {
      return false;
    }

    const hasValidQuantity = product.chambers.some((chamber: Chamber) => {
      const quantity = Number(chamber.quantity);
      const storedQuantity = Number(chamber.stored_quantity);

      if (
        !chamber.id ||
        !chamber.name ||
        isNaN(quantity) ||
        isNaN(storedQuantity)
      ) {
        return false;
      }

      return quantity > 0 && quantity <= storedQuantity;
    });

    return hasValidQuantity;
  });
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
  const [searchText, setSearchText] = useState("");
  const {
    data: packageData,
    isLoading: packageLoading,
    fromCache,
    refetch: packageRefetch,
    isFetching: packageFetching,
  } = usePackages(searchText);

  const storageRMRating = useSelector(
    (state: RootState) => state.StorageRMRating.storageRmRating
  );
  const {
    productPackages,
    isLoading: productPackagesLoading,
    refetch: productPackageRefetch,
    isFetching: productPackageFetching,
  } = useProductPackage();
  const { mutate: createPacked, isPending, error } = useCreatePackedItem();

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

  const { data: frozenChambers, isLoading: frozenLoading, refetch: frozenChambersRefetch, isFetching: frozenChambersFetching } =
    useFrozenChambers();

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

const {
  rawMaterials,
  isLoading: rmInitialLoading,
  refetch: refetchRM,
  isFetching: rmLoading
} = useRawMaterialByProduct(selectedProduct);

  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );

 const {
  summaries: choosedChamberSummary,
  refetch: refetchSummary,
  isFetching: isSummaryFetching
} = useChambersSummary(choosedChambers);

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
        products: [
          {
            type: "custom" as const,
            validate: (products: Product[]) => {
              if (!Array.isArray(products) || products?.length === 0) {
                return false;
              }
              return validateProductChambers(products);
            },
            message:
              "Each product must have a valid name and at least one chamber with quantity > 0 (not exceeding stored quantity).",
          },
        ],
        image: [],
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

  const getMaxPackagesFor = (pkg: PackageItem) => {
    const match = productPackages?.find(
      (pp) => pp.rawSize === pkg.rawSize && pp.unit === pkg.unit
    );
    if (!match) return null;

    const stored = Number(match.stored_quantity) || 0;
    const size = Number(pkg.size) || 1;

    return Math.floor(stored / size);
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
            keyboardType: "number-pad",
            label_second: "Unit",
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

  const itemsToRender = useMemo(() => {
    if (!product_items || product_items?.length === 0) return [];

    if (product_items?.length === 1) {
      return [product_items[0]];
    } else {
      const count = selectedRawMaterials?.length || 0;
      return product_items.slice(0, count);
    }
  }, [product_items, selectedRawMaterials]);

  // --- PACKAGE LOGIC (TOP LEVEL) ---

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

  const handlePackageQuantityChange = useCallback(
    (index: number, text: string) => {
      const numeric = parseFloat(text.replace(/[^0-9.]/g, "") || "0");

      if (isNaN(numeric)) return;

      const updatedPackages = [...(values.packages || [])];
      const currentPackage = updatedPackages[index];
      if (!currentPackage) return;

      const newTotalKg = updatedPackages.reduce((sum, pkg, i) => {
        const qty = i === index ? numeric : Number(pkg.quantity) || 0;
        return sum + convertToKg(Number(pkg.size), pkg.unit!) * qty;
      }, 0);

      if (newTotalKg > totalPackedQuantity) {
        showToast(
          "error",
          "Total package quantity (in KG) cannot exceed total packed chamber quantity!"
        );
        return;
      }

      updatedPackages[index] = {
        ...currentPackage,
        quantity: String(numeric),
      };

      setField("packages", updatedPackages);
    },
    [values.packages, setField, totalPackedQuantity]
  );

  const handleRemovePackage = (index: number) => {
    const updatedPackages =
      values.packages?.filter((_, i) => i !== index) || [];
    setField("packages", updatedPackages);
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
          data: productPackages?.map((pack) => {
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
              isChecked: false,
            };
          }),
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
      const result = validateForm();

      if (result.success) {
        const formData = result.data as StorageForm;

        const ratingValue =
          storageRMRating?.rating != null ? Number(storageRMRating.rating) : 5;

        const productsWithRating = (formData.products || []).map((p) => ({
          ...p,
          chambers: (p.chambers || []).map((ch) => ({
            ...ch,
            rating: ratingValue,
          })),
        }));
        

        const packedChambersWithId = (choosedChamberSummary || [])
          .map((ch, idx) => ({
            id: String(ch.chamber_id),
            quantity: Number(formData.packedChambers?.[idx]?.quantity || 0),
          }))
          .filter((item) => item.quantity > 0);

        const finalPayload: StorageForm = {
          ...formData,
          products: productsWithRating,
          packedChambers: packedChambersWithId,
        };
        // console.log("finalPayload", JSON.stringify(finalPayload, null, 2));

        setIsLoading(true);
        createPacked(finalPayload);
        setIsLoading(false);

        resetForm();

        dispatch(clearProduct());
        dispatch(setRawMaterials([]));

        dispatch(resetPackageSizes());
        dispatch(clearChambers());
        dispatch(setSource("choose"));

        setSearchText("");
        setOpenTab(0);
        showToast("success", "Packed item created!");
      }
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

const selectedLabel = selectedProduct || "Select products";

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
            tabTitles={["Stock", "Packing material"]}
            color="green"
            style={styles.flexGrow}
          >
            <View style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                  <RefreshControl
                    refreshing={productPackageFetching || productsFetching || frozenChambersFetching || isSummaryFetching || rmLoading}
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
                    style={{ paddingHorizontal: 16 }}
                    showOptions={false}
                    onPress={handleToggleProductBottomSheet}
                  >
                    Product name
                  </Select>
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
                    Chambers
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

                  <View style={[styles.rawMaterialColumn, styles.borderBottom]}>
                    {product_items?.length > 0 &&
                      selectedRawMaterials.map((item: string) => {
                        const Icon = {
                          "5": FiveStarIcon,
                          "4": FourStarIcon,
                          "3": ThreeStarIcon,
                          "2": TwoStarIcon,
                          "1": OneStarIcon,
                        }[storageRMRating?.rating];
                        return (
                          <ItemsRepeater
                            key={item}
                            title={item}
                            description={item}
                            noValue={true}
                          >
                            <View style={styles.cardBody}>
                              <Select
                                value={storageRMRating?.message || "Excellent"}
                                style={{ flex: 0.5 }}
                                showOptions={false}
                                onPress={() =>
                                  validateAndSetData(
                                    storageRMRating?.rating || "5",
                                    "storage-rm-rating"
                                  )
                                }
                                preIcon={Icon ?? FiveStarIcon}
                              />

                              <View style={styles.separator} />
                              {itemsToRender?.length > 0 &&
                                itemsToRender.map((value, index) => {
                                  const productIndex =
                                    values.products?.findIndex(
                                      (p) => p.name === value?.name
                                    );
                                  const currentProduct = values.products?.[
                                    productIndex
                                  ] || { packages: [], chambers: [] };

                                  return (
                                    <View style={styles.Vstack} key={index}>
                                      {currentProduct.chambers?.map(
                                        (chamber, idx) => (
                                          <View
                                            key={`${index}-${idx}`}
                                            style={[
                                              styles.chamberCard,
                                              styles.borderBottom,
                                            ]}
                                          >
                                            <View style={styles.Hstack}>
                                              <View style={styles.iconWrapper}>
                                                <ChamberIcon
                                                  color={getColor("green")}
                                                  size={32}
                                                />
                                              </View>
                                              <View style={styles.Vstack}>
                                                <B1>
                                                  {String(chamber.name).slice(
                                                    0,
                                                    12
                                                  )}
                                                  ...
                                                </B1>
                                                <B4>
                                                  {chamber.stored_quantity}kg
                                                </B4>
                                              </View>
                                            </View>
                                            <View style={{ flex: 0.7 }}>
                                              <FormField
                                                name={`products.${productIndex}.chambers.${idx}.quantity`}
                                                form={{
                                                  values,
                                                  setField,
                                                  errors,
                                                }}
                                              >
                                                {({
                                                  value,
                                                  onChange,
                                                  error,
                                                }) => (
                                                  <Input
                                                    placeholder="Qty."
                                                    addonText="KG"
                                                    value={
                                                      value === 0 ||
                                                      value === null ||
                                                      value === undefined
                                                        ? ""
                                                        : String(value)
                                                    }
                                                    onChangeText={(
                                                      text: string
                                                    ) => {
                                                      const numeric =
                                                        text.replace(
                                                          /[^0-9.]/g,
                                                          ""
                                                        );
                                                      const enteredValue =
                                                        numeric === ""
                                                          ? 0
                                                          : parseFloat(numeric);
                                                      const maxQuantity =
                                                        Number(
                                                          chamber.stored_quantity
                                                        );
                                                      if (
                                                        enteredValue >
                                                        maxQuantity
                                                      ) {
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
                                        )
                                      )}
                                    </View>
                                  );
                                })}
                            </View>
                          </ItemsRepeater>
                        );
                      })}
                  </View>

                  {/* --- PACKAGE UI (TOP LEVEL) --- */}
                  <View style={styles.packageWrapper}>
                    <H3>Select package type</H3>
                    <View style={[styles.sizeQtyRow, styles.borderBottom]}>
                      <View style={{ flex: 0.7 }}>
                        <Select
                          showOptions={false}
                          options={["Package size"]}
                          onPress={handleTogglePackageSizeBottomSheet}
                          disabled={selectedProduct?.length === 0}
                        />
                      </View>
                      <View style={styles.quantityCard}>
                        <H6>Packed Qty:</H6>
                        <B4>
                          {totalPackageQuantityKg} / {totalPackedQuantity} kg
                        </B4>
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
                          const Icon = mapPackageIcon(pkg);
                          const maxPackages = getMaxPackagesFor(pkg);

                          const currentQty = Number(
                            values.packages?.[index]?.quantity || 0
                          );
                          const remaining =
                            maxPackages !== null && !Number.isNaN(currentQty)
                              ? maxPackages - currentQty
                              : null;

                          return (
                            <View key={index} style={[styles.packageRow]}>
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
                                  onPress={() => handleRemovePackage(index)}
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
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
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
                <SearchInput
                  border
                  value={searchText}
                  cross={true}
                  onChangeText={(text: string) => setSearchText(text)}
                  onClear={() => setSearchText("")}
                  returnKeyType="search"
                  placeholder={"Search by product name"}
                />
              </View>
              <FlatList
                style={{ flex: 1, paddingHorizontal: 16 }}
                data={formattedData}
                keyExtractor={(item, index) =>
                  item.id?.toString() ?? index.toString()
                }
                renderItem={({ item }) => (
                  <PackageCard
                    name={item.name}
                    id={item.id}
                    href={item.href}
                    bundle={item.bundle}
                    img={item.img}
                  />
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
          packageLoading ||
          !fromCache ||
          isProductLoading ||
          productPackagesLoading) && (
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
    gap: 4,
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
});

export default PackageScreen;