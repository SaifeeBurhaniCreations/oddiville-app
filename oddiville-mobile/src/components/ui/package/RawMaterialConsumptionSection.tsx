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

import {
  ChamberStock,
  Packaging,
} from "@/src/hooks/useChamberStock";
import { Chamber, useFrozenChambers } from "@/src/hooks/useChambers";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

import { IconRatingProps } from "@/src/types";
import ActionButton from "@/src/components/ui/Buttons/ActionButton";
import PencilIcon from "@/src/components/icons/common/PencilIcon";
import CrossIcon from "@/src/components/icons/page/CrossIcon";
import { RawMaterialConsumptionSetter, useRawMaterialConsumption } from "@/src/hooks/packing/useRawMaterialConsumption";
import { PackingFormController } from "@/src/hooks/packing/usePackingForm";

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
  chamberNameMap: Map<string, string>
): ChambersByRM {
  return useMemo(() => {
    const byRM = new Map<string, StockChamber[]>();

      rmUsed.forEach((stock) => {
        if (!stock.product_name) return;

        const chambers: StockChamber[] = stock.chamber.map((ch) => ({
          id: String(ch.id),
          name: chamberNameMap.get(String(ch.id)) ?? "Unknown Chamber",
          quantity: Number(ch.quantity) || 0,
          rating: Number(ch.rating) || 5,
        }));

        byRM.set(stock.product_name, chambers);
      });

      return byRM;
    }, [rmUsed, chamberNameMap]);
  }

function filterVisibleChambers(
  chambers: StockChamber[],
  selectedRating: number
) {
  return chambers.filter(
    (ch) => ch.rating === selectedRating && ch.quantity > 0
  );
}

const ChamberRow = memo(({
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

    return (
      <View style={[styles.chamberCard, styles.borderBottom]}>
        <View style={styles.Hstack}>
          <View style={styles.iconWrapper}>
            <ChamberIcon color={getColor("green")} size={32} />
          </View>

          <View style={styles.Vstack}>
            <B1>{String(chamber.name).slice(0, 12)}...</B1>
            <B4>
              {chamber.quantity} qty. | {rmPackaging.size.value}{" "}
              {rmPackaging.size.unit} bag
            </B4>
          </View>
        </View>

        <View style={{ flex: 0.7 }}>
          <Input
            placeholder="Count"
            addonText="bags"
            mask="addon"
            post
            keyboardType="numeric"
            value={String(value ?? "")}
            onChangeText={(text: string) =>
              onChange(chamber.id, Number(text) || 0)
            }
            error={error}
          />
        </View>
      </View>
    );
  });

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
      (state: RootState) => state.StorageRMRating.ratingByRM
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
      rmUsed.map(rm => ({
        rmName: rm.product_name,
        chambers: rm.chamber.map(ch => ({
          chamberId: String(ch.id),
          rating: Number(ch.rating) || 5,
        })),
      })),
    [rmUsed]
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
            const ratingForThisRM = ratingByRM[rm.product_name] ?? {
              rating: 5,
              message: "Excellent",
            };

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

            const rmChambers = chambersByRM.get(rm.product_name) || [];
            const visibleChambers = filterVisibleChambers(
              rmChambers,
              selectedRating
            );

            const isChambersEmpty = visibleChambers.length === 0;

            return (
              <ItemsRepeater
                key={rm.product_name}

                title={rm.product_name}
                description={rm.product_name}
                noValue
              >
                <View style={styles.cardBody}>
                  <View style={[styles.Hstack, styles.JustifyBetween, { width: "100%" }]}>
                    <Select
                      value={ratingForThisRM.message}
                      showOptions={false}
                      preIcon={RatingIcon}
                      selectStyle={{ flex: 1 }}
                      onPress={() => {
                        setEditingRM(rm.product_name);
                        validateAndSetData(
                          `${rm.product_name}:${ratingForThisRM.rating}`,
                          "storage-rm-rating"
                        )
                      }}
                    />
                    {editingRM === rm.product_name ? (
                      <ActionButton
                        icon={CrossIcon}
                        style={{ height: 42, width: 42 }}
                        onPress={() => setEditingRM(null)}
                      />
                    ) : (
                      <ActionButton
                        icon={PencilIcon}
                        style={{ height: 42, width: 42, opacity: isChambersEmpty ? 0.5 : 1 }}
                        disabled={isChambersEmpty}
                        onPress={() => {
                          if (isChambersEmpty) return;
                          setEditingRM(rm.product_name);
                        }}
                      />
                    )}

                  </View>

                  {editingRM === rm.product_name && !isChambersEmpty && (
                    <View>
                      <Input
                        placeholder="Packets per bag"
                        addonText="packets"
                        mask="addon"
                        post
                        keyboardType="numeric"
                        value={String(packetsPerBagPerRM[rm.product_name] ?? "")}
                        onChangeText={(text: string) =>
                          setPacketsPerBagPerRM((prev) => ({
                            ...prev,
                            [rm.product_name]: Number(text) || 0,
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
                        key={`${rm.product_name}-${chamber.id}`}
                        chamber={chamber}
                        rmPackaging={rmPackaging}
                        value={containerInputByChamber[chamber.id]}
                        onChange={(chamberId, value) => {
                          setChamberInput(chamberId, value); 
                          form.setRMInput(chamberId, value); 

                          if (value > 0) {
                            form.clearError("rm");
                            form.clearError(`rm.${rm.product_name}`);
                          }
                        }}

                        error={form.getError(`rm.${rm.product_name}`)}
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
