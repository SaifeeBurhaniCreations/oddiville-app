import { View, Pressable, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { getColor } from "@/src/constants/colors";
import { B1, B4, H3, H5 } from "../typography/Typography";
import Input from "./Inputs/Input";
import CustomImage from "./CustomImage";
import TrashIcon from "../icons/common/TrashIcon";
import UpChevron from "../icons/navigation/UpChevron";
import DownChevron from "../icons/navigation/DownChevron";
import ChamberIcon from "../icons/common/ChamberIcon";
import FormField from "@/src/sbc/form/FormField";

import noProductImage from "@/src/assets/images/fallback/raw-material-fallback.png";
import { OrderStorageForm } from "@/app/create-orders";
import { PackedItem } from "@/src/hooks/packedItem";

type ControlledFormProps<T> = {
  values: T;
  setField: (key: string, value: any) => void;
  errors: Partial<Record<keyof T, string>>;
};

const AddProductsForSell = ({
  product,
  isFirst,
  setToast,
  isOpen,
  onPress,
  onRemove,
  controlledForm,
  ...props
}: {
  product: PackedItem;
  isFirst?: boolean;
  setToast?: (val: boolean) => void;
  isOpen?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  controlledForm: ControlledFormProps<OrderStorageForm>;
  [key: string]: any;
}) => {
  const { values, setField, errors } = controlledForm;

  const productIndex = values.products?.findIndex(
    (p) => p.name === product?.product_name
  );
  const currentProduct = values.products?.[productIndex] || {
    packages: [],
    chambers: [],
  };

  return (
    <ScrollView key={product?.product_name}>
      <View style={[styles.card, isFirst && styles.firstCard]} {...props}>
        <Pressable style={styles.cardHeader} onPress={onPress}>
          <View style={styles.Hstack}>
            <CustomImage
              borderRadius={8}
              width={36}
              height={36}
              src={product?.image}
              fallback={noProductImage}
            />

            <H5 color={getColor("light")}>{product?.product_name}</H5>
          </View>
          <View style={styles.Hstack}>
            <Pressable
              style={styles.dropdownIcon}
              onPress={(e) => {
                e.stopPropagation?.();
                onRemove?.();
              }}
            >
              <TrashIcon color={getColor("green")} />
            </Pressable>
            <View style={styles.dropdownIcon}>
              {isOpen ? (
                <UpChevron color={getColor("green")} />
              ) : (
                <DownChevron color={getColor("green")} />
              )}
            </View>
          </View>
        </Pressable>

        {isOpen && (
          <View style={styles.cardBody}>
            {/* Chambers */}
            <View style={styles.Vstack}>
              <H3>Enter quantity</H3>
              <B4 color={getColor("green", 400)}>
                Select a chamber that shows a quantity — that's where this
                product is available.
              </B4>

              {currentProduct.chambers?.filter(ch => !ch.id.toLowerCase().includes("dry")).map((chamber, index) => (
                <View
                  key={index}
                  style={[styles.chamberCard, styles.borderBottom]}
                >
                  <View style={styles.Hstack}>
                    <View style={styles.iconWrapper}>
                      <ChamberIcon color={getColor("green")} size={32} />
                    </View>
                    <View style={styles.Vstack}>
                      <B1>{String(chamber.name).slice(0, 12)}...</B1>
                      <B4>{chamber.stored_quantity}kg</B4>
                    </View>
                  </View>
                  <View style={{ flex: 0.7 }}>
                    <FormField
                      name={`products.${productIndex}.chambers.${index}.quantity`}
                      form={{ values, setField, errors }}
                    >
                      {({ value, onChange, error }) => (
                        <Input
                          placeholder="Quantity"
                          addonText="KG"
                          value={
                            value === 0 || value === null || value === undefined
                              ? ""
                              : String(value)
                          }
                          onChangeText={(text: string) => {
                            const numeric = text.replace(/[^0-9.]/g, "");
                            const enteredValue =
                              numeric === "" ? 0 : parseFloat(numeric);
                            const maxQuantity = Number(chamber.stored_quantity);
                            if (enteredValue > maxQuantity) {
                              setToast?.(true);
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
          </View>
        )}
      </View>
    </ScrollView>
  );
};
export default AddProductsForSell;

const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor("green"),
    borderRadius: 8,
  },
  firstCard: {
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownIcon: {
    padding: 8,
    backgroundColor: getColor("light"),
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    backgroundColor: getColor("light"),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "column",
    gap: 16,
  },
  count: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
  Vstack: {
    flexDirection: "column",
    gap: 4,
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
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
    flex: 1,
    gap: 4,
  },
  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    paddingTop: 16,
  },

  alignCenter: {
    alignItems: "center",
  },
  justifyCenter: {
    justifyContent: "center",
  },
});
