import { H4 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import { usePackageById } from "@/src/hooks/Packages";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import {
  ChamberQty,
  setRating,
} from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";
import { selectUnit } from "@/src/redux/slices/unit-select.slice";
import { RootState } from "@/src/redux/store";
import { ManageActionProps } from "@/src/types";
import { StyleSheet, Pressable, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { reset as chamberRatingReset } from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";

const actionHandlers = {
  changeNumber: () => console.log("Change number triggered"),
  changePassword: () => console.log("Change password triggered"),
  deactivateUser: () => console.log("Deactivate user triggered"),
  null: () => console.log("Null triggered"),
  gm: () => console.log("Gram triggered"),
  kg: () => console.log("Kilogram triggered"),
  qn: () => console.log("Quintal triggered"),
  tons: () => console.log("Tons triggered"),
};

type ActionKey = keyof typeof actionHandlers;

const ManageActionComponent: React.FC<ManageActionProps> = ({
  data,
  color,
}) => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { source } = useSelector((state: RootState) => state.selectUnit);
  const { chamber } = useSelector((state: RootState) => state.chamber);
  const selectedChambers = useSelector(
    (state: RootState) => state.rawMaterial.selectedChambers,
  );
  const { product } = useSelector((state: RootState) => state.storeProduct);
  const chamberQuantity = useSelector(
    (state: RootState) => state.chamberRatings.chamberQty,
  );
  const id = useSelector((state: RootState) => state.idStore.id);
  const currentProductId = useSelector(
    (state: RootState) => state.currentProduct.currentProductId,
  );
  const packageTypeProduction = useSelector(
    (state: RootState) => state.packageTypeProduction.selectedPackageType,
  );
  const { data: pkgData } = usePackageById(currentProductId ?? null);
  const { product_name } = pkgData || {};
  const dispatch = useDispatch();

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
            (chamber: ChamberQty) => chamber.name === chamberName,
          )?.quantity ?? "";

        return {
          type: "input-with-select",
          conditionKey: "hideUntilChamberSelected",
          hasUniqueProp: {
            identifier: "addonInputQuantity",
            key: "label",
          },
          data: {
            placeholder: "Quantity",
            label: chamberName,
            label_second: "Rating",
            value: quantityValue,
            addonText: "Kg",
            key: "supervisor-production",
            formField_1: chamberName,
            source: "supervisor-production",
            keyboardType: "number-pad",
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
          value: packageTypeProduction ?? "bag",
          key: "select-package-type",
          formField_1: "packaging_size",
          // source: "add-product-package",
          source: "supervisor-production",
          source2: "product-package",
          keyboardType: "number-pad",
        },
      },
      {
        type: "addonInput",
        conditionKey: "hideUntilChamberSelected",
        data: {
          placeholder: "Enter quantity",
          label: "Discard quantity",
          value: "",
          addonText: "Kg",
          formField: "discard_quantity",
          keyboardType: "number-pad",
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
    <View style={styles.manageActionWrapper}>
      {data?.map((action, index) => (
        <Pressable
          key={index}
          onPress={() => {
            dispatch(selectUnit(action.actionKey));

            dispatch(setRating({ chamber, rating: action.actionKey }));
            if (source === "add-product-package") {
              dispatch(chamberRatingReset());
              validateAndSetData("temp123", "add-product-package");
            } else if (source === "supervisor-production") {
              validateAndSetData(
                id!,
                "supervisor-production",
                supervisorProduction,
              );
            } else {
              validateAndSetData(
                `${currentProductId}:${product_name}`,
                "add-package",
              );
            }

            // const handler = actionHandlers[action.actionKey as ActionKey];
            // if (handler) handler();
          }}
          style={{
            borderBottomWidth: index !== data?.length - 1 ? 1 : 0,
            borderBottomColor: getColor("green", 100),
            paddingBottom: index !== data?.length - 1 ? 12 : 0,
          }}
        >
          <H4 color={getColor(color, 700)}>{action.title}</H4>
        </Pressable>
      ))}
    </View>
  );
};

export default ManageActionComponent;

const styles = StyleSheet.create({
  manageActionWrapper: {
    flexDirection: "column",
    gap: 12,
  },
});
