import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { ItemCardData } from "@/src/types/cards";
import { B3, B4, C1, H3 } from "../typography/Typography";
import { getColor } from "@/src/constants/colors";
import Button from "./Buttons/Button";
import StarIcon from "../icons/page/StarIcon";
import CustomImage from "./CustomImage";
import DatabaseIcon from "../icons/page/DatabaseIcon";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { getImageSource } from "@/src/utils/arrayUtils";
import LaneIcon from "../icons/common/LaneIcon";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { updateBottomSheetMeta } from "@/src/redux/slices/bottomsheet.slice";

const ItemCard = ({
  id,
  name,
  weight,
  rating,
  lane,
  actionLabel,
  backgroundIcon: BackgroundIcon,
  style,
  mode = "default",
  meta,
  onActionPress,
}: ItemCardData) => {

  const { goTo } = useAppNavigation();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const dispatch = useDispatch();
  const bottomSheetMeta = useSelector(
    (state: RootState) => state.bottomSheet.meta
  );
 
  const handlePress = () => {
    switch (mode) {
      case "production":
        goTo("production-complete", { id });
        break;

      case "production-completed":
        validateAndSetData(id ?? "", "production-completed");
        break;

      case "packing":
        validateAndSetData(
          JSON.stringify({
            product: meta?.product,
            sku: meta?.sku,
            date: "today",
            mode: meta?.mode,
          }),
          "packing-summary"
        );

        dispatch(
          updateBottomSheetMeta({
            ...bottomSheetMeta,
            mode: "event",
            mainSelection: undefined,
            subSelection: undefined,
          })
        );
        break;

      default:
        goTo("production-start", { rmId: id });
    }
  };
  const renderMeta = () => {
    switch (mode) {
      case "packing": {
        if (!meta) return null;

        if (meta.mode === "product") {
          return (
            <View style={styles.detailsContainer}>
              <View style={styles.ratingContainer}>
                <DatabaseIcon color={getColor("green", 700)} size={12} />
                <C1 color={getColor("green", 700)}>
                  {meta.totalBags} bags | {meta.totalPackets} packets
                  {meta.events ? ` | ${meta.events} events` : ""}
                </C1>
              </View>
            </View>
          );
        }

        return (
          weight && (
            <View style={styles.detailsContainer}>
              <View style={styles.ratingContainer}>
                <DatabaseIcon color={getColor("green", 700)} size={12} />
                <C1 color={getColor("green", 700)}>
                  {weight}
                  {rating ? ` | ${rating}` : ""}
                  {meta.sku ? ` | ${meta.sku}` : ""}
                </C1>
              </View>
            </View>
          )
        );
      }

      /* -------- IN PROGRESS -------- */
     case "production":
  return (
    <View style={styles.detailsContainer}>
      {weight && (
        <View style={styles.ratingContainer}>
          <DatabaseIcon size={12} />
          <C1>{weight}</C1>
        </View>
      )}

      {lane && (
        <>
          <View style={styles.separator} />
          <View style={styles.ratingContainer}>
            <LaneIcon />
            <C1>{lane}</C1>
          </View>
        </>
      )}

      {rating && (
              <>
                <View style={styles.separator} />
                <View style={styles.ratingContainer}>
                  <StarIcon color={getColor("green", 700)} size={12} />
                  <C1 color={getColor("green", 700)}>{rating}</C1>
                </View>
              </>
            )}
    </View>
  );

      /* -------- COMPLETED -------- */
      case "production-completed":
        return (
          <View style={styles.detailsContainer}>
            {weight && (
              <View style={styles.ratingContainer}>
                <DatabaseIcon color={getColor("green", 700)} size={12} />
                <C1 color={getColor("green", 700)}>{weight}</C1>
              </View>
            )}

             {lane && (
        <>
          <View style={styles.separator} />
          <View style={styles.ratingContainer}>
            <LaneIcon />
            <C1>{lane}</C1>
          </View>
        </>
      )}

            {rating && (
              <>
                <View style={styles.separator} />
                <View style={styles.ratingContainer}>
                  <StarIcon color={getColor("green", 700)} size={12} />
                  <C1 color={getColor("green", 700)}>{rating}</C1>
                </View>
              </>
            )}
          </View>
        );

      /* -------- DEFAULT (PENDING) -------- */
      case "default":
      default:
        if (!weight) return null;

        return (
          <View style={[styles.detailsContainer, { gap: 4 }]}>
            {!lane ? (
              <>
                <B3 color={getColor("green", 700)}>Total weight:</B3>
                <B4 color={getColor("green", 700)}>{weight}</B4>
              </>
            ) : (
              <>
                <B4 color={getColor("green", 700)}>{weight}</B4>
                <View style={styles.separator} />
                <View style={styles.ratingContainer}>
                  <LaneIcon />
                  <B4 color={getColor("green", 700)}>{lane}</B4>
                </View>
                {rating && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.ratingContainer}>
                      <StarIcon color={getColor("green", 700)} size={12} />
                      <C1 color={getColor("green", 700)}>{rating}</C1>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        );
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      {BackgroundIcon && (
        <View style={styles.backgroundIcon}>
          <BackgroundIcon size={60} />
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.productImage}>
          <CustomImage
            src={
              getImageSource({
                image: name,
                options: { isProductionItem: true },
              }).image
            }
            width={42}
            height={42}
            resizeMode="cover"
          />
        </View>

        <View style={styles.details}>
          <H3>{name}</H3>
          {renderMeta()}
        </View>

        {actionLabel && (
          <Button variant="outline" size="sm" onPress={onActionPress}>
            {actionLabel}
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ItemCard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor("light"),
    borderRadius: 12,
    padding: 12,
    position: "relative",
    overflow: "hidden",
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  backgroundIcon: {
    position: "absolute",
    right: 4,
    bottom: 0,
    opacity: 0.07,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productImage: {
    backgroundColor: "#f3e6d0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  separator: {
    width: 1,
    height: "100%",
    backgroundColor: getColor("green", 100),
  },
});