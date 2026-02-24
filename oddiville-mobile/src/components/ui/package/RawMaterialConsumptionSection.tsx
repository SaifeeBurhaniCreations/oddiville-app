import React, { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

import { RootState } from "@/src/redux/store";
import { getColor } from "@/src/constants/colors";

import EmptyState, { EmptyStateStyles } from "@/src/components/ui/EmptyState";
import ItemsRepeater from "@/src/components/ui/ItemsRepeater";
import Input from "@/src/components/ui/Inputs/Input";
import Select from "@/src/components/ui/Select";

import ChamberIcon from "@/src/components/icons/common/ChamberIcon";
import FiveStarIcon from "@/src/components/icons/page/Rating/FiveStarIcon";
import FourStarIcon from "@/src/components/icons/page/Rating/FourStarIcon";
import ThreeStarIcon from "@/src/components/icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "@/src/components/icons/page/Rating/TwoStarIcon";
import OneStarIcon from "@/src/components/icons/page/Rating/OneStarIcon";

import { B1, B4 } from "@/src/components/typography/Typography";

import { ChamberStock, Packaging } from "@/src/hooks/useChamberStock";
import { Chamber, useFrozenChambers } from "@/src/hooks/useChambers";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

import { IconRatingProps } from "@/src/types";
import ActionButton from "@/src/components/ui/Buttons/ActionButton";
import PencilIcon from "@/src/components/icons/common/PencilIcon";
import CrossIcon from "@/src/components/icons/page/CrossIcon";
import { RawMaterialConsumptionSetter } from "@/src/hooks/packing/useRawMaterialConsumption";
import { PackingFormController } from "@/src/hooks/packing/usePackingForm";
import { useToast } from "@/src/context/ToastContext";

/* Types */
type StockChamber = {
  id: string;
  name: string;
  quantity: number;
  rating: number;
};

type ChambersByRM = Map<string, StockChamber[]>;

/* Rating icon map */
const RatingIconMap: Record<number, React.FC<IconRatingProps>> = {
  5: FiveStarIcon,
  4: FourStarIcon,
  3: ThreeStarIcon,
  2: TwoStarIcon,
  1: OneStarIcon,
};

/* Hooks */
function useChamberNameMap(frozenChambers: Chamber[]) {
  return useMemo(() => {
    const map = new Map<string, string>();
    frozenChambers?.forEach((ch) => {
      map.set(String(ch.id), ch.chamber_name);
    });
    return map;
  }, [frozenChambers]);
}

function useChambersByRM(
  rmUsed: ChamberStock[],
  chamberNameMap: Map<string, string>,
): ChambersByRM {
  return useMemo(() => {
    const byRM = new Map<string, StockChamber[]>();

    rmUsed.forEach((stock) => {
      const chambers: StockChamber[] = stock.chamber.map((ch) => ({
        id: String(ch.id),
        name: chamberNameMap.get(String(ch.id)) ?? "Unknown Chamber",
        quantity: Number(ch.quantity) || 0,
        rating: 0, 
      }));

      byRM.set(stock.id, chambers); 
    });

    return byRM;
  }, [rmUsed, chamberNameMap]);
}

function filterVisibleChambers(chambers: StockChamber[]) {
  return chambers.filter((ch) => ch.quantity > 0);
}

const ChamberRow = memo(
  ({
    chamber,
    rmPackaging,
    value,
    onChange,
    error,
  }: {
    chamber: StockChamber;
    rmPackaging: Packaging;
    value: number | undefined;
    onChange: (chamberId: string, value: number) => void;
    error?: string;
  }) => {
    const toast = useToast();

    const bagSize = rmPackaging.size.value;
const totalKg = chamber.quantity;

const maxBags = Math.floor(totalKg / bagSize);

const usedBags = value ?? 0;
const usedKg = usedBags * bagSize;

const remainingKg = Math.max(totalKg - usedKg, 0);
const remainingBags = Math.floor(remainingKg / bagSize);
const looseKg = +(remainingKg % bagSize).toFixed(2);

    return (
      <View style={[styles.chamberCard, styles.borderBottom]}>
        <View style={styles.Hstack}>
          <View style={styles.iconWrapper}>
            <ChamberIcon color={getColor("green")} size={32} />
          </View>

          <View style={styles.Vstack}>
            <B1>{String(chamber.name).slice(0, 12)}…</B1>
<View>
  <B4>
    {remainingBags} {remainingBags === 1 ? "bag" : "bags"}
    {looseKg > 0 ? ` + ${looseKg} kg` : ""}
  </B4>

  <B4 style={{ opacity: 0.6 }}>
    {remainingKg} kg available
  </B4>
</View>

          </View>
        </View>

        <View style={{ flex: 0.7, justifyContent: "center", height: 44 }}>
          <Input
            placeholder="Count"
            addonText="bags"
            mask="addon"
            post
            keyboardType="numeric"
            value={String(usedBags || "")}
            onChangeText={(text: string) => {
              const input = Number(text) || 0;

              if (input > maxBags) {
                toast.error(`Only ${maxBags} bags available in this chamber`);
                onChange(chamber.id, maxBags);
                return;
              }

              if (input < 0) {
                onChange(chamber.id, 0);
                return;
              }

              onChange(chamber.id, input);
            }}
            error={error}
          />
        </View>
      </View>
    );
  },
);

type Props = {
  setIsLoading: (isLoading: boolean) => void;
  isCurrentProduct: boolean;
  form: PackingFormController;
  rm: RawMaterialConsumptionSetter;
  rmUsed: ChamberStock[];
};
const RawMaterialConsumptionSection = ({
  setIsLoading,
  isCurrentProduct,
  form,
  rm,
  rmUsed,
}: Props) => {
  const ratingByRM = useSelector(
    (state: RootState) => state.StorageRMRating.ratingByRM,
  );

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const { data: frozenChambers, isLoading: frozenLoading } =
    useFrozenChambers();
  const {
    isLoading,
    editingRM,
    setEditingRM,
    packetsPerBagPerRM,
    setPacketsPerBagPerRM,
    containerInputByChamber,
    setChamberInput,
  } = rm;

  const chamberNameMap = useChamberNameMap(frozenChambers);
  const chambersByRM = useChambersByRM(rmUsed, chamberNameMap);

  const rmMeta = useMemo(
    () =>
      rmUsed.map((rm) => ({
        rmId: rm.id,
        chambers: rm.chamber.map((ch) => ({
          chamberId: String(ch.id),
          rating: Number(ch.rating) || 5,
        })),
      })),
    [rmUsed],
  );

  useEffect(() => {
    if (!rmMeta.length) return;

    if (JSON.stringify(form.values.rmMeta) === JSON.stringify(rmMeta)) return;

    form.setRMMeta(rmMeta);
  }, [rmMeta]);

  useEffect(() => {
    setIsLoading(isLoading || frozenLoading);
  }, [isLoading, frozenLoading, setIsLoading]);

  useEffect(() => {
    setEditingRM(null);
  }, [ratingByRM]);

  if (isCurrentProduct) {
    return (
      <View style={[styles.rawMaterialColumn, styles.borderBottom]}>
        {rmUsed.map((rm) => {
          const ratingForThisRM =
  ratingByRM[rm.id] ?? { rating: rm.rating ?? 5, message: "Excellent" };

          const selectedRating = ratingForThisRM.rating;
          const RatingIcon = RatingIconMap[selectedRating] ?? FiveStarIcon;

          const rmPackaging =
            rm.packaging && !Array.isArray(rm.packaging) ? rm.packaging : null;

          if (!rmPackaging) {
            return (
              <View style={EmptyStateStyles.center}>
                <EmptyState
                  key={rm.product_name}
                  stateData={{
                    title: "Raw material missing",
                    description: `${rm.product_name} raw material data not found`,
                  }}
                  compact
                />
              </View>
            );
          }

            if ((ratingByRM[rm.id]?.rating ?? rm.rating ?? 5) !==         selectedRating) {
                  return null;
                }

              const rmChambers = chambersByRM.get(rm.id) || [];
              const visibleChambers = filterVisibleChambers(rmChambers);


          const isChambersEmpty = visibleChambers.length === 0;

          return (
            <ItemsRepeater
              key={rm.product_name}
              title={rm.product_name}
              description={rm.product_name}
              noValue
            >
              <View style={styles.cardBody}>
                <View
                  style={[
                    styles.Hstack,
                    styles.JustifyBetween,
                    { width: "100%" },
                  ]}
                >
                  <Select
                    value={ratingForThisRM.message}
                    showOptions={false}
                    preIcon={RatingIcon}
                    selectStyle={{ flex: 1 }}
                    onPress={() => {
                      setEditingRM(rm.id)
                      validateAndSetData(
                        `${rm.id}:${ratingForThisRM.rating}`,
                        "storage-rm-rating",
                        {
                          sections: [
                            {
                              type: "title-with-details-cross",
                              data: {
                                title: "Select rating",
                              },
                            },
                            {
                              type: "storage-rm-rating",
                              data: [
                                {
                                  rating: "5",
                                  message: "Excellent",
                                },
                                {
                                  rating: "4",
                                  message: "Good",
                                },
                                {
                                  rating: "3",
                                  message: "Neutral",
                                },
                                {
                                  rating: "2",
                                  message: "Poor",
                                },
                                {
                                  rating: "1",
                                  message: "Very poor",
                                },
                              ],
                            },
                          ],
                          intent: "PACKING_RM_FILTER_RATING",
                          data: { rmId: rm.id },
                        },
                      );
                    }}
                  />
                  {editingRM === rm.id ? (
                    <ActionButton
                      icon={CrossIcon}
                      style={{ height: 42, width: 42 }}
                      onPress={() => setEditingRM(null)}
                    />
                  ) : (
                    <ActionButton
                      icon={PencilIcon}
                      style={{
                        height: 42,
                        width: 42,
                        opacity: isChambersEmpty ? 0.5 : 1,
                      }}
                      disabled={isChambersEmpty}
                      onPress={() => {
                        if (isChambersEmpty) return;
                        setEditingRM(rm.id)
                      }}
                    />
                  )}
                </View>

                {editingRM === rm.id && !isChambersEmpty && (
                  <View>
                    <Input
                      placeholder="Packets per bag"
                      addonText="packets"
                      mask="addon"
                      post
                      keyboardType="numeric"
                      value={String(packetsPerBagPerRM[rm.id] ?? "")}
                      onChangeText={(text: string) =>
                        setPacketsPerBagPerRM((prev) => ({
                          ...prev,
                          [rm.id]: Number(text) || 0,
                        }))
                      }
                    />
                  </View>
                )}
                {isChambersEmpty ? (
                  <View style={EmptyStateStyles.center}>
                    <EmptyState
                      stateData={{
                        title: "No stock found",
                        description: `${rm.product_name} is not available in any chamber`,
                      }}
                      compact
                    />
                  </View>
                ) : (
                  visibleChambers.map((chamber) => (
                    <ChamberRow
                      key={`${rm.id}-${chamber.id}`}
                      chamber={chamber}
                      rmPackaging={rmPackaging}
                      value={
                        containerInputByChamber[rm.id]?.[chamber.id]
                      }
                      onChange={(chamberId, value) => {
                        setChamberInput(rm.id, chamberId, value);
                        form.setRMInput(rm.id, chamberId, value);

                        if (value > 0) {
                          form.clearError("rm");
                          form.clearError(`rm.${rm.id}`);
                        }
                      }}
                      error={form.getError(`rm.${rm.id}`)}
                    />
                  ))
                )}
              </View>
            </ItemsRepeater>
          );
        })}
      </View>
    );
  }
};

export default RawMaterialConsumptionSection;

/* Styles */

const styles = StyleSheet.create({
  rawMaterialColumn: {
    flexDirection: "column",
    flex: 1,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
  cardBody: {
    backgroundColor: getColor("light"),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 8,
    flexDirection: "column",
    gap: 16,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },
  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    paddingTop: 16,
  },
  Vstack: {
    flexDirection: "column",
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  JustifyBetween: {
    justifyContent: "space-between",
  },
});
