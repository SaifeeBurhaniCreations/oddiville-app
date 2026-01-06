import React, { useCallback, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SubHeading } from "@/src/components/typography/Typography";
import CustomCheckbox from "@/src/components/ui/Checkbox";
import { getColor } from "@/src/constants/colors";
import { selectChamber } from "@/src/redux/slices/chamber.slice";
import { selectRole } from "@/src/redux/slices/select-role";
import { closeBottomSheet } from "@/src/redux/slices/bottomsheet.slice";
import { applyFilter } from "@/src/redux/slices/bottomsheet/filters.slice";
import { RootState } from "@/src/redux/store";
import { setReduxRoute } from "@/src/utils/routeUtils";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import type {
  OptionListComponentProps,
  validRouteOptionList,
} from "@/src/types";
import { AddProductPackageForm } from "./InputWithSelectComponent";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";
import { Chamber, useDryChambers } from "@/src/hooks/useChambers";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { setDeleteUserPopup, setVendorDeletePopup } from "@/src/redux/slices/delete-popup-slice";
import Modal from "../modals/Modal";
import { useDeleteVendor } from "@/src/hooks/vendor";
import { FilterEnum } from "@/src/schemas/BottomSheetSchema";
import { ChamberQty } from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";
import { selectPackageType } from "@/src/redux/slices/bottomsheet/package-type-production.slice";

const OptionListComponent = memo(({ data }: OptionListComponentProps) => {
  
  const meta = useSelector((state: RootState) => state.bottomSheet.meta);
  const id = useSelector((state: RootState) => state.idStore.id);
  const isChoosingChambers = useSelector(
    (state: RootState) => state.productPackageChamber.isChoosingChambers
  );
    const showVendorDeletePopup = useSelector(
      (state: RootState) => state.deletePopup.showVendorDeletePopup
    );
    const packageTypeProduction = useSelector((state: RootState) => state.packageTypeProduction.selectedPackageType);

  const dispatch = useDispatch();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );
  const { setField } = productPackageForm;
    const selectedChambers = useSelector(
      (state: RootState) => state.rawMaterial.selectedChambers
    );
      const chamberQuantity = useSelector(
        (state: RootState) => state.chamberRatings.chamberQty
      );
      const { data: DryChambersRaw } = useDryChambers();
  const DryChambers = DryChambersRaw || [];
  const username = useSelector(
    (state: RootState) => state.bottomSheet.meta?.id
  );
    const { product } = useSelector((state: RootState) => state.storeProduct);

  const { goTo } = useAppNavigation();
  const deleteVendorMutation = useDeleteVendor();

   const handlePress = useCallback(
    async (
      route: validRouteOptionList | undefined,
      item: string | { name: string; isoCode: string },
      key?: "user-action" | "vendor-action" | "supervisor-production" | "product-package" | "select-package-type" | string
    ) => {
      const value = typeof item === "object" ? item.name : item;

      if (meta?.type === "filter") {
        const filterKey = meta.id as FilterEnum; 

        dispatch(
          applyFilter({
            path: [filterKey, value],
            value,
          })
        );

        dispatch(closeBottomSheet());
        return;
      }

      if (key === "select-package-type") {
        dispatch(selectPackageType(item));
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
            // value: item ?? "pouch",
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

          validateAndSetData(
                product?.id,
                "supervisor-production",
                supervisorProduction
              );
        return;
      }

      if (meta?.type === "select-role") {
        dispatch(selectRole(value.trim() as "admin" | "supervisor"));
        dispatch(closeBottomSheet());
        return;
      }

      if (route) {
        setReduxRoute(route, dispatch, item);
      } else {
        dispatch(selectChamber(value));
      }
      
      if (key && key === "user-action") {
        if (item === "Edit User") {
          goTo("user-form", { username: username });
        } else if (item === "Delete User" && username) {
          dispatch(setDeleteUserPopup(true));
        } else {
          console.warn("Unknown user action!");
        }
      } else if (key && key === "vendor-action") {
        if (item === "Edit Vendor") {
          goTo("vendor-create", { userId: username });
        } else if (item === "Delete Vendor" && username) {
          dispatch(setVendorDeletePopup(true));
        } else {
          console.warn("Unknown vendor action!");
        }
      }

      if (isChoosingChambers) {
        setField("chamber_name", value);
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
                placeholder: typeof item === "string" ? item : "Select Chamber",
                label: "Select Chamber",
                options:
                  DryChambers && DryChambers.length === 0
                    ? []
                    : DryChambers.map((dch: Chamber) => dch.chamber_name),
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
        await validateAndSetData(
          "temp123",
          "add-product-package",
          addProductPackage
        );
        return;
      }

      dispatch(closeBottomSheet());
    },
    [
      dispatch,
      meta,
      id,
      validateAndSetData,
      isChoosingChambers,
      setField,
      DryChambers,
      username,
      goTo,
    ]
  );

  return (
    <View style={styles.container}>
      {data?.options?.map((item, index) => {
        const label = typeof item === "object" ? item.name : String(item);
        return (
          <View key={index} style={styles.optionBlock}>
            <Pressable
              onPress={() => handlePress(data?.route, item, data.key)}
              style={styles.optionRow}
            >
              {data?.isCheckEnable && <CustomCheckbox checked={false} />}
              <SubHeading>{label}</SubHeading>
            </Pressable>

            {index < data.options.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        );
      })}
           <Modal
              showPopup={showVendorDeletePopup}
              setShowPopup={(visible) => dispatch(setVendorDeletePopup(visible))}
              modalData={{  
                title: "Remove Vendor",
                description: `You are deleting Vendor "${username}"  parmanently, are you sure?`,
                type: "danger",
                buttons: [
                  {
                    variant: "fill",
                    label: "Delete",
                    action: () => typeof username === "string" && deleteVendorMutation.mutate({ id: username })
                  },
                ],
              }}
            />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column" },
  optionBlock: { flexDirection: "column", marginBottom: 16 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  separator: {
    height: 1,
    backgroundColor: getColor("green", 100),
    width: "100%",
    marginTop: 12,
  },
});

export default OptionListComponent;
