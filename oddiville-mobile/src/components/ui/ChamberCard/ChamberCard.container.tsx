import React, { memo } from "react";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { RawMaterialProps } from "@/src/types/ui";
import ChamberCardView from "./ChamberCard.view";

export interface ChamberCardProps extends RawMaterialProps {
  onPressOverride?: () => void;
}

const ChamberCardContainer = (props: ChamberCardProps) => {
  const { goTo } = useAppNavigation();
  const { category, name, href, rating, chambers, disabled, onPressOverride } = props;

  const handlePress = () => {
    if (disabled) return;

    if (onPressOverride) {
      onPressOverride();
      return;
    }

    if (category === "material") {
      goTo("stock-detail", { product_name: name });
      return;
    }

    if (category === "other" && href) {
      goTo(href, {
        data: JSON.stringify({
          id: props.id,
          product_name: name,
          company: rating,
          chambers,
        }),
      });
      return;
    }

    if (category === "packed") {
      goTo("stock-detail", { product_name: name });
      return;
    }
  };

  return <ChamberCardView {...props} onPress={handlePress} />;
};

export default memo(ChamberCardContainer);