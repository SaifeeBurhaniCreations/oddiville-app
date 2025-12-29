// 1. React and React Native core
import React, { useEffect, useMemo, useState } from "react";
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

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

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
import { useAuth } from "@/src/context/AuthContext";
import { resolveAccess } from "@/src/utils/policiesUtils";
import { removeProduct } from "@/src/redux/slices/multiple-product.slice";

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

  const selectedProducts = useSelector(
    (state: RootState) => state.multipleProduct.selectedProducts
  );

  const { data: packedItemsData, isFetching: packedItemsLoading } =
    usePackedItems();

  const filteredPackedItemsData = useMemo(() => {
    console.log("packedItemsData", JSON.stringify(packedItemsData));

    return packedItemsData?.map((item) => ({
      ...item,
      chamber: item.chamber.filter(
        (chamber) => !chamber.id.toLowerCase().includes("dry")
      ),
    }));
  }, [packedItemsData]);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const [openTab, setOpenTab] = useState<string | null>(null);
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
useEffect(() => {
  if (values.products?.length && openTab === null) {
    const last = values.products[values.products.length - 1];
    setOpenTab(last.id);
  }
}, [values.products]);

  const handleToggleToast = () => {
    showToast(
      "error",
      "Entered quantity exceeds available quantity in chamber!"
    );
  };
  // console.log("filteredPackedItemsData", JSON.stringify(filteredPackedItemsData));

 async function handleToggleProductBottomSheet() {
    const updatedPackedItemsData = filteredPackedItemsData?.map((item) => ({
      ...item,
      packages: item.packages?.map((pkg) => ({
        ...pkg,
        quantity: String(pkg.quantity),
        size: Number(pkg.size),
        chambers: item.chamber,
      })),
    }));
    
    const ADD_PRODUCTS = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Add Products",
          },
        },
        {
          type: "search",
          data: {
            searchTerm: "",
            placeholder: "Search Product",
            searchType: "add-product",
          },
        },
        {
          type: "multiple-product-card",
          data: updatedPackedItemsData?.map((item) => {
                return {
                  product_name: item.product_name,
                  id: item.id,
                  rating: 5,
                  image: item.image,
                  description: "",
                  isChecked: false,
                  packages: item.packages,
                  chambers: item.chamber,
                };
              }),
        },
      ],
      buttons: [
        { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false, actionKey: 'cancel' },
        { text: 'Add', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: 'add-dispatch-product' },
    ],
    };

    setIsLoading(true);
    await validateAndSetData("Abc1", "multiple-product-card", ADD_PRODUCTS);
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

const handleRemoveProduct = (productId: string) => {
  dispatch(removeProduct(productId));
};

  const { role, policies } = useAuth();
  const safeRole = role ?? "guest";
  const safePolicies = policies ?? [];
  const access = resolveAccess(safeRole, safePolicies);
  const canSeeAmount = access.isFullAccess;

  const renderComponent = () => {
    if (handleGetStep === 1) {
      return (
        <View
          style={{
            justifyContent: "space-between",
            // height: "100%",
            flexGrow: 1,
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
                  ETD (Optional)
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
                value={selectedProducts[0]?.product_name || "Select products"}
                style={{ flex: 0.5 }}
                showOptions={false}
                onPress={handleToggleProductBottomSheet}
              >
                Products
              </Select>
            </View>

            {/* {selectedProducts.map((product, index) => (
  <AddProductsForSell
    key={product.id}
    product={product}
    isOpen={openTab === Number(product.id)}
    onPress={() => setOpenTab(Number(product.id))}
    onRemove={() => dispatch(removeProduct(product.id))}
    controlledForm={{ values, setField, errors }}
  />
))} */}

            {values.products?.length > 0 ?
            values.products?.map((value, index) => {
              
              return (
                <AddProductsForSell
                  key={value.id ?? index}
                  isOpen={openTab === value.id}
                  onPress={() => setOpenTab(value.id)}
                  isFirst={index === 0}
                  setToast={handleToggleToast}
                  product={value}
                  controlledForm={{ values, setField, errors }}
                  onRemove={() => handleRemoveProduct(value.id)} 
                />
              )
            })
             : (
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
            )
            }
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
    // height: "100%",
    flexGrow: 1,
  },
  alignCenter: {
    alignItems: "center",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  selectProduct: {
    paddingBottom: 24,
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
