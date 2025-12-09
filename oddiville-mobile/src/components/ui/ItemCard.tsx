import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { ItemCardProps } from "@/src/types/cards";
import { B3, B4, C1, H3 } from "../typography/Typography";
import { getColor } from "@/src/constants/colors";
import Button from "./Buttons/Button";
import StarIcon from "../icons/page/StarIcon";
import CustomImage from "./CustomImage";
import DatabaseIcon from "../icons/page/DatabaseIcon";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { getImageSource } from "@/src/utils/arrayUtils";
import LaneIcon from "../icons/common/LaneIcon";

const ItemCard = ({
  name,
  id,
  weight,
  rating,
  onActionPress,
  actionLabel,
  disabled = false,
  isProduction = false,
  backgroundIcon: BackgroundIcon,
  isActive,
  style,
  lane,
}: ItemCardProps) => {
  const { goTo } = useAppNavigation();

  const handlePress = () => {
    if (isProduction) {
      goTo("production-complete", { id });
    } else {
      goTo("production-start", { rmId: id });
    }
  };

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
                options: {
                  isProductionItem: true,
                },
              }).image
            }
            width={42}
            height={42}
            resizeMode="cover"
          />
        </View>

        <View style={styles.details}>
          <H3>{name}</H3>

          {isActive ? (
            <View style={styles.detailsContainer}>
              {weight && (
                <View style={styles.ratingContainer}>
                  <DatabaseIcon color={getColor("green", 700)} size={12} />
                  <C1 color={getColor("green", 700)}>{weight}</C1>
                </View>
              )}
              <View style={styles.separator} />
              {rating !== undefined && (
                <View style={styles.ratingContainer}>
                  <StarIcon color={getColor("green", 700)} size={12} />
                  <C1 color={getColor("green", 700)}>{rating}</C1>
                </View>
              )}
            </View>
          ) : (
            weight && (
              <View style={[styles.detailsContainer, { gap: 4 }]}>
                {!lane ? (
                  <React.Fragment>
                    <B3 color={getColor("green", 700)}>Total weight: </B3>
                    <B4 color={getColor("green", 700)}>{weight}</B4>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <B4 color={getColor("green", 700)}>{weight}</B4>
                    <View style={styles.separator} />
                    <View style={styles.ratingContainer}>
                      <LaneIcon />
                      <B4 color={getColor("green", 700)}>{lane}</B4>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.ratingContainer}>
                      <StarIcon color={getColor("green", 700)} size={12} />
                      <C1 color={getColor("green", 700)}>{rating}</C1>
                    </View>
                  </React.Fragment>
                )}
              </View>
            )
          )}
        </View>

        {actionLabel && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              onActionPress && onActionPress(),
                goTo("production-start", { id });
            }}
          >
            {actionLabel}
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ItemCard;

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
    gap: 14,
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
