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
): { size: number; unit: Unit | string; rawSize: string } | null {
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
  return { size, unit: isUnitAlready ? "" : normalized, rawSize: pkgStr };
}

const PackageSizeChooseComponent = ({
  data,
}: PackageSizeChooseComponentProps) => {
  const selected = useSelector(
    (state: RootState) => state.packageSize.selectedSizes
  );
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      {data
        ?.map((item, index) => {
          const parsed = parsePackageString(item?.name);
          if (!parsed) {
            console.log(
              `[PackageSizeChooseComponent] Invalid package string: "${item?.name}"`
            );
            return null;
          }
          const packageData: packageSize = {
            ...item,
            size: parsed.size,
            rawSize: parsed.rawSize,
            unit: parsed.unit,
          };

          const isSelected = selected.some(
            (s) => s.rawSize === packageData.rawSize
          );

          return (
            <Pressable
              key={item.name}
              onPress={() => dispatch(togglePackageSize(packageData))}
              style={[styles.row, index < data?.length - 1 && styles.separator]}
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
