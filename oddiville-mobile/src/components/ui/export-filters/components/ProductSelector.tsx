import { Pressable, StyleSheet, View } from "react-native";
import Select from "../../Select";
import { getPlaceholder } from "@/src/utils/inputUtils";
import { useEffect, useMemo, useState } from "react";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { B1 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import { FilterComponentProps } from "@/src/types/export/types";
import { setSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import ItemsRepeater from "../../ItemsRepeater";
import { globalStyles } from "@/src/styles/layout";

export const truncate = (value: any, max = 32) => {
  const text = String(value ?? "");
  return text.length > max ? text.slice(0, max) + "..." : text;
};

const ProductSelector = ({ state, setState }: FilterComponentProps) => {
  const dispatch = useDispatch();
  const [productAccordionOpen, setProductAccordionOpen] =
    useState<boolean>(true);
  const selectedProducts = useSelector(
    (state: RootState) => state.exportProduct.selectedProduct,
  );

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      products: Array.from(new Set(selectedProducts)),
    }));
  }, [selectedProducts]);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const handleSelect = () => {
    dispatch(setSource("export-product"));
    validateAndSetData("nothing", "select-export-product");
  };

  const displayValue = useMemo(() => {
    if (!selectedProducts.length) return "";

    const joined = selectedProducts.join(", ");
    return joined.length > 32 ? joined.slice(0, 32) + "..." : joined;
  }, [selectedProducts]);

  const placeholder = getPlaceholder("Select product", displayValue);

  return (
    <View style={globalStyles.sectionColumn}>
      <Select
        style={{ width: "100%" }}
        value={placeholder}
        options={[]}
        onPress={handleSelect}
        showOptions={false}
      >
        Select Products
      </Select>

{selectedProducts.length > 0 && <Pressable onPress={() => setProductAccordionOpen(!productAccordionOpen)}>
        <ItemsRepeater
          title={"Product"}
          description={"Product"}
          noValue
          noImage
          accodian={{
            open: productAccordionOpen,
            onPress: () => setProductAccordionOpen(!productAccordionOpen),
          }}
        >
          {productAccordionOpen &&
            selectedProducts?.map((product) => (
              <View
                style={[styles.chamberCard, styles.borderBottom]}
                key={product}
              >
                <View style={styles.Hstack}>
                  <View style={styles.iconWrapper}>
                    <BoxIcon color={getColor("green")} size={32} />
                  </View>

                  <View style={styles.Vstack}>
                    <B1>{truncate(product)}</B1>
                  </View>
                </View>
              </View>
            ))}
        </ItemsRepeater>
      </Pressable>}
    </View>
  );
};

export default ProductSelector;

const styles = StyleSheet.create({
  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    minHeight: 48,
  },
  Vstack: {
    flexDirection: "column",
    flexShrink: 1,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
});