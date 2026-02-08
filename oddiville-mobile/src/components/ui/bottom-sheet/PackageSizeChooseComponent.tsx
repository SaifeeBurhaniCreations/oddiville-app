import { StyleSheet, View, Pressable } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getColor } from "@/src/constants/colors";
import { getIcon } from "@/src/utils/iconUtils";
import { SubHeading } from "../../typography/Typography";
import Checkbox from "../Checkbox";
import { RootState } from "@/src/redux/store";
import {
  PackageSize,
  togglePackageSize,
} from "@/src/redux/slices/bottomsheet/package-size.slice";
import { PackageSizeChooseComponentProps } from "@/src/types";
import { setSource } from "@/src/redux/slices/unit-select.slice";
import {
  DispatchPackageSize,
  toggleDispatchPackageSize,
} from "@/src/redux/slices/bottomsheet/dispatch-package-size.slice";

type Unit = "gm" | "kg";

const EMPTY_ARRAY: never[] = [];
// const isSelected = selectedKeys.has(`${size}-${unit}`);

const PackageSizeChooseComponent = ({
  data,
}: PackageSizeChooseComponentProps) => {
  const dispatch = useDispatch();

  const selected = useSelector((state: RootState) => {
    if (data.source === "dispatch") {
      if (!data.productId) return EMPTY_ARRAY;
      return (
        state.dispatchPackageSize.selectedSizesByProduct[data.productId] ??
        EMPTY_ARRAY
      );
    }
    return state.packageSize.selectedSizes;
  });

  return (
    <View style={styles.container}>
      {data?.list
        ?.map((item, index) => {
          const size = Number(item.size);
          const unit = item.unit as Unit | undefined;

          if (!size || !unit) {
            console.warn(
              "[PackageSizeChooseComponent] Invalid item:",
              item
            );
            return null;
          }

          const key = `${size}-${unit}`;

          const isSelected =
            data.source === "dispatch"
              ? (selected as DispatchPackageSize[]).some(
                  (s) => s.key === key
                )
              : (selected as PackageSize[]).some(
                  (s) => s.rawSize === item.name
                );

          return (
            <Pressable
              key={key}
              onPress={() => {
                if (data.source === "dispatch") {
                  if (!data.productId) return;

                  const dispatchPkg: DispatchPackageSize = {
                    key,
                    name: item.name,
                    icon: item.icon, // enum, NOT component
                    size,
                    rawSize: item.name,
                    unit,
                    count: Number(item.count ?? 0),
                    isChecked: isSelected,
                  };

                  dispatch(
                    toggleDispatchPackageSize({
                      productId: data.productId,
                      pkg: dispatchPkg,
                    })
                  );

                  dispatch(setSource("dispatch"));
                  return;
                }

                const pkg: PackageSize = {
                  name: item.name,
                  icon: item.icon,
                  size,
                  rawSize: item.name,
                  unit,
                  isChecked: isSelected,
                };

                dispatch(togglePackageSize(pkg));
                dispatch(setSource("package"));
              }}
              style={[
                styles.row,
                index < data.list.length - 1 && styles.separator,
              ]}
            >
              <Checkbox checked={isSelected} />

              <View style={styles.icon}>
                {getIcon(item.icon)}
              </View>

              <SubHeading>
                {item.name}
                {typeof item.count === "number" ? ` (${item.count})` : ""}
              </SubHeading>
            </Pressable>
          );
        })
        .filter(Boolean)}
    </View>
  );
};

export default PackageSizeChooseComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    width: "100%",
    paddingBottom: 12,
  },
  icon: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: getColor("green", 500, 0.1),
  },
});