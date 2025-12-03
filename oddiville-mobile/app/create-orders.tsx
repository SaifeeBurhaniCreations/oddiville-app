// 1. React and React Native core
import React, { useEffect, useState, useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { useDispatch, useSelector } from "react-redux";
import { parse, isValid as isDateValid, startOfDay } from "date-fns";

// 3. Project components
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import Tabs from "@/src/components/ui/Tabs";
import RadioGroup from "@/src/components/ui/RadioGroup";
import CreateFromStorage from "@/src/components/ui/dispatch-order/CreateFromStorage";
import Button from "@/src/components/ui/Buttons/Button";
import DetailsToast from "@/src/components/ui/DetailsToast";

// 4. Project hooks
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useMultiStepFormValidator } from "@/src/sbc/form";
import {
  useProductItems,
  useProductPackage,
  useRawMaterialByProduct,
} from "@/src/hooks/productItems";
import { useDispatchOrder } from "@/src/hooks/dispatchOrder";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";

// 6. Types
import { RootState } from "@/src/redux/store";
import { CountryProps, PackageItem } from "@/src/types";

// 7. Schemas
// No items of this type

// 8. Assets
// No items of this type

// Redux slice actions
import { clearLocations } from "@/src/redux/slices/bottomsheet/location.slice";
import { clearRawMaterials } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import {
  clearProduct,
  setRawMaterials,
} from "@/src/redux/slices/product.slice";

interface Chamber {
  id: string | number;
  name: string | number;
  stored_quantity: number | string;
  quantity: number | string;
}

interface Product {
  name: string;
  chambers: Chamber[];
}

export type OrderStorageForm = {
  customer_name: string;
  amount: string;
  product_name: string;
  est_delivered_date: string;
  address: string;
  country: CountryProps;
  state: string | { name: string; isoCode: string };
  city: string | { name: string; isoCode: string };
  packages: PackageItem[];
  products: Product[];
  postal_code: string;
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

const calculateTotalOrderQuantity = (products: Product[]): number => {
  if (!Array.isArray(products) || products?.length === 0) return 0;

  return products.reduce((total, product) => {
    return (
      total +
      product.chambers.reduce((productTotal, chamber) => {
        const quantity = Number(chamber.quantity) || 0;
        return productTotal + quantity;
      }, 0)
    );
  }, 0);
};

const CreateOrder = () => {
  const [step, setStep] = useState<number>(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const { productItems, isLoading: productLoading } = useProductItems();
  const { productPackages, isLoading: packageLoading } = useProductPackage();
  const { goTo } = useAppNavigation();
  const {
    countries: selectedCountry,
    states: selectedState,
    cities: selectedCity,
  } = useSelector((state: RootState) => state.location);
  const { product: selectedProduct } = useSelector(
    (state: RootState) => state.product
  );
  const productsInitialized = useRef(false);
  const dispatch = useDispatch();
  const productPackagesInitialized = useRef(false);
  const dispatchOrder = useDispatchOrder();
  const rawMaterials = useRawMaterialByProduct(selectedProduct);
  const selectedPackage = useSelector(
    (state: RootState) => state.packageSize.selectedSizes
  );
  const storeRawMaterials = useSelector(
    (state: RootState) => state.product.rawMaterials
  );

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  useEffect(() => {
    if (selectedCountry?.label && selectedCountry?.icon) {
      setField("country", selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setField("state", selectedState);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity) {
      setField("city", selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (JSON.stringify(storeRawMaterials) !== JSON.stringify(rawMaterials)) {
      dispatch(setRawMaterials(rawMaterials));
    }
  }, [dispatch, rawMaterials, storeRawMaterials]);

  const {
    values,
    setField,
    errors,
    validateCurrentStep,
    validateForm,
    isValid,
    isCurrentStepValid,
    resetForm,
  } = useMultiStepFormValidator<OrderStorageForm>(
    {
      customer_name: "",
      product_name: "",
      amount: "",
      est_delivered_date: "",
      address: "",
      country: selectedCountry ?? { label: "India", icon: "", isoCode: "IN" },
      packages: [],
      products: [],
      state: "",
      city: "",
      postal_code: "",
    },
    {
      customer_name: [
        { type: "required" as const, message: "Customer name is required!" },
        {
          type: "minLength" as const,
          length: 2,
          message: "Customer name must be at least 2 characters!",
        },
      ],
      amount: [
        { type: "required" as const, message: "Amount is required!" },
        {
          type: "custom" as const,
          validate: (val: string) => {
            const amount = Number(val);
            return !isNaN(amount) && amount > 0;
          },
          message: "Amount must be a valid positive number!",
        },
      ],
      packages: [
        {
          type: "custom" as const,
          validate: (value: any, allValues: Record<string, any>) => {
            const packages: PackageItem[] = value;
            const formValues = allValues as OrderStorageForm;

            if (!Array.isArray(packages) || packages.length === 0) {
              return false;
            }

            const hasValidFields = packages.every(
              (pkg) =>
                pkg &&
                pkg.size !== null &&
                pkg.size !== undefined &&
                pkg.size !== "" &&
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

            const totalOrderQuantity = formValues?.products
              ? calculateTotalOrderQuantity(formValues.products)
              : 0;

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
      est_delivered_date: [
        {
          type: "custom" as const,
          validate: (val: string) => {
              if (!val) return true;

              const parsedDate = parse(val, "MMM dd, yyyy", new Date());
              if (!isDateValid(parsedDate)) return false;

              const today = startOfDay(new Date());
              const selected = startOfDay(parsedDate);

              return selected >= today;
          },
          message: "Delivery date cannot be in the past!",
        },
      ],
      address: [
        { type: "required" as const, message: "Address is required!" },
        {
          type: "minLength" as const,
          length: 10,
          message: "Address must be at least 10 characters!",
        },
      ],
      country: [
        {
          type: "custom" as const,
          validate: (val: CountryProps) => !!val?.label && !!val?.isoCode,
          message: "Please select a country!",
        },
      ],
      state: [
        // {
        //     type: 'custom' as const,
        //     validate: (val: string) => !!val && val?.length > 0,
        //     message: 'Please select a state!',
        // }
      ],
      city: [
        {
          type: "custom" as const,
          validate: (val: string) => !!val && val?.length > 0,
          message: "Please select a city!",
        },
      ],
      postal_code: [
        {
          type: "required" as const,
          message: "Postal code is required!",
        },
        // Optional validation - can be uncommented when needed
        // {
        //     type: 'pattern' as const,
        //     pattern: /^\d{6}$/,
        //     message: "Postal code must be exactly 6 digits!"
        // },
      ],
    },
    {
      1: [
        "customer_name",
        "address",
        "country",
        "state",
        "city",
        "postal_code",
        "est_delivered_date",
      ],
      2: ["products", "product_name", "packages", "amount"],
    } as Record<number, (keyof OrderStorageForm)[]>,
    {
      validateOnChange: true,
      debounce: 300,
    }
  );

  useEffect(() => {
    if (productLoading) return;
    if (
      !productsInitialized.current &&
      values.products?.length === 0 &&
      productItems?.length > 0
    ) {
      setField("products", productItems);
      productsInitialized.current = true;
    }
  }, [productLoading, productItems]);

  useEffect(() => {
    if (!productPackages || !selectedPackage) return;

    const updated = selectedPackage
      .map((sp) => {
        const match = productPackages.find(
          (pp) => pp.size === sp.size && pp.unit === sp.unit
        );
        if (!match) return null;

        const existing = values.packages?.find(
          (p) => p.size === sp.size && p.unit === sp.unit
        );
        return {
          ...match,
          quantity: existing?.quantity ?? "",
        };
      })
      .filter(Boolean);

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

  useEffect(() => {
    if (!selectedProduct || !selectedProduct?.length) return;
    setField("product_name", selectedProduct);
  }, [selectedProduct]);

  const onSubmit = () => {
    const updatedValues = {
      ...values,
      country: selectedCountry,
      state: selectedState?.name,
      city: selectedCity,
    };
    const result = validateCurrentStep(updatedValues);

    if (result.success) {
      showToast("info", "Move to step 2!");
      setStep(2);
    }
  };

  const onFinalSubmit = async () => {
    const amount = values?.amount;
    const quantity = values?.products[0].chambers.reduce(
      (sum, chamber) => sum + Number(chamber.quantity),
      0
    );

    const calculated_amount = Number(amount);
    const newValue = { ...values, amount: String(calculated_amount) };
    const result = validateForm(newValue);
    // console.log('final Data befor validate', newValue);
    // console.log('success', result);
    // console.log('success', result.success);
    // console.log('final Data', result.data);
    // return;

    if (result.success) {
      try {
        dispatchOrder.mutate(result.data, {
          onSuccess: (result) => {
            resetForm();
            dispatch(clearLocations());
            dispatch(clearRawMaterials());
            dispatch(clearProduct());
            goTo("admin-orders");
          },
          onError: (error) => {
            showToast("error", "Failed to dispatch order");
          },
        });
      } catch (error) {
        console.log("✅ Final form data:", JSON.stringify(result.data));
      }
      showToast("info", "Dispatch Order created!");
    } else {
      setToastVisible(true);
      setToastType("error");
      setToastMessage(Object.values(result.errors).join("\n"));
    }
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Create Dispatch"} />
      <View style={styles.wrapper}>
        <View style={[styles.HStack, { paddingHorizontal: 16 }]}>
          <View style={{ paddingBottom: 8 }}>
            <BackButton
              label="Create product"
              backRoute=""
              onPress={() => {
                step === 2 ? setStep(1) : goTo("admin-orders");
              }}
            />
          </View>
        </View>
        {/* <Tabs
                    color="green"
                    variant="ghost"
                    renderTabHeader={({ activeTab, setActiveTab }) => (
                        <RadioGroup
                            style={{paddingHorizontal: 16, paddingVertical: 16}}
                            options={options}
                            selected={activeTab}
                            onSelect={(selected) =>
                            setActiveTab(options.findIndex((opt) => opt.text === selected))
                            }
                        />
                        )
                    }
                >
                </Tabs> */}
        <CreateFromStorage
          handleGetStep={step}
          controlledForm={{ values, setField, errors }}
        />
        <View style={{ paddingHorizontal: 16 }}>
          {step === 1 ? (
            <Button
              onPress={onSubmit}
              variant="fill"
              disabled={!isCurrentStepValid}
            >
              Next
            </Button>
          ) : (
            <Button
              onPress={onFinalSubmit}
              disabled={dispatchOrder.isPending}
              variant="fill"
            >
              {dispatchOrder.isPending ? "Creating Dispatch..." : "Create Dispatch"}
            </Button>
          )}
        </View>
      </View>
      <DetailsToast
        type={toastType}
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

export default CreateOrder;

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
});
