import { OrderStorageForm } from "@/app/create-orders";
import {
  MultipleProductType,
} from "@/src/redux/slices/multiple-product.slice";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { DataAccordianEnum, IconRatingProps } from "@/src/types";
import EmptyState from "./EmptyState";
import FourStarIcon from "../icons/page/Rating/FourStarIcon";
import ThreeStarIcon from "../icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "../icons/page/Rating/TwoStarIcon";
import OneStarIcon from "../icons/page/Rating/OneStarIcon";
import FiveStarIcon from "../icons/page/Rating/FiveStarIcon";
import { getColor } from "@/src/constants/colors";
import { View, Pressable, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { B1, B4, H3, H5 } from "../typography/Typography";
import Input from "./Inputs/Input";
import CustomImage from "./CustomImage";
import TrashIcon from "../icons/common/TrashIcon";
import UpChevron from "../icons/navigation/UpChevron";
import DownChevron from "../icons/navigation/DownChevron";
import ChamberIcon from "../icons/common/ChamberIcon";
import FormField from "@/src/sbc/form/FormField";

import noProductImage from "@/src/assets/images/fallback/raw-material-fallback.png";
import { mapPackageIcon } from "@/src/utils/common";
import Select from "./Select";
import { useChamber } from "@/src/hooks/useChambers";
import {
  setUsedBags,
} from "@/src/redux/slices/used-dispatch.slice";
import { PackingEvent, PackingStorageItem } from "@/src/types/domain/packing/packing.types";

type ControlledFormProps<T> = {
  values: T;
  setField: (key: string, value: any) => void;
  errors: Partial<Record<keyof T, string>>;
};

type UIPackage = {
  name: string;
  icon: DataAccordianEnum;
  isChecked: boolean;
  size: number;
  rawSize: string;
  count: number;
  unit: "kg" | "gm" | "qn" | null;
};

const getPackageKey = (pkg: { size: number; unit: string | null }) =>
  `${pkg.size}-${pkg.unit}`;

const normalizeRating = (r: any) => Number(r);

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
  product: MultipleProductType;
  isFirst?: boolean;
  setToast?: (val: boolean) => void;
  isOpen?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  controlledForm: ControlledFormProps<OrderStorageForm>;
  [key: string]: any;
}) => {
  const dispatch = useDispatch();
  const { data: globalChambers } = useChamber();
  const usedStock = useSelector((s: RootState) => s.usedDispatchPkg);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { values, setField, errors } = controlledForm;
  const dispatchRatingByRM = useSelector(
    (state: RootState) => state.StorageRMRating.ratingByRM
  );

  const selectedPackages = useSelector(
    (state: RootState) =>
      state.dispatchPackageSize.selectedSizesByProduct[product.id] ?? []
  );
  const ratingForThisRM = dispatchRatingByRM[product?.product_name] ?? {
    rating: 5,
    message: "Excellent",
  };

  const selectedRating = ratingForThisRM.rating;

  const packingEvents =
  (product as MultipleProductType & {
    packingEvents?: PackingEvent[];
  }).packingEvents ?? [];

console.log("selectedPackages", selectedPackages);

const packagesWithChambers = selectedPackages.map((pkg) => {
const packingForPkg = packingEvents.filter(
  (e: PackingEvent) =>
    Number(e.packet.size) === Number(pkg.size) &&
    e.packet.unit === pkg.unit &&
    normalizeRating(
      Object.values(e.rm_consumption ?? {})[0]?.[
        Object.keys(Object.values(e.rm_consumption ?? {})[0] ?? {})[0]
      ]?.rating
    ) === normalizeRating(selectedRating)
);

const chambersForPkg = packingForPkg.flatMap(
  (e: PackingEvent) =>
    e.storage
      .filter((s: PackingStorageItem) => Number(s.bagsStored) > 0)
      .map((s: PackingStorageItem) => ({
        id: s.chamberId,
        quantity: s.bagsStored,
      }))
);

  return {
    ...pkg,
    chambers: chambersForPkg,
   count: chambersForPkg.reduce(
  (sum: number, c: { quantity: number }) => sum + c.quantity,
  0
),
  };
});

  const shouldShowEmptyState = packagesWithChambers.every(
    (pkg) => pkg.chambers.length === 0
  );

  const RatingIconMap: Record<number, React.FC<IconRatingProps>> = {
    5: FiveStarIcon,
    4: FourStarIcon,
    3: ThreeStarIcon,
    2: TwoStarIcon,
    1: OneStarIcon,
  };

  const RatingIcon = RatingIconMap[selectedRating] ?? FiveStarIcon;

  const choosePackaging = {
    sections: [
      {
        type: "title-with-details-cross",
        data: {
          title: "Packaging size",
        },
      },
      {
        type: "search",
        data: {
          searchTerm: "",
          placeholder: "Search size",
          searchType: "add-package",
        },
      },
      {
        type: "package-size-choose-list",
        data: {
          list: packagesWithChambers
                .filter((p) => p.chambers.length > 0)
                .map((p) => ({
                  name: p.rawSize,
                  icon: p.icon,
                  count: p.count,
                  isChecked: false,
                })),
          source: "dispatch",
          productId: product.id,
        },
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
            <View style={styles.inputsColumn}>
              {/* Chambers */}
              <View style={styles.Vstack}>
                <H3>Enter Bags</H3>
                <B4 color={getColor("green", 400)}>
                  Select packet size and rating, then enter packets per loose
                  bag and loose bag count.
                </B4>
              </View>
            </View>
            <View style={styles.selelctRow}>
              <Select
                value={ratingForThisRM.message}
                showOptions={false}
                preIcon={RatingIcon}
                selectStyle={{ flex: 1 }}
                onPress={() => {
                  validateAndSetData(
                    `${product?.product_name}:${dispatchRatingByRM.rating}`,
                    "storage-rm-rating"
                  );
                }}
                legacy
              />

              <Select
                value="Select packaging"
                showOptions={false}
                selectStyle={{ flex: 1 }}
                onPress={() => {
                  validateAndSetData(
                    "no-id",
                    "choose-package",
                    choosePackaging
                  );
                }}
                legacy
              />
            </View>
            <View style={[styles.Vstack, { gap: 12 }]}>
              <H3>Select Bags</H3>

              {shouldShowEmptyState ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <EmptyState
                    stateData={{
                      title: "No packages found",
                      description: "Insufficient stock",
                    }}
                    compact
                  />
                </View>
              ) : (
                packagesWithChambers.map((pkgWithChambers, pkgIndex) => {
                  const { chambers, ...pkg } = pkgWithChambers;
                  const Icon = mapPackageIcon(pkg);
                  const pkgKey = getPackageKey(pkg);

                  return (
                    <View
                      key={`${product.id}-${pkgKey}`}
                      style={[
                        pkgIndex === 0 ? styles.borderTop : null,
                        { width: "100%", gap: 12 },
                      ]}
                    >
                      {/* PACKAGE ROW */}
                      <View style={styles.packageRow}>
                        <View style={styles.row}>
                          <View style={styles.iconWrapper}>
                            {Icon && (
                              <Icon color={getColor("green")} size={28} />
                            )}
                          </View>
                          <B1>
                            {pkg.rawSize} ({pkg.count})
                          </B1>
                        </View>

                        <Pressable>
                          <TrashIcon color={getColor("green")} />
                        </Pressable>
                      </View>

                      {/* CHAMBERS FOR THIS PACKAGE */}
                      {chambers.length === 0 ? (
                        <EmptyState
                          stateData={{
                            title: "No chamber for this package",
                            description: "Insufficient stock",
                          }}
                          compact
                        />
                      ) : (
                        chambers.map((chamber, chIndex) => {
                          const globalChamber = globalChambers?.find(
                            (ch) => ch.id === chamber.id
                          );
                          const pkgKey = getPackageKey(pkg);
                          const packetsPerBag =
                            usedStock[product.id]?.[pkgKey]?.packetsPerBag ?? 0;
                          const usedBags =
                            usedStock[product.id]?.[pkgKey]?.usedBagsByChamber[
                              chamber.id
                            ] ?? 0;

                          const packetsCount =
                            packetsPerBag && packetsPerBag > 0
                              ? Math.floor(pkg.count / packetsPerBag)
                              : 0;

                          const remainingBags = Math.max(
                            packetsCount - usedBags,
                            0
                          );

                          return (
                            <View
                              key={`${pkg.rawSize}-${chamber.id}`}
                              style={[
                                styles.chamberCard,
                                styles.borderBottom,
                                { gap: 12 },
                              ]}
                            >
                              <View style={styles.Hstack}>
                                <View style={styles.iconWrapper}>
                                  <ChamberIcon
                                    color={getColor("green")}
                                    size={32}
                                  />
                                </View>
                                <View>
                                  <B1>
                                    {!Array.isArray(globalChamber) &&
                                      globalChamber?.chamber_name.slice(0, 14)}
                                    ...
                                  </B1>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <B4>{chamber.quantity} kg</B4>
                                    <B4>|</B4>
                                    <B4>{remainingBags} bags</B4>
                                  </View>
                                </View>
                              </View>

                              <FormField
                                name={`packages.${pkgIndex}.chambers.${chIndex}.quantity`}
                                form={{ values, setField, errors }}
                              >
                                {({ value, onChange }) => (
                                  <Input
                                    placeholder="Count"
                                    addonText="Bags"
                                    mask="addon"
                                    keyboardType="numeric"
                                    post
                                    value={String(usedBags)}
                                    onChangeText={(text: string) => {
                                      dispatch(
                                        setUsedBags({
                                          productId: product.id,
                                          packageKey: pkgKey,
                                          chamberId: chamber.id,
                                          bags: Number(text) || 0,
                                        })
                                      );
                                    }}
                                  />
                                )}
                              </FormField>
                            </View>
                          );
                        })
                      )}
                    </View>
                  );
                })
              )}
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
  borderTop: {
    borderTopWidth: 1,
    borderColor: getColor("green", 100),
    paddingTop: 16,
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
    width: "100%",
    gap: 12,
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
  },

  alignCenter: {
    alignItems: "center",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  selelctRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  inputsColumn: {
    flexDirection: "column",
    gap: 24,
  },
  packageWrapper: {
    paddingHorizontal: 12,
    gap: 8,
  },
  separator: {
    height: 1,
    backgroundColor: getColor("green", 100),
  },
  inlineEmptyState: {
    height: 200,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});