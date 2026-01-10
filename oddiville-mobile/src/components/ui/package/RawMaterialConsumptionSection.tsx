import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSelector } from "react-redux";

import { RootState } from "@/src/redux/store";
import { getColor } from "@/src/constants/colors";

import EmptyState from "@/src/components/ui/EmptyState";
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
  useChamberStockByName,
} from "@/src/hooks/useChamberStock";
import { Chamber, useFrozenChambers } from "@/src/hooks/useChambers";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

import { IconRatingProps } from "@/src/types";
import ActionButton from "../Buttons/ActionButton";
import PencilIcon from "../../icons/common/PencilIcon";
import CrossIcon from "../../icons/page/CrossIcon";

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

const ChamberRow = ({
  chamber,
  rmPackaging,
}: {
  chamber: StockChamber;
  rmPackaging: Packaging;
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
          placeholder=""
          addonText="bags"
          mask="addon"
          post
          keyboardType="numeric"
          value=""
          onChangeText={() => {}}
        />
      </View>
    </View>
  );
};

const RawMaterialConsumptionSection = ({
  setIsLoading,
}: {
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const selectedRawMaterials = useSelector(
    (state: RootState) => state.product.rawMaterials
  );

  const ratingByRM = useSelector(
    (state: RootState) => state.StorageRMRating.ratingByRM
  );

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const { chamberStock } = useChamberStockByName(selectedRawMaterials);
  const rmUsed = chamberStock ?? [];

  const { data: frozenChambers, isLoading: frozenLoading } =
    useFrozenChambers();

  const chamberNameMap = useChamberNameMap(frozenChambers);
  const chambersByRM = useChambersByRM(rmUsed, chamberNameMap);

  useEffect(() => {
    setIsLoading(frozenLoading);
  }, [frozenLoading, setIsLoading]);

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
            <EmptyState
              key={rm.product_name}
              stateData={{
                title: "Raw material missing",
                description: `${rm.product_name} raw material data not found`,
              }}
              style={{ marginTop: -(screenHeight / 7) }}
              compact
            />
          );
        }

        const rmChambers = chambersByRM.get(rm.product_name) || [];
        const visibleChambers = filterVisibleChambers(
          rmChambers,
          selectedRating
        );

        return (
          <ItemsRepeater
            key={rm.product_name}
            title={rm.product_name}
            description={rm.product_name}
            noValue
          >
            <View style={styles.cardBody}>
            <View style={[styles.Hstack, styles.JustifyBetween, {width: "100%"}]}>
              <Select
                value={ratingForThisRM.message}
                showOptions={false}
                preIcon={RatingIcon}
                selectStyle={{flex: 1}}
                onPress={() =>
                  validateAndSetData(
                    `${rm.product_name}:${ratingForThisRM.rating}`,
                    "storage-rm-rating"
                  )
                }
              />
              {isEnabled ? <ActionButton icon={CrossIcon} style={{height: 42, width: 42}} onPress={() => setIsEnabled(false)} /> : <ActionButton icon={PencilIcon} style={{height: 42, width: 42}} onPress={() => setIsEnabled(true)} />}
</View>

{isEnabled && (
  <View>
   <Input
          placeholder="Pack per bag"
          addonText="packets"
          mask="addon"
          post
          keyboardType="numeric"
          value=""
          onChangeText={() => {}}
        />
</View>
)}
              {visibleChambers.length === 0 ? (
                <EmptyState
                  stateData={{
                    title: "No stock found",
                    description: `${rm.product_name} is not available in any chamber`,
                  }}
                  style={{ marginTop: -(screenHeight / 16) }}
                  compact
                />
              ) : (
                visibleChambers.map((chamber) => (
                  <ChamberRow
                    key={`${rm.product_name}-${chamber.id}`}
                    chamber={chamber}
                    rmPackaging={rmPackaging}
                  />
                ))
              )}
            </View>
          </ItemsRepeater>
        );
      })}
    </View>
  );
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
