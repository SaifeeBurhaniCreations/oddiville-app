// 1. React and React Native core
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

// 3. Project components
import Input from "@/src/components/ui/Inputs/Input";
import Select from "@/src/components/ui/Select";
import StepLineComponent from "@/src/components/ui/StepLineComponent";
import EmptyState from "@/src/components/ui/EmptyState";
import AddMultipleProducts from "@/src/components/ui/AddMultipleProducts";
import DetailsToast from "@/src/components/ui/DetailsToast";
import Loader from "@/src/components/ui/Loader";
import BottomSheet from "@/src/components/ui/BottomSheet";
import FormField from "@/src/sbc/form/FormField";
import { B1, B4, H3, H6 } from "@/src/components/typography/Typography";
import TrashIcon from "@/src/components/icons/common/TrashIcon";

// 4. Project hooks
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useProductItems, useProductPackage } from "@/src/hooks/productItems";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { mapPackageIcon } from "@/src/utils/common";
import { setSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";

// 6. Types
import type { OrderStorageForm } from "@/app/create-orders";
import { RootState } from "@/src/redux/store";

// 7. Schemas
// No items of this type

// 8. Assets
import noProductImage from "@/src/assets/images/illustrations/no-batch.png";
import {
  clearCity,
  clearState,
  setCitySearched,
  setStateSearched,
} from "@/src/redux/slices/bottomsheet/location.slice";
import { getLimitedMaterialNames } from "@/src/utils/arrayUtils";

const convertToKg = (size: number, unit: string) => {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === "kg") return size;
  if (lowerUnit === "gm") return size / 1000;
  return 0;
};

type ControlledFormProps<T> = {
  values: T;
  setField: (key: string, value: any) => void;
  errors: Partial<Record<keyof T, string>>;
};

export interface SelectedRawMaterial {
  name: string;
}

const CreateFromStorage = ({
  handleGetStep,
  controlledForm,
}: {
  handleGetStep: number;
  controlledForm: ControlledFormProps<OrderStorageForm>;
}) => {
  const dispatch = useDispatch();
  const {
    countries: selectedCountry,
    states: selectedState,
    cities: selectedCity,
  } = useSelector((state: RootState) => state.location);

  const { product: selectedProduct, rawMaterials: selectedRawMaterials } =
    useSelector((state: RootState) => state.product);

  const { productItems: product_items, isLoading: productsLoading } =
    useProductItems();
  const { productPackages, isLoading: packageLoading } = useProductPackage();

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const [openTab, setOpenTab] = useState<number>(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { values, setField, errors } = controlledForm;

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
    if (
      (!product_items ||
        !Array.isArray(product_items) ||
        product_items.length === 0) &&
      selectedProduct
    ) {
      showToast("error", `${selectedProduct} is not in your chambers!`);
    }
  }, [product_items]);

  async function handleToggleProductBottomSheet() {
    setIsLoading(true);
    dispatch(setSource("choose"));
    await validateAndSetData("Abc1", "add-product");
    setIsLoading(false);
  }

  async function handleToggleRMBottomSheet() {
    setIsLoading(true);
    if (!selectedRawMaterials) return;
    const ADD_RAW_MATERIAL = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Add raw materials",
          },
        },
        {
          type: 'search',
          data: { searchTerm: "", placeholder: "Search raw material", searchType: "add-raw-material" },
        },
        {
          type: "productCard",
          data: selectedRawMaterials?.map((rm) => ({
            name: rm,
            description: rm,
            image: rm,
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
          text: "Add",
          variant: "fill",
          color: "green",
          alignment: "half",
          disabled: false,
          actionKey: "add-raw-material",
        },
      ],
    };

    dispatch(setSource("choose"));
    await validateAndSetData("Abc1", "choose-product", ADD_RAW_MATERIAL);
    setIsLoading(false);
  }
  async function handleToggleCountryBottomSheet() {
    setIsLoading(true);
    dispatch(clearState());
    dispatch(clearCity());
    await validateAndSetData("Abc1", "country");
    setIsLoading(false);
  }

  async function handleToggleStateBottomSheet() {
    setIsLoading(true);
    dispatch(clearCity());
    dispatch(setCitySearched(""));
    await validateAndSetData(selectedCountry.isoCode, "state");
    setIsLoading(false);
  }

  async function handleToggleCityBottomSheet() {
    setIsLoading(true);
    dispatch(setStateSearched(""));
    await validateAndSetData(
      `${selectedState.isoCode}:${selectedCountry.isoCode}`,
      "city"
    );
    setIsLoading(false);
  }

  async function handleTogglePackageSizeBottomSheet() {
    setIsLoading(true);
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
          type: 'search',
          data: { searchTerm: "", placeholder: "Search size", searchType: "add-package" },
        },
        {
          type: "package-size-choose-list",
          data: productPackages?.map((pack) => ({
            name: `${pack?.size} ${pack?.unit}`,
            icon: "paper-roll",
            isChecked: false,
          })),
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

  // --- PACKAGE LOGIC (TOP LEVEL) ---

  const totalPackageQuantityKg = useMemo(() => {
    return (values.packages || []).reduce((sum, pkg) => {
      return (
        sum +
        convertToKg(Number(pkg.size), pkg.unit!) * (Number(pkg.quantity) || 0)
      );
    }, 0);
  }, [values.packages]);

  const totalChamberQuantity = useMemo(() => {
    return (values.products || []).reduce((sum, product) => {
      const chambersSum = (product.chambers || []).reduce(
        (chamberSum, chamber) => chamberSum + (Number(chamber.quantity) || 0),
        0
      );

      return sum + chambersSum;
    }, 0);
  }, [values.products]);

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

      if (newTotalKg > totalChamberQuantity) {
        showToast(
          "error",
          "Total package quantity (in KG) cannot exceed total chamber quantity!"
        );
        return;
      }

      updatedPackages[index] = {
        ...currentPackage,
        quantity: String(numeric),
      };

      setField("packages", updatedPackages);
    },
    [values.packages, setField, totalChamberQuantity]
  );

  const handleRemovePackage = (index: number) => {
    const updatedPackages =
      values.packages?.filter((_, i) => i !== index) || [];
    setField("packages", updatedPackages);
  };

  // --- END PACKAGE LOGIC ---

  const itemsToRender = useMemo(() => {
    // console.log("product_items", product_items);

    if (!product_items || product_items?.length === 0) return [];

    if (product_items?.length === 1) {
      return [product_items[0]];
    } else {
      const count = selectedRawMaterials?.length || 0;
      return product_items.slice(0, count);
    }
  }, [product_items, selectedRawMaterials]);

  const renderComponent = () => {
    if (handleGetStep === 1) {
      return (
        <View
          style={{
            justifyContent: "space-between",
            height: "100%",
            paddingHorizontal: 16,
          }}
        >
          <View style={[styles.Vstack]}>
            <FormField name="customer_name" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  placeholder="Enter customer name"
                  value={value || ""}
                  onChangeText={onChange}
                  error={error}
                >
                  Customer Name
                </Input>
              )}
            </FormField>

            <View style={[styles.Hstack]}>
              <FormField name="country" form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Select
                    style={{ flex: 1 }}
                    value={selectedCountry.label || "Select country"}
                    options={[]}
                    onPress={() => {
                      handleToggleCountryBottomSheet();
                      onChange(selectedCountry);
                    }}
                    showOptions={false}
                    error={error}
                  >
                    Country
                  </Select>
                )}
              </FormField>

            </View>
            <View style={[styles.Hstack]}>
              <FormField name="state" form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Select
                    style={{ flex: 1 }}
                    value={selectedState.name || "Select state"}
                    options={[]}
                    onPress={() => {
                      handleToggleStateBottomSheet();
                      onChange(selectedState);
                    }}
                    showOptions={false}
                    error={error}
                  >
                    State
                  </Select>
                )}
              </FormField>
              <FormField name="city" form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Select
                    style={{ flex: 1 }}
                    value={selectedCity || "Select city"}
                    options={[]}
                    onPress={() => {
                      handleToggleCityBottomSheet();
                      onChange(selectedCity);
                    }}
                    showOptions={false}
                    error={error}
                  >
                    City
                  </Select>
                )}
              </FormField>
            </View>
            <FormField name="address" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <Input
                  placeholder="Enter address"
                  value={value || ""}
                  onChangeText={onChange}
                  error={error}
                >
                  Address
                </Input>
              )}
            </FormField>
            
            <FormField
              name="est_delivered_date"
              form={{ values, setField, errors }}
            >
              {({ value, onChange, error }) => (
                <Input
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Select date"
                  mask="date"
                  error={error}
                >
                  Est. delivered date (Optional)
                </Input>
              )}
            </FormField>
          </View>
        </View>
      );
    } else {
      return (
        <View style={{ justifyContent: "space-between", height: "100%" }}>
          <View style={[styles.Vstack]}>
            <View style={[styles.Vstack, styles.selectProduct]}>
              <Select
                value={selectedProduct || "Select products"}
                style={{ flex: 0.5 }}
                showOptions={false}
                onPress={handleToggleProductBottomSheet}
              >
                Products
              </Select>
              <Select
                style={{ flex: 0.5 }}
                value={
                  getLimitedMaterialNames(selectedRawMaterials, 10) ||
                  "Select raw material"
                }
                showOptions={false}
                onPress={handleToggleRMBottomSheet}
                disabled={selectedProduct?.length === 0}
                options={["Select RM"]}
              >
                Raw Materials
              </Select>
            </View>
            <View style={[styles.borderBottom, { paddingHorizontal: 12 }]}>
              <FormField name={`amount`} form={{ values, setField, errors }}>
                {({ value, onChange, error }) => (
                  <Input
                    placeholder="Enter amount"
                    value={
                      value === 0 || value === null || value === undefined
                        ? ""
                        : String(value)
                    }
                    addonText="Rs"
                    onChangeText={(text: string) => {
                      onChange(text);
                    }}
                    error={error}
                    keyboardType="decimal-pad"
                    mask="addon"
                    post
                  />
                )}
              </FormField>
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
                  <H6>Ordered Qty:</H6>
                  <B4>
                    {totalPackageQuantityKg} / {totalChamberQuantity} kg
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
                    stateData={{
                      title: "No packages added. Add from above.",
                      description: "",
                    }}
                  />
                ) : (
                  values.packages.map((pkg, index) => {
                    const Icon = mapPackageIcon(pkg);
                    return (
                      <View key={index} style={[styles.packageRow]}>
                        <View style={styles.row}>
                          <View style={styles.iconWrapper}>
                            {Icon && (
                              <Icon color={getColor("green")} size={28} />
                            )}
                          </View>
                          <B1>
                            {pkg.size} {pkg.unit}
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
                          <Pressable onPress={() => handleRemovePackage(index)}>
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
            {itemsToRender?.length > 0 ? (
              itemsToRender.map((value, index) => (
                <AddMultipleProducts
                  key={index}
                  isOpen={openTab === index}
                  isFirst={index === 0}
                  onPress={() => setOpenTab(index)}
                  setToast={handleToggleToast}
                  product={value}
                  controlledForm={{ values, setField, errors }}
                />
              ))
            ) : (
              <View
                style={[
                  styles.Vstack,
                  styles.alignCenter,
                  styles.justifyCenter,
                ]}
              >
                <EmptyState
                  stateData={{ title: "No products selected", description: "" }}
                  image={noProductImage}
                />
              </View>
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <>
      <ScrollView>
        <View style={[styles.MainWrapper]}>
          <View style={{ paddingHorizontal: 16 }}>
            <StepLineComponent count={2} active={handleGetStep} />
          </View>
          {renderComponent()}
        </View>
        <DetailsToast
          type={toastType}
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
        <BottomSheet color="green" />
      </ScrollView>
      {(isLoading || productsLoading || packageLoading) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}
    </>
  );
};

export default CreateFromStorage;

const styles = StyleSheet.create({
  Vstack: {
    flexDirection: "column",
    gap: 16,
  },
  Hstack: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  MainWrapper: {
    paddingVertical: 12,
    gap: 16,
    height: "100%",
  },
  alignCenter: {
    alignItems: "center",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  selectProduct: {
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.1),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
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
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },
  packageWrapper: {
    paddingHorizontal: 12,
    gap: 8,
  },
});
