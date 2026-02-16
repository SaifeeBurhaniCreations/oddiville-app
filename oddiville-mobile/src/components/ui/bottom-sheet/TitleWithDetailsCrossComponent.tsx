import CrossIcon from "@/src/components/icons/page/CrossIcon";
import { B2, B6, C1, H2 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import { TitleWithDetailsCrossProps } from "@/src/types";
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import DatabaseIcon from "../../icons/page/DatabaseIcon";
import PencilIcon from "../../icons/common/PencilIcon";
import { useDispatch, useSelector } from "react-redux";
import { setIsPackageEdit } from "@/src/redux/slices/package-size.slice";
import { RootState } from "@/src/redux/store";

const TitleWithDetailsCrossComponent: React.FC<TitleWithDetailsCrossProps> = ({
  data,
  onClose,
}) => {
  const dispatch = useDispatch();
  const isEdit = useSelector(
    (state: RootState) => state.packageSizePackaging.isEdit,
  );

  const { title, description, details } = data;
  return (
    <View style={[styles.VStack, styles.gap4, description && styles.devider]}>
      <View style={styles.titleWithDetailsCross}>
        <H2>{title}</H2>
        <View style={styles.DetailsWithCross}>
          {details && !isEdit && (
            <React.Fragment>
              <View style={[styles.HStack, styles.gap4]}>
                {details?.icon === "database" ? (
                  <DatabaseIcon />
                ) : (
                  <Pressable onPress={() => dispatch(setIsPackageEdit(true))}>
                    <PencilIcon />
                  </Pressable>
                )}
                {details?.label && (
                  <B6 color={getColor("green", 700)}>{details?.label}:</B6>
                )}
                {details?.value && (
                  <C1 color={getColor("green", 700)}>{details?.value}</C1>
                )}
              </View>
              <View style={styles.separator} />
            </React.Fragment>
          )}
          <TouchableOpacity
            onPress={() => {
              dispatch(setIsPackageEdit(false));
              onClose?.();
            }}
          >
            <CrossIcon size={20} color={getColor("green", 700)} />
          </TouchableOpacity>
        </View>
      </View>
      {description && <B2>{description}</B2>}
    </View>
  );
};

export default TitleWithDetailsCrossComponent;

const styles = StyleSheet.create({
  titleWithDetailsCross: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  DetailsWithCross: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    gap: 8,
  },
  separator: {
    width: 1,
    height: "100%",
    backgroundColor: getColor("green", 100),
    borderRadius: 1,
  },
  HStack: {
    flexDirection: "row",
  },
  VStack: {
    flexDirection: "column",
  },
  gap4: {
    gap: 4,
  },
  devider: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
});
