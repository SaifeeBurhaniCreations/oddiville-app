import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { getColor } from "@/src/constants/colors";
import { InputWithSelectComponentProps } from "@/src/types";
import { B4, C1, H4 } from "../../typography/Typography";
import React, { useEffect, useState } from "react";
import DownChevron from "../../icons/navigation/DownChevron";
import { RootState } from "@/src/redux/store";
import { useDispatch, useSelector } from "react-redux";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { getLimitedMaterialNames } from "@/src/utils/arrayUtils";
import { useGlobalFormValidator } from "@/src/sbc/form/globalFormInstance";
import { setSource } from "@/src/redux/slices/unit-select.slice";
import { setSource as setRmSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { StoreChambersForm, ChamberValue } from "./AddonInputComponent";
import { selectChamber } from "@/src/redux/slices/chamber.slice";
import { setChamberQty } from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";
import { computeCurrentValue } from "@/src/utils/common";
import { useChamber } from "@/src/hooks/useChambers";
import { useChamberStock } from "@/src/hooks/useChamberStock";
import { RMSoruceMap } from "@/src/lookups/getRMBackSource";
import { useToast } from "@/src/context/ToastContext";

export type AddProductPackageForm = {
  raw_materials: string[];
  product_name: string;
  unit: string;
  size: string;
  quantity: string;
  chamber_name: string;
};

export type AddPackageSizeForm = {
  id: string;
  unit: string;
  size: string;
  quantity: string;
};

export type SupervisorProductionForm = {
  packaging_size: string;
  packaging_type: string;
};

const InputWithSelectComponent = ({ data }: InputWithSelectComponentProps) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { slectedUnit } = useSelector((state: RootState) => state.selectUnit);
  const packageTypeProduction = useSelector(
    (state: RootState) => state.packageTypeProduction.selectedPackageType,
  );
  const selectedRawMaterial = useSelector(
    (state: RootState) => state.rawMaterial.selectedRawMaterials,
  );
  const chamberRatingsById = useSelector(
    (state: RootState) => state.chamberRatings.byId,
  );

  const selectedChambers = useSelector(
    (state: RootState) => state.rawMaterial.selectedChambers
  );

  const { meta } = useSelector((state: RootState) => state.bottomSheet);

  const { product } = useSelector((state: RootState) => state.storeProduct);
  // const { chambers, chamberCapacityWithName } = useSelector((state: RootState) => state.productionBegins);

  const { data: chambersY } = useChamber();
  const { data: stocksY } = useChamberStock();

  type Chamber = {
    id: string;
    chamber_name: string;
    capacity: number;
  };

  type ChamberGoods = {
    id: string;
    chamber: { id: string; quantity: string }[];
  };

  function getRemainingChamberQuantities(
    chambersY: Chamber[] | undefined,
    stocksY: ChamberGoods[] | undefined,
  ) {
    return (chambersY ?? []).map((chamber) => {
      const quantities = (stocksY ?? []).flatMap((stock) =>
        stock.chamber
          .filter((ch) => ch.id === chamber.id)
          .map((ch) => parseFloat(ch.quantity)),
      );
      const totalOccupied = quantities.reduce((acc, val) => acc + val, 0);
      const remaining = chamber.capacity - totalOccupied;

      return {
        chamber_id: chamber.id,
        chamber_name: chamber.chamber_name,
        capacity: chamber.capacity,
        occupied: totalOccupied,
        remaining,
      };
    });
  }
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const packageFormValidator = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package",
  );
const supervisorForm =
  useGlobalFormValidator<SupervisorProductionForm>("supervisor-production");

  const packageSizeValidator =
    useGlobalFormValidator<AddPackageSizeForm>("add-package-size");
const {
  values: storeValues,
  errors: storeErrors,
  setField: storeSetField,
  
} = useGlobalFormValidator<StoreChambersForm>("store-chambers");

  const {
    placeholder,
    label,
    value,
    placeholder_second,
    label_second,
    key,
    alignment,
    formField_1,
    source,
    source2,
  } = data;
  const [qty, setQty] = useState(value);

  useEffect(() => {
  if (
    meta?.type === "supervisor-production" &&
    typeof formField_1 === "string" &&
    selectedChambers.includes(formField_1)
  ) {
    const current = storeValues[formField_1];
    if (!current) return;

    const rating = Number(chamberRatingsById[formField_1]?.rating);
    if (Number.isNaN(rating)) return;

    storeSetField(formField_1, {
      ...current,
      rating,
    });
  }
}, [chamberRatingsById, formField_1]);

  const handlePress = () => {
    dispatch(setSource(source));
    const mapKey = `${key}:${source}`;
    const mapped = RMSoruceMap[mapKey];
    if (source2) {
      dispatch(setRmSource(source2));
    } else if (mapped) {
      dispatch(setRmSource(mapped));
    }

    if (["package-weight", "add-raw-material"].includes(key)) {
      validateAndSetData("Abc123", key);
    } else if (source === "supervisor-production") {
        if (!formField_1) return;

        validateAndSetData("Abc123", "rating");
        dispatch(selectChamber(formField_1));
        // packageFormValidator.setField("chamber_name", formField_1);
        }
 else if (key === "select-package-type") {
      validateAndSetData("Abc123", "select-package-type");
    }
  };

  const { values, errors, setField } =
    meta?.type === "add-product-package"
      ? packageFormValidator
      : packageSizeValidator;

  const chamberKey: string = (formField_1 ?? "").trim();

  const chamberRating: string = chamberKey
    ? (chamberRatingsById[chamberKey]?.rating ?? "")
    : "";

  const addRawMaterialValue = getLimitedMaterialNames(selectedRawMaterial, 10);

  const rawMap = {
    "add-raw-material": addRawMaterialValue,
    "supervisor-production": chamberRating,
    "package-weight": slectedUnit,
    "select-package-type": packageTypeProduction,
  };

  const placeholder_second_val = placeholder_second
    ? placeholder_second
    : "Select";

  const raw = rawMap[key] !== undefined ? rawMap[key] : false;

  const currentValue = computeCurrentValue(
    key,
    raw,
    chamberRating,
    placeholder_second_val,
    packageTypeProduction,
  );

  // console.log("currentValue", currentValue);

  const currentChamberName = String(formField_1);

  const chamberSummary = getRemainingChamberQuantities(
    chambersY,
    stocksY,
  )?.find((c) => c.chamber_name === currentChamberName);

  const remainingKg = chamberSummary?.remaining;

  const inputValue = (() => {
  // packaging size (supervisor)
  if (
    meta?.type === "supervisor-production" &&
    formField_1 === "packaging_size"
  ) {
    return supervisorForm.values.packaging_size || "";
  }

  // chamber quantity (supervisor)
  if (
    meta?.type === "supervisor-production" &&
    typeof formField_1 === "string" &&
    selectedChambers.includes(formField_1)
  ) {
    return String(storeValues[formField_1]?.quantity ?? "");
  }

  // normal forms
  return values[formField_1 as any] || "";
})();

const isChamberField =
  meta?.type === "supervisor-production" &&
  typeof formField_1 === "string" &&
  selectedChambers.includes(formField_1);

    const resolvedKeyboardType =
  data.keyboardType ??
  (meta?.type === "supervisor-production"
    ? "number-pad"
    : "number-pad");
    
  const renderInput = () =>
    meta?.type === "add-product-package" ||
    meta?.type === "add-package" ||
    meta?.type === "supervisor-production" ? (
      <>
        <TextInput
          style={styles.textInput}
          keyboardType={resolvedKeyboardType}
          placeholder={placeholder}

      onChangeText={(val) => {
const producedTotal = Number(product?.quantity ?? 0);
  if (
    meta?.type === "supervisor-production" &&
    formField_1 === "packaging_size"
  ) {
    supervisorForm.setField("packaging_size", val);
    return;
  }

 if (
  meta?.type === "supervisor-production" &&
  typeof formField_1 === "string" &&
  selectedChambers.includes(formField_1)
) {
const maxAllowed =
  producedTotal -
  Object.entries(storeValues).reduce((sum, [key, v]) => {
    if (key === formField_1) return sum;
    return sum + (v as ChamberValue).quantity;
  }, 0);

const inputQty = Math.min(
  Math.max(0, Number(val) || 0),
  maxAllowed
);

  const totalStored = Object.entries(storeValues).reduce(
    (sum, [key, v]) => {
      if (key === formField_1) return sum + inputQty;
      return sum + Number((v as any)?.quantity || 0);
    },
    0
  );

  if (totalStored > producedTotal) {
    toast.error(
      `Stored quantity cannot exceed produced quantity (${producedTotal} Kg)`
    );

    storeSetField(formField_1, {
      quantity: 0,
      rating: Number(chamberRatingsById[formField_1]?.rating || 0),
    });


    dispatch(
      setChamberQty({ name: formField_1, quantity: "0" })
    );

    return;
  }

  storeSetField(formField_1, {
    quantity: inputQty,
    rating: Number(chamberRatingsById[formField_1]?.rating || 0),
  });

  dispatch(
    setChamberQty({ name: formField_1, quantity: String(inputQty) })
  );

  return;
}

  setField(formField_1 as any, val);
}}
          placeholderTextColor={getColor("green", 700, 0.7)}
          textAlignVertical="center"
         value={inputValue}
        />
      </>
    ) : (
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        onChangeText={(newQty) => setQty(newQty)}
        placeholderTextColor={getColor("green", 700, 0.7)}
        textAlignVertical="center"
        value={qty}
      />
    );

  return (
    <>
      <View style={styles.inputContainer}>
        <View style={styles.inputSelectWrapper}>
          <View
            style={{
              flex: alignment === "half" ? 1 : 5,
              flexDirection: "column",
              gap: 8,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <H4>{label.slice(0, 13)}...</H4>
              <B4 color={getColor("green", 700)}>
                {key === "supervisor-production" ? `${remainingKg} Kg` : ""}
              </B4>
            </View>
            <View
             style={[
    styles.inputWrapper,
    {
    //   borderColor: resolvedError
    //     ? getColor("red", 600)
    //     : getColor("green", 100),
    borderColor:
  isChamberField && storeErrors?.[formField_1]
    ? getColor("red", 600)
    : formField_1 === "packaging_size" &&
      supervisorForm.errors?.packaging_size
    ? getColor("red", 600)
    : getColor("green", 100),

    },
  ]}
            >
              {renderInput()}
            </View>
          </View>

          <View
            style={{ flexDirection: "column", gap: 4, alignItems: "center" }}
          >
            <View
              style={{
                flex: alignment === "half" ? 1 : 2,
                flexDirection: "column",
                gap: 8,
              }}
            >
              <H4>{label_second}</H4>
              <TouchableOpacity
                style={[
                  styles.selectContainer,
                  {
                    borderWidth: isChamberField && storeErrors?.[formField_1] ? 1 : 0,
                    borderColor: getColor("red"),
                  },
                ]}
                onPress={handlePress}
              >
                <B4 color={getColor("green", 700)}>{currentValue}</B4>
                <DownChevron size={16} color={getColor("green", 700)} />
              </TouchableOpacity>
            </View>
            {/* {storeErrors[chamberKey] && (
              <View>
                <C1 color={getColor("red", 700)}>
                  {String(storeErrors[chamberKey] || "Field required!")}
                </C1>
              </View>
            )} */}
          </View>
        </View>
          {/* {resolvedError && (
  <B4 color={getColor("red", 700)}>
    {String(resolvedError)}
  </B4>
)} */}
{isChamberField && storeErrors?.[formField_1] && (
  <B4 color={getColor("red", 700)}>
    {String(storeErrors[formField_1])}
  </B4>
)}
      </View>
    </>
  );
};

export default InputWithSelectComponent;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontFamily: "FunnelSans-Regular",
    fontSize: 16,
    color: getColor("green", 700),
    minHeight: 44,
  },
  inputContainer: {
    flexDirection: "column",
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: getColor("light"),
    paddingHorizontal: 12,
  },
  addonText: {
    padding: 12,
    backgroundColor: getColor("green", 100),
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  inputSelectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectContainer: {
    backgroundColor: getColor("light"),
    borderWidth: 1,
    borderColor: getColor("green", 100),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
