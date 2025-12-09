// 1. React and React Native core
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

// 3. Project components
import Input from "@/src/components/ui/Inputs/Input";
import Select from "@/src/components/ui/Select";
import StepLineComponent from "@/src/components/ui/StepLineComponent";
import EmptyState from "@/src/components/ui/EmptyState";
import DetailsToast from "@/src/components/ui/DetailsToast";
import Loader from "@/src/components/ui/Loader";
import BottomSheet from "@/src/components/ui/BottomSheet";
import FormField from "@/src/sbc/form/FormField";

// 4. Project hooks
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useProductItems } from "@/src/hooks/productItems";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
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
import { usePackedItems } from "@/src/hooks/packedItem";
import AddProductsForSell from "../AddProductsForSell";

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

  const { product: selectedProduct } =
    useSelector((state: RootState) => state.product);

  const { data: packedItemsData ,isFetching: packedItemsLoading } = usePackedItems();

const filteredPackedItemsData = useMemo(() => {
  return packedItemsData?.map(item => ({
    ...item,
    chamber: item.chamber.filter(
      chamber => !chamber.id.toLowerCase().includes("dry")
    )
  }));
}, [packedItemsData]);

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

  async function handleToggleProductBottomSheet() {
    console.log("filteredPackedItemsData", JSON.stringify(filteredPackedItemsData));
    
    const ADD_PRODUCT = {
        sections: [
            {
                type: 'title-with-details-cross',
                data: {
                    title: "Add Products"
                },
            },
            {
                type: 'search',
                data: { searchTerm: '', placeholder: "Search Product", searchType: "add-product" },
            },
            {
                type: 'optionList',
                data: {
                    isCheckEnable: false,
                    route: "product",
                    options: filteredPackedItemsData && filteredPackedItemsData?.length > 0 ? filteredPackedItemsData?.map((item) => item.product_name) : []
                }
            },
        ]
    };

    setIsLoading(true);
    dispatch(setSource("choose"));
    await validateAndSetData("Abc1", "add-product", ADD_PRODUCT);
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

const itemsToRender = useMemo(() => {
  if (!filteredPackedItemsData || filteredPackedItemsData.length === 0) return [];

  const selectedNames = new Set(
    (values.products || []).map((p) => p.name)
  );

  return filteredPackedItemsData.filter((p) =>
    selectedNames.has(p.product_name)
  );
}, [filteredPackedItemsData, values.products]);

const handleRemoveProduct = (productName: string) => {
  const nextProducts =
    (values.products || []).filter((p) => p.name !== productName);

  setField("products", nextProducts);
};

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
           {itemsToRender?.length > 0 ? (
              itemsToRender.map((value, index) => (
                <AddProductsForSell
                  key={value.id ?? index}
                  isOpen={openTab === index}
                  isFirst={index === 0}
                  onPress={() => setOpenTab(index)}
                  setToast={handleToggleToast}
                  product={value}
                  controlledForm={{ values, setField, errors }}
                  onRemove={() => handleRemoveProduct(value.product_name)} 
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
      {(isLoading || packedItemsLoading || packedItemsLoading) && (
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
