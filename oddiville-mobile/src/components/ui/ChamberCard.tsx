import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomImage from "./CustomImage";
import { C1, H3 } from "../typography/Typography";
import Tag from "./Tag";
import { getColor } from "@/src/constants/colors";
import StarIcon from "../icons/page/StarIcon";
import Button from "./Buttons/Button";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { RawMaterialProps } from "@/src/types/ui";
import ShopIcon from "../icons/menu/ShopIcon";
import defaultImage from "@/src/assets/images/item-icons/Warehouse.png";
import { getRatingColor } from "@/src/utils/common";
import { getImageSource } from "@/src/utils/arrayUtils";

const ChamberCard = ({
  id,
  name,
  description,
  rating,
  disabled,
  href,
  detailByRating,
  quantity,
  chambers,
  category,
  image,
}: RawMaterialProps) => {
  const { goTo } = useAppNavigation();

  const handlePress = () => {
    if (!href) {
      console.warn("href is undefined, cannot navigate");
      return;
    }

    if (href === "other-products-detail") {
      goTo(href, {
        data: JSON.stringify({
          id,
          category,
          product_name: name,
          company: rating,
          chambers,
        }),
      });
    } else {
      goTo(href, {
        data: {
          id,
          description: description ?? "",
          quantity: quantity ?? "0",
          name,
          rating,
          chambers,
          image: image ?? "",
          detailByRating,
        },
        source: "chamber",
      });
    }
  };

  const resultRating =
    rating?.trim().replace(/(\d+(\.\d+)?) - \1/g, "$1") ?? "";

  let color: "green" | "blue" | "yellow" | "red";
  let Icon = StarIcon;

  if (category === "other") {
    color = "blue";
    Icon = ShopIcon;
  } else if (category === "packed") {
    color = "yellow";
    Icon = ShopIcon;
  } else {
    const ratingNumber = Math.round(Number(resultRating));
    const clampedRating = Math.min(5, Math.max(1, ratingNumber));
    color = getRatingColor(clampedRating as 1 | 2 | 3 | 4 | 5);
  }

  const tagIcon = <Icon size={12} color={getColor("light")} />;

const resolvedImage = 
  typeof image === 'string' && image.startsWith("http")
    ? image
    : getImageSource({
        image: name,
        options: { isChamberItem: true }
      }).image;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled && !href}
      style={[
        !rating ? styles.otherItemsCard : styles.card,
        disabled && styles.disabledCard,
      ]}
    >
      {category === "other" ? (
        <CustomImage
          src={resolvedImage}
          width={48}
          height={48}
          resizeMode="contain"
          style={[styles.image, disabled && styles.imageDisabled]}
        />
      ) : (
        <View style={[styles.productImage, { backgroundColor: typeof image === 'string' && image.startsWith("http") ? getColor("green", 300) : "#f3e6d0", borderRadius: 8, }]}>
          <CustomImage
            src={resolvedImage}
            width={40}
            height={40}
            resizeMode="contain"
            style={[styles.image, disabled && styles.imageDisabled]}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <H3 color={getColor("green", disabled ? 200 : 700)}>{name}</H3>
          {disabled ? (
            <Button onPress={handlePress} size="sm" variant="outline">
              Order
            </Button>
          ) : rating ? (
            <Tag color={color} size="xs" style={styles.tag} icon={tagIcon}>
              {resultRating}
            </Tag>
          ) : (
            <Tag
              color="blue"
              size="xs"
              style={styles.tag}
              icon={<ShopIcon size={12} color={getColor("light")} />}
            >
              Untitled
            </Tag>
          )}
        </View>
        {description && <C1 color={getColor("green", 400)}>{description}</C1>}
      </View>
    </TouchableOpacity>
  );
};

export default ChamberCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: getColor("light"),
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
  },
  otherItemsCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: getColor("green", 100),
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
  },
  disabledCard: {
    opacity: 0.7,
  },
  productImage: {
    padding: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: 8,
  },
  imageDisabled: {
    opacity: 0.5,
  },
  tag: {
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
