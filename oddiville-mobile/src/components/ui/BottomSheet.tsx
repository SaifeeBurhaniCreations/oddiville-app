import React, { useCallback, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Pressable,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";

import Button from "./Buttons/Button";
import {
  BottomSheetProps,
  ButtonConfig,
  sectionComponents,
  SectionConfig,
} from "@/src/types";
import { closeBottomSheet } from "@/src/redux/slices/bottomsheet.slice";
import { AppDispatch, RootState } from "@/src/redux/store";

import { useDispatch, useSelector } from "react-redux";
import { getColor } from "@/src/constants/colors";
import ConditionalWrapperComponent from "./bottom-sheet/ConditionalWrapperComponent";
import { useBottomSheetActions } from "@/src/hooks/useBottomSheetActions";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import {
  isFormInitialized,
  useGlobalFormsStore,
  ValidationRule,
} from "@/src/sbc/form";
import { isFormValid } from "@/src/sbc/form/globalFormUtils";
import { clearUnit } from "@/src/redux/slices/unit-select.slice";
import {
  clearChambers,
} from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { setIsChamberSelected } from "@/src/redux/slices/chamber.slice";
import { clearInputBottomSheet } from "@/src/utils/clearBottomSheetUtils";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";
import {
  AddPackageSizeForm,
  AddProductPackageForm,
} from "./bottom-sheet/InputWithSelectComponent";
import { RESET_FORM_ENUM } from "@/src/constants/resetFormEnum";
import { ChamberQty } from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";

import { optionListEnumKeys } from "@/src/types";
import { Dimensions } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

function filterOptions<T extends optionListEnumKeys>(
  options: T,
  search: string
): T {
  if (options?.length === 0) return options;
  if (typeof options[0] === "string") {
    return (options as string[]).filter((opt) =>
      (opt as string).includes(search)
    ) as T;
  }
  return (options as { name: string; isoCode: string }[]).filter((opt) =>
    opt.name.includes(search)
  ) as T;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ color }) => {
  const selectedRawMaterials = useSelector(
    (state: RootState) => state.rawMaterial.selectedRawMaterials
  );
  const selectedChambers = useSelector(
    (state: RootState) => state.rawMaterial.selectedChambers
  );
  const { isProductLoading } = useSelector((state: RootState) => state.product);
  const { slectedUnit } = useSelector((state: RootState) => state.selectUnit);
  const { product } = useSelector((state: RootState) => state.storeProduct);

  const { stateSearched, citySearched, countrySearched } = useSelector(
    (state: RootState) => state.location
  );

  const { source } = useSelector((state: RootState) => state.rawMaterial);

  const packageFormValidator = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );
  const packageSizeValidator =
    useGlobalFormValidator<AddPackageSizeForm>("add-package-size");
  const dispatch = useDispatch<AppDispatch>();
  const { isVisible, config, meta } = useSelector(
    (state: RootState) => state.bottomSheet
  );
  const chamberQuantity = useSelector(
    (state: RootState) => state.chamberRatings.chamberQty
  );
  const rawMaterialSearch = useSelector(
    (state: RootState) => state.rawMaterialSearch.searchTerm
  );
  const ProductSearched = useSelector(
    (state: RootState) => state.productSearch.productSearched
  );

  const PackageSizeSearched = useSelector(
    (state: RootState) => state.packageSizeSearch.packageSizeSearched
  );
  const packageTypeProduction = useSelector((state: RootState) => state.packageTypeProduction.selectedPackageType);

  const { runAction } = useBottomSheetActions(meta);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const toggleModal = () => {
    const { resetForm } =
      meta?.type === "add-product-package"
        ? packageFormValidator
        : packageSizeValidator;
    if (meta?.type && meta.type !== "") {
      if (RESET_FORM_ENUM.includes(meta?.type)) {
        clearInputBottomSheet(meta?.type, dispatch, resetForm);
      } else {
        clearInputBottomSheet(meta?.type, dispatch);
      }
    }
    dispatch(closeBottomSheet());
  };

  useEffect(() => {
    if (!isFormInitialized("add-product-package")) {
      useGlobalFormsStore.getState().initializeForm(
        "add-product-package",
        {
          product_name: "",
          size: "",
          quantity: "",
          raw_materials: [],
          unit: "",
          chamber_name: "",
        },
        {
          product_name: [
            { type: "required", message: "Product name required !" },
          ],
          size: [{ type: "required", message: "Package title required !" }],
          quantity: [{ type: "required", message: "add atleast 1 packet !" }],
          raw_materials: [
            {
              type: "custom",
              validate: (val) => Array.isArray(val) && val?.length > 0,
              message: "Select at least one raw material",
            },
          ],
          unit: [{ type: "required", message: "Unit required !" }],
          chamber_name: [{ type: "required", message: "Chamber required !" }],
        },
        {
          validateOnChange: true,
          debounce: 300,
        }
      );
    }

    if (!isFormInitialized("add-package-size")) {
      useGlobalFormsStore.getState().initializeForm(
        "add-package-size",
        {
          size: "",
          quantity: "",
          unit: "",
        },
        {
          size: [{ type: "required", message: "Package title required !" }],
          quantity: [{ type: "required", message: "add atleast 1 packet !" }],
          unit: [{ type: "required", message: "Unit required !" }],
        },
        {
          validateOnChange: true,
          debounce: 300,
        }
      );
    }

    if (!isFormInitialized("add-package-quantity")) {
      useGlobalFormsStore.getState().initializeForm(
        "add-package-quantity",
        {
          quantity: "",
        },
        {
          quantity: [{ type: "required", message: "add atleast 1 packet !" }],
        },
        {
          validateOnChange: true,
          debounce: 300,
        }
      );
    }

    type ChamberValue = { quantity: number; rating: number };
    type StoreProductFormFields = Record<string, ChamberValue | number>;

    const initialValues: StoreProductFormFields = {
      ...selectedChambers.reduce((acc, chamberName) => {
        acc[chamberName] = { quantity: 0, rating: 0 };
        return acc;
      }, {} as Record<string, ChamberValue>),
      discard_quantity: 0,
      packaging_type: 0,
      packaging_quantity: 0,
    };

    const validationRules: Partial<
      Record<
        keyof StoreProductFormFields,
        ValidationRule<StoreProductFormFields>[]
      >
    > = {
      discard_quantity: [
        {
          type: "custom",
          validate: (value: any) =>
            value !== null && value !== undefined && value >= 0,
          message: "Wastage quantity must be zero or more",
        },
      ],
    };
    selectedChambers.forEach((chamberName) => {
      validationRules[chamberName] = [
        {
          type: "custom",
          validate: (value: any) => value,
          // value &&
          // typeof value === "object" &&
          // "quantity" in value &&
          // value.quantity !== 0 &&
          // value.quantity !== null &&
          // value.quantity !== undefined &&
          // value.rating !== 0 &&
          // value.rating !== null &&
          // value.rating !== undefined,
          message: `Selected chamber must have some quantity!`,
        },
      ];
    });

    validationRules["discard_quantity"] = [
      {
        type: "custom",
        validate: (value: any) =>
          value !== null && value !== undefined && value >= 0,
        message: "Wastage quantity must be zero or more",
      },
    ];

    validationRules["packaging_type"] = [
      {
        type: "custom",
        validate: (value: any) => value,
        message: "Packaging type is required!",
      },
    ];

    validationRules["packaging_quantity"] = [
      {
        type: "custom",
        validate: (value: any) => value,
        message: "Packaging quantity is required!",
      },
    ];

    if (!isFormInitialized("store-product")) {
      useGlobalFormsStore
        .getState()
        .initializeForm("store-product", initialValues, validationRules, {
          validateOnChange: true,
          debounce: 300,
        });
    }
  }, []);

  useEffect(() => {
    if (isFormInitialized("add-product-package")) {
      useGlobalFormsStore
        .getState()
        .setField("add-product-package", "raw_materials", selectedRawMaterials);
    }
  }, [selectedRawMaterials]);

  useEffect(() => {
    if (isFormInitialized("add-product-package")) {
      useGlobalFormsStore
        .getState()
        .setField("add-product-package", "unit", slectedUnit);
    }
    if (isFormInitialized("add-package-size")) {
      useGlobalFormsStore
        .getState()
        .setField("add-package-size", "unit", slectedUnit);
    }
  }, [slectedUnit]);

  const buttonsContainerStyle: ViewStyle = useMemo(() => {
    const allRight = config?.buttons?.every((btn) => btn.alignment === "right");
    const allFull = config?.buttons?.every((btn) => btn.alignment === "full");
    return {
      justifyContent: allRight ? "flex-end" : "flex-start",
      flexDirection: allFull ? "column" : "row",
      flexWrap: "wrap",
      gap: 12,
    };
  }, [config?.buttons]);

  const conditions = {
    hideUntilChamberSelected: () =>
      Array.isArray(selectedChambers) && selectedChambers?.length > 0,
  };

  const renderSection = useCallback(
    (section: SectionConfig, idx: number) => {
      const Component = sectionComponents[section.type];
      let data = section.data;

      if (
        meta &&
        meta.type === "state" &&
        section.type === "optionList" &&
        stateSearched?.length !== 0
      ) {
        const options = filterOptions(section.data.options, stateSearched) ?? [];
        data = { ...section.data, options };
      }

      if (
        meta &&
        meta.type === "city" &&
        section.type === "optionList" &&
        citySearched?.length !== 0
      ) {
        const options = filterOptions(section.data.options, citySearched) ?? [];
        data = { ...section.data, options };
      }
      if (
        meta &&
        meta.type === "country" &&
        section.type === "optionList" &&
        countrySearched?.length !== 0
      ) {
        // const options = filterOptions(section.data.options, citySearched);
        // data = { ...section.data, options };
      }
      if (
        meta &&
        meta.type === "add-vendor" &&
        section.type === "vendor-card" &&
        selectedRawMaterials?.length !== 0
      ) {
        const vendorsRaw = section.data;

        const vendors = vendorsRaw.filter((v) =>
          selectedRawMaterials.some((rm) => v.materials.includes(rm.name))
        );

        data = vendors;
      }

      if (meta?.type === "add-raw-material" && section.type === "productCard") {
        const rawList = section.data;

        let filtered = rawList;

        if (rawMaterialSearch && rawMaterialSearch.trim().length > 0) {
          const s = rawMaterialSearch.toLowerCase();
          filtered = rawList.filter(
            (item) =>
              item.name?.toLowerCase().includes(s) ||
              item.description?.toLowerCase().includes(s)
          );
        }

        data = filtered;
      }

      if (meta?.type === "add-product" && section.type === "optionList") {
        type Option = string | { name: string; isoCode: string };

        const optionList: Option[] = section.data.options;

        let filtered: Option[] = optionList;

        if (ProductSearched && ProductSearched.trim().length > 0) {
          const s = ProductSearched.toLowerCase();

          filtered = optionList.filter((item) => {
            if (typeof item === "string") {
              return item.toLowerCase().includes(s);
            } else {
              return item?.name?.toLowerCase().includes(s);
            }
          });
        }

        const filteredStrings: string[] = filtered.map((item) =>
          typeof item === "string" ? item : item.name
        );
        
        data = {
          isCheckEnable: false,
          route: "product",
          options: filteredStrings ?? []
        };
      }

if (meta?.type === "choose-package" && section.type === "package-size-choose-list") {
  const rawList = section.data.list;

  let filtered = rawList;
  if (PackageSizeSearched?.trim()) {
    const s = PackageSizeSearched.toLowerCase();
    filtered = rawList.filter((item) =>
      item.name.toLowerCase().includes(s)
    );
  }

  data = {
    ...section.data,
    list: filtered,
  };
}

      return Component ? (
        <React.Fragment key={`${section.type}-${idx}`}>
          {section.type === "input-with-select" ? (
            <ConditionalWrapperComponent
              // @ts-ignore
              conditionKey={section?.conditionKey}
              conditions={conditions}
            >
              <Component
                data={section.data}
                color={color}
                onClose={undefined}
                {...(section.type === "input-with-select"
                  ? { conditionKey: "hideUntilChamberSelected" }
                  : {})}
              />
            </ConditionalWrapperComponent>
          ) : (
            <Component
              data={data}
              color={color}
              onClose={
                section.type === "header" ||
                section.type === "title-with-details-cross"
                  ? toggleModal
                  : undefined
              }
            />
          )}
        </React.Fragment>
      ) : null;
    },
    [color, selectedChambers, toggleModal, conditions]
  );

  if (!config) return null;

  const isAddProductFormValid = isFormValid("add-product-package");
  const isAddPackageSizeFormValid = isFormValid("add-package-size");
  const isAddPackageQuantityFormValid = isFormValid("add-package-quantity");
  const isStoreQuantityFormValid = isFormValid("store-product");

  const isBottomSheetFormValid =
    meta?.type === "add-product-package"
      ? isAddProductFormValid
      : meta?.type === "add-package-size"
      ? isAddPackageSizeFormValid
      : meta?.type === "fill-package"
      ? isAddPackageQuantityFormValid
      : meta?.type === "isStoreQuantityFormValid"
      ? isStoreQuantityFormValid
      : true;

  const isOrderAlreadyShipped =
    meta?.type === "order-ready" &&
    (meta?.data?.status === "in-progress" ||
      meta?.data?.status === "completed");

  const renderButton = (btn: ButtonConfig, idx: number) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const isHalf = btn.alignment === "half";
    const isFull = btn.alignment === "full";

    const shouldCloseOrValidate =
      btn.closeOnPress !== false &&
      btn.actionKey === "add-raw-material" &&
      source !== "add" &&
      source !== "vendor";
    const shouldOpenStoreProduct =
      btn.closeOnPress !== false && btn.actionKey === "choose-chamber" && source === "chamber";
    
    // const shouldOpenStoreProduct =
    //   btn.closeOnPress !== false && btn.actionKey === "store-product";
    
    const supervisorProduction = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Store material",
            description: "Pick chambers to store your materials in",
            details: {
              label: "Quantity",
              value: `${product?.quantity} ${product?.unit}`,
              icon: "database",
            },
          },
        },
        {
          type: "select",
          data: {
            placeholder: "Select chambers",
            label: "Select chambers",
          },
        },
        ...selectedChambers.map((chamberName) => {
          const quantityValue =
            chamberQuantity[chamberName]?.find(
              (chamber: ChamberQty) => chamber.name === chamberName
            )?.quantity ?? "";

          return {
            type: "input-with-select",
            conditionKey: "hideUntilChamberSelected",
            hasUniqueProp: {
              identifier: "addonInputQuantity",
              key: "label",
            },
            data: {
              placeholder: "Qty.",
              label: chamberName,
              label_second: "Rating",
              value: quantityValue,
              addonText: "Kg",
              key: "supervisor-production",
              formField_1: chamberName,
              source: "supervisor-production",
            },
          };
        }),
        {
          type: "input-with-select",
          data: {
            placeholder: "Enter Size in kg",
            label: "Size (Kg)",
            placeholder_second: "Choose type",
            label_second: "Type",
            alignment: "half",
            value: packageTypeProduction ?? "pouch",
            key: "select-package-type",
            formField_1: "product_name",
            source: "add-product-package",
            source2: "product-package",
          },
        },
        {
          type: "addonInput",
          conditionKey: "hideUntilChamberSelected",
          data: {
            placeholder: "Enter quantity",
            label: "Discard quantity",
            value: "0",
            addonText: "Kg",
            formField: "discard_quantity",
          },
        },
      ],
      buttons: [
        {
          text: "Cancel",
          variant: "outline",
          color: "green",
          alignment: "half",
          disabled: false,
        },
        {
          text: "Store",
          variant: "fill",
          color: "green",
          alignment: "half",
          disabled: false,
          actionKey: "store-product",
        },
      ],
    };

    return (
      <Animated.View
        key={idx}
        style={{
          transform: [{ scale }],
          flex: isHalf ? 1 : 0,
          width: isFull ? "100%" : "auto",
        }}
      >
        <Button
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          color={btn.color}
          variant={btn.variant}
          disabled={
            btn.disabled || !isBottomSheetFormValid || isOrderAlreadyShipped || isProductLoading
          }
          onPress={() => {
            if (btn.actionKey) {
              runAction(btn.actionKey);
            }

            if (shouldCloseOrValidate) {
              validateAndSetData("abcd1", "add-product-package");
            } else if (shouldOpenStoreProduct) {
              validateAndSetData(
                product?.id,
                "supervisor-production",
                supervisorProduction
              );
            } else if (source === "product-chamber") {
              dispatch(closeBottomSheet());
            } else {
              // dispatch(clearRawMaterials());
              dispatch(closeBottomSheet());
              dispatch(clearUnit());
              dispatch(clearChambers());
              dispatch(setIsChamberSelected(false));
            }
          }}
        >
          {btn.text}
        </Button>
      </Animated.View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={toggleModal}
      style={styles.modal}
    >
      <View style={styles.sheetContainer}>
        <View style={[styles.HStack, styles.JustifyCenter]}>
          <Pressable
            onPress={toggleModal}
            style={styles.bottomsheetHandle}
          ></Pressable>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.verticalContainer}
            showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {config.sections?.map((section: SectionConfig, secidx: number) =>
            renderSection(section, secidx)
          )}
          {config.buttons && config.buttons?.length > 0 && (
            <View style={[buttonsContainerStyle]}>
              {config.buttons.map(renderButton)}
            </View>
          )}
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 8,
  },
  sheetContainer: {
    backgroundColor: getColor("light", 200),
    padding: 16,
    paddingBottom: 32,
    borderRadius: 16,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.95, 700),
  },
scrollContainer: {
  flexGrow: 1,
},
verticalContainer: {
  flexGrow: 1,
  gap: 16,
},
  HStack: {
    flexDirection: "row",
  },
  JustifyCenter: {
    justifyContent: "center",
  },
  bottomsheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: getColor("green", 700),
    borderRadius: 20,
    marginBottom: 16,
  },
});