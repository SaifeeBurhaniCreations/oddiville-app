import { OrderStorageForm } from "@/app/create-orders";
import { B1, B4, H3, H5 } from "../typography/Typography";

import { PackedChamberRow } from "@/src/types/domain/packing/packing.types";
import { getColor } from "@/src/constants/colors";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { View } from "react-native";
import CustomImage from "./CustomImage";
import noProductImage from "@/src/assets/images/fallback/raw-material-fallback.png";
import UpChevron from "../icons/navigation/UpChevron";
import DownChevron from "../icons/navigation/DownChevron";
import TrashIcon from "../icons/common/TrashIcon";
import Select from "./Select";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useMemo } from "react";
import { DispatchPackageSize } from "@/src/redux/slices/bottomsheet/dispatch-package-size.slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { RatingFilter } from "@/src/redux/slices/bottomsheet/storage.slice";
import { PackageKey } from "@/src/redux/slices/bottomsheet/dispatch-rating.slice";
import EmptyState from "./EmptyState";
import { mapPackageIcon } from "@/src/utils/common";
import FiveStarIcon from "../icons/page/Rating/FiveStarIcon";
import FourStarIcon from "../icons/page/Rating/FourStarIcon";
import ThreeStarIcon from "../icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "../icons/page/Rating/TwoStarIcon";
import OneStarIcon from "../icons/page/Rating/OneStarIcon";
import { IconRatingProps } from "@/src/types";
import { setUsedBags } from "@/src/redux/slices/used-dispatch.slice";
import { useChamber } from "@/src/hooks/useChambers";
import ChamberIcon from "../icons/common/ChamberIcon";
import Input from "./Inputs/Input";
import { DispatchUIProduct } from "@/src/types/domain/dispatch/dispatch.types";

type ControlledFormProps<T> = {
  values: T;
  setField: (key: string, value: any) => void;
  errors: Partial<Record<keyof T, string>>;
};


function getPackageIconType(pkg: {
  size: number;
  unit: string;
}): "paper-roll" | "bag" | "big-bag" {
  const grams =
    pkg.unit === "kg" ? pkg.size * 1000 : pkg.size;

  if (grams <= 250) return "paper-roll";
  if (grams <= 500) return "bag";
  return "big-bag";
}

const EMPTY_ARRAY: any[] = [];

const AddProductsForSell = ({
  product,
  packingItems,
  isFirst,
  setToast,
  isOpen,
  onPress,
  onRemove,
  chamberStockIndex,
  controlledForm,
  ...props
}: {
  product: DispatchUIProduct;
  packingItems: PackedChamberRow[];
  isFirst?: boolean;
  setToast?: (val: boolean) => void;
  isOpen?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  chamberStockIndex: Map<string, { packages: any[]; chambers: { chamberId: string; rating: number; bags: number; }[]; }>;
  controlledForm: ControlledFormProps<OrderStorageForm>;
  [key: string]: any;
}) => {
  const { data: globalChambers } = useChamber();
  const dispatch = useDispatch();

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  // const packedRows = packingItems;
// console.log("chamberStockIndex", JSON.stringify(chamberStockIndex.get(product.product_name), null, 2));

  const stock = chamberStockIndex.get(product.product_name);

  const selectedPackagesFromBS = useSelector(
    (state: RootState) =>
      state.dispatchPackageSize.selectedSizesByProduct[product.id] ||
      EMPTY_ARRAY
  );
  const ratingByProductSize = useSelector(
    (state: RootState) => state.dispatchRating.ratingByProductSize
  );
  const selectedSizeKeys = useMemo(() => {
    return new Set(
      selectedPackagesFromBS
        .filter(
          (p): p is DispatchPackageSize & { unit: "gm" | "kg" } =>
            p.unit === "gm" || p.unit === "kg"
        )
        .map(p => `${p.size}-${p.unit}`)
    );
  }, [selectedPackagesFromBS]);

  const getSelectedRating = (
  productId: string,
  size: number,
  unit: "gm" | "kg"
): number => {
  const key = `${size}-${unit}`;
  return ratingByProductSize?.[productId]?.[key]?.rating ?? 5;
};

  // const packageOptions = useMemo(() => {
  //   const map = new Map<string, {
  //     size: number;
  //     unit: "gm" | "kg";
  //     bags: number;
  //   }>();

  //   packedRows.forEach(row => {
  //     const key = `${row.size}-${row.unit}`;
  //     if (!map.has(key)) {
  //       map.set(key, {
  //         size: row.size,
  //         unit: row.unit,
  //         bags: 0,
  //       });
  //     }
  //     map.get(key)!.bags += row.bags;
  //   });

  //   return Array.from(map.values());
  // }, [packedRows]);
  const packageOptions = useMemo(() => {
  if (!stock?.packages) return [];

  return stock.packages.map(pkg => ({
    size: pkg.size,
    unit: pkg.unit,
    bags: stock.chambers
      .filter(ch => ch.rating != null)
      .reduce((sum, ch) => sum + Number(ch.bags || 0), 0),
  }));
}, [stock]);

  const usedStock = useSelector((s: RootState) => s.usedDispatchPkg);

  const choosePackaging = {
    sections: [
      {
        type: "title-with-details-cross",
        data: { title: "Packaging size" },
      },
      {
        type: "package-size-choose-list",
        data: {
          list: packageOptions.map(p => ({
            name: `${p.size}${p.unit}`,
            size: p.size,
            unit: p.unit,
            icon: getPackageIconType(p),
            count: p.bags,
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
        actionKey: "add-dispatch-product",
      },
    ],
  };

  const getRatingForPackage = (
    productId: string,
    size: number,
    unit: "gm" | "kg"
  ): RatingFilter => {
    const key: PackageKey = `${size}-${unit}`;

    return (
      ratingByProductSize?.[productId]?.[key] ?? {
        rating: 5,
        message: "Excellent",
      }
    );
  };

  const RatingIconMap: Record<number, React.FC<IconRatingProps>> = {
    5: FiveStarIcon,
    4: FourStarIcon,
    3: ThreeStarIcon,
    2: TwoStarIcon,
    1: OneStarIcon,
  };
//   const groupedPackages = useMemo(() => {
//     const map = new Map<string, {
//       size: number;
//       unit: "gm" | "kg";
//       rating: number;
//       chambers: PackedChamberRow[];
//       totalBags: number;
//     }>();

//     packedRows.forEach(row => {
//       const sizeKey = `${row.size}-${row.unit}`;

//       if (selectedSizeKeys.size === 0) return;
//       if (!selectedSizeKeys.has(sizeKey)) return;

//       const ratingForPackage = getRatingForPackage(
//         product.id,
//         row.size,
//         row.unit
//       );

//       const selectedRating = ratingForPackage.rating;
//       const packageKey = `${row.size}-${row.unit}-${selectedRating}`;

//       if (!map.has(packageKey)) {
//         map.set(packageKey, {
//           size: row.size,
//           unit: row.unit,
//           rating: selectedRating,
//           chambers: [],
//           totalBags: 0,
//         });
//       }

//       const pkg = map.get(packageKey)!;

//       const rating = getSelectedRating(product.id, pkg.size, pkg.unit);

// const availableChambers = (stock?.chambers ?? []).filter(
//   ch => ch.rating === rating
// );
//       const existingChamber = pkg.chambers.find(
//         ch => ch.chamberId === row.chamberId
//       );

//       if (existingChamber) {
//         existingChamber.bags += row.bags;
//         existingChamber.kg += row.kg;
//       } else {
//         pkg.chambers.push({ ...row });
//       }

//       pkg.totalBags += row.bags;
//     });

//     return Array.from(map.values());
//   }, [packedRows, selectedSizeKeys, ratingByProductSize]);

const groupedPackages = useMemo(() => {
  if (!stock) return [];

  const result: {
    size: number;
    unit: "gm" | "kg";
    rating: number;
    chambers: {
      chamberId: string;
      bags: number;
    }[];
    totalBags: number;
  }[] = [];

  for (const pkg of stock.packages ?? []) {
    const sizeKey = `${pkg.size}-${pkg.unit}`;
    if (!selectedSizeKeys.has(sizeKey)) continue;

    const rating = getSelectedRating(product.id, pkg.size, pkg.unit);

    const chambers = (stock.chambers ?? [])
      .filter(ch => ch.rating === rating && Number(ch.bags) > 0)
      .map(ch => ({
        chamberId: ch.chamberId,
        bags: Number(ch.bags),
      }));

    const totalBags = chambers.reduce((s, c) => s + c.bags, 0);

    if (totalBags === 0) continue;

    result.push({
      size: pkg.size,
      unit: pkg.unit,
      rating,
      chambers,
      totalBags,
    });
  }

  return result;
}, [stock, selectedSizeKeys, ratingByProductSize]);

  return (
    <ScrollView key={product?.product_name} contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.card, isFirst && styles.firstCard]}>
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
            <View style={styles.Vstack}>
              <H3>Enter Bags</H3>
              <B4 color={getColor("green", 400)}>
                Select packet size and rating, then enter loose bag count.
              </B4>
            </View>
            <View style={styles.selelctRow}>

              <Select
                value="Select packaging"
                showOptions={false}
                selectStyle={{ flex: 1 }}
                onPress={() =>
                  validateAndSetData("no-id", "choose-package", choosePackaging)
                }
                legacy
              />
            </View>

            <View style={[styles.Vstack, { gap: 12 }]}>
              <H3>Select Bags</H3>
              {groupedPackages.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <EmptyState
                    stateData={{
                      title: "No package found",
                      description: "Select sizes",
                    }}
                    compact
                  />
                </View>
              ) : (
                groupedPackages.map((pkg) => {
                  const ratingForPackage = getRatingForPackage(
                    product.id,
                    pkg.size,
                    pkg.unit
                  );

                  const selectedRating = pkg.rating;

                 const RatingIcon = RatingIconMap[selectedRating] ?? FiveStarIcon;


                  const packageKey = `${pkg.size}-${pkg.unit}-${selectedRating}`;
                  const Icon = mapPackageIcon(pkg);

                 const filteredChambers = pkg.chambers;

                  return (
                    <View key={packageKey} style={{ gap: 12 }}>

                      <View style={styles.packageRow}>
                        <View style={styles.row}>
                          <View style={styles.iconWrapper}>
                            {Icon && <Icon size={28} color={getColor("green")} />}
                          </View>
                          <B1>
                            {`${pkg.size}${pkg.unit} (${pkg.totalBags})`}
                          </B1>

                        </View>
                        <View style={styles.ratingRow}>
                          <Select
                            value={ratingForPackage.message}
                            showOptions={false}
                            preIcon={RatingIcon}
                            onPress={() => {
                              validateAndSetData(
                                `${product.id}|${pkg.size}|${pkg.unit}`,
                                "storage-rm-rating",
                                {
                                  sections: [
                                    {
                                      type: "title-with-details-cross",
                                      data: { title: "Select rating" },
                                    },
                                    {
                                      type: "storage-rm-rating",
                                      data: [
                                        { rating: "5", message: "Excellent" },
                                        { rating: "4", message: "Good" },
                                        { rating: "3", message: "Neutral" },
                                        { rating: "2", message: "Poor" },
                                        { rating: "1", message: "Very poor" },
                                      ],
                                    },
                                  ],
                                  intent: "DISPATCH_PACKAGE_RATING",
                                  data: {
                                    productId: product.id,
                                    size: pkg.size,
                                    unit: pkg.unit,
                                  },
                                }
                              );
                            }}
                            legacy
                          />

                          <Pressable
                            style={styles.dropdownIcon}
                            onPress={(e) => {
                              e.stopPropagation?.();
                            }}
                          >
                            <TrashIcon color={getColor("green")} />
                          </Pressable>
                        </View>
                      </View>

                      {filteredChambers.length === 0 ? (
                        <View style={{ alignItems: "center", paddingVertical: 12 }}>
                          <B4 color={getColor("green", 400)}>
                            No chambers available for this rating
                          </B4>
                        </View>
                      ) : (
                        filteredChambers.map((row) => {
                          const globalChamber = globalChambers?.find(
                            ch => ch.id === row.chamberId
                          );

                          const usedBags =
                            usedStock[product.id]?.[packageKey]?.usedBagsByChamber?.[row.chamberId] ?? 0;

                            const remaining = Math.max(row.bags - usedBags, 0);

                            const packetKg =
                              pkg.unit === "gm" ? pkg.size / 1000 : pkg.size;

                            const kg = remaining * packetKg;

                          return (
                            <View
                              key={`${packageKey}-${row.chamberId}`}
                              style={[styles.chamberCard, styles.borderBottom]}
                            >
                              <View style={styles.Hstack}>
                                <View style={styles.iconWrapper}>
                                  <ChamberIcon size={32} color={getColor("green")} />
                                </View>

                                <View>
                                  <B1>
                                    {(globalChamber?.chamber_name ?? "Chamber").slice(0, 15)}…
                                  </B1>
                                  <B4>{kg} kg | {remaining} bags</B4>
                                </View>
                              </View>

                              <Input
                                placeholder="Count"
                                addonText="Bags"
                                keyboardType="numeric"
                                mask="addon"
                                post
                                value={String(usedBags)}
                                onChangeText={(text: string) =>
                                  dispatch(setUsedBags({
                                    productId: product.id,
                                    packageKey,
                                    chamberId: row.chamberId,
                                    bags: Number(text) || 0,
                                  }))
                                }
                              />
                            </View>
                          );
                        }))}
                    </View>
                  )
                }
                )
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
    borderRadius: 999,
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
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
    gap: 24,
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