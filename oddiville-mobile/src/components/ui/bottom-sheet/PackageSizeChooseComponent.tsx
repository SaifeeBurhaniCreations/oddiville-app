import { StyleSheet, View, Pressable } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getColor } from "@/src/constants/colors";
import { getIcon } from "@/src/utils/iconUtils";
import { SubHeading } from "../../typography/Typography";
import Checkbox from "../Checkbox";
import { RootState } from "@/src/redux/store";
import {
  packageSize,
  togglePackageSize,
} from "@/src/redux/slices/bottomsheet/package-size.slice";
import { PackageSizeChooseComponentProps } from "@/src/types";
import { setSource } from "@/src/redux/slices/unit-select.slice";
import {
  DispatchPackageSize,
  toggleDispatchPackageSize,
} from "@/src/redux/slices/bottomsheet/dispatch-package-size.slice";
type Unit = "gm" | "kg";

function normalizeUnit(raw: string | null | undefined): Unit | null {
  if (!raw) return null;
  const u = raw.toLowerCase().replace(/\.$/, "");
  if (["g", "gm", "gram", "grams"].includes(u)) return "gm";
  if (["kg", "kgs", "kilogram", "kilograms"].includes(u)) return "kg";
  return null;
}

function parsePackageString(
  pkgStr: string | null | undefined
): { size: number; unit: Unit | null; rawSize: string } | null {
  if (!pkgStr) return null;

  const s = String(pkgStr).trim();
  if (!s) return null;

  if (/\bNaN\b/i.test(s)) return null;

  const numMatch = s.match(/-?\d+(\.\d+)?/);
  if (!numMatch) return null;
  const size = parseFloat(numMatch[0]);
  if (isNaN(size)) return null;

  const unitMatch = s.match(/\b(kgs?|kilograms?|gms?|grams?|gm|g)\b/i);
  const normalized = normalizeUnit(unitMatch?.[0] ?? null);
  if (!normalized) return null;

  const isUnitAlready =
    String(size).includes("kg") || String(size).includes("gm");
  return { size, unit: normalized, rawSize: pkgStr };
}

const PackageSizeChooseComponent = ({
  data,
}: PackageSizeChooseComponentProps) => {
  const selected = useSelector((state: RootState) => {
    if (data.source === "dispatch") {
      if (!data.productId) return [];
      return (
        state.dispatchPackageSize.selectedSizesByProduct[data.productId] ?? []
      );
    }

    return state.packageSize.selectedSizes;
  });

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      {data?.list
        ?.map((item, index) => {
          const parsed = parsePackageString(item?.name);
          if (!parsed) {
            console.log(
              `[PackageSizeChooseComponent] Invalid package string: "${item?.name}"`
            );
            return null;
          }
          const key = `${parsed.size}-${parsed.unit}`;

          const packageData =
            data.source === "dispatch"
              ? ({
                  ...item,
                  key,
                  size: parsed.size,
                  rawSize: parsed.rawSize,
                  unit: parsed.unit,
                  count: Number(item.count),
                } as DispatchPackageSize)
              : ({
                  ...item,
                  size: parsed.size,
                  rawSize: parsed.rawSize,
                  unit: parsed.unit,
                } as packageSize);

          const isSelected =
            data.source === "dispatch"
              ? (selected as DispatchPackageSize[]).some(
                  (s) => s.key === (packageData as DispatchPackageSize).key
                )
              : (selected as packageSize[]).some(
                  (s) => s.rawSize === (packageData as packageSize).rawSize
                );
          console.log("isSelected", isSelected);

          return (
            <Pressable
              key={item.name}
              onPress={() => {
                if (data.source === "dispatch") {
                  const key = `${parsed.size}-${parsed.unit}`;

                  const dispatchPkg: DispatchPackageSize = {
                    key,
                    name: item.name,
                    icon: item.icon,
                    size: parsed.size,
                    rawSize: parsed.rawSize,
                    unit: parsed.unit,
                    count: Number(item.count),
                    isChecked: item.isChecked,
                  };

                  if (!data.productId) {
                    console.warn(
                      "Missing productId for dispatch package selection"
                    );
                    return;
                  }

                  dispatch(
                    toggleDispatchPackageSize({
                      productId: data.productId,
                      pkg: dispatchPkg,
                    })
                  );
                  dispatch(setSource("dispatch"));
                  return;
                }

                const pkg: packageSize = {
                  ...item,
                  size: parsed.size,
                  rawSize: parsed.rawSize,
                  unit: parsed.unit,
                };

                dispatch(togglePackageSize(pkg));
                dispatch(setSource("package"));
              }}
              style={[
                styles.row,
                index < data?.list?.length - 1 && styles.separator,
              ]}
            >
              <Checkbox checked={isSelected} />
              <View style={styles.icon}>{getIcon(item.icon)}</View>
              <SubHeading>{item.name}</SubHeading>
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
