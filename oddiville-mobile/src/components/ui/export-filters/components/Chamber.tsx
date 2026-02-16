import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import Select from "../../Select";
import { FilterComponentProps } from "@/src/types/export/types";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { getPlaceholder } from "@/src/utils/inputUtils";
import { useChamber } from "@/src/hooks/useChambers";
import { getColor } from "@/src/constants/colors";
import ChamberIcon from "@/src/components/icons/common/ChamberIcon";
import { B1 } from "@/src/components/typography/Typography";

const Chambers = ({ state, setState }: FilterComponentProps) => {
  const dispatch = useDispatch();
  const { selectedChambers } = useSelector(
    (state: RootState) => state.rawMaterial,
  );
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { data: chambers } = useChamber();

  const handleSelect = () => {
    dispatch(setSource("export-chamber"));
    validateAndSetData("nothing", "multiple-chamber-list");
  };

  const displayValue = useMemo(() => {
    if (!selectedChambers.length) return "";
    const joined = selectedChambers.join(", ");
    return joined.length > 32 ? joined.slice(0, 32) + "..." : joined;
  }, [selectedChambers]);

  const placeholder = getPlaceholder("Select chambers", displayValue);

  return (
    <View>
      <Select
        style={{ width: "100%" }}
        value={placeholder}
        options={[]}
        onPress={handleSelect}
        showOptions={false}
      >
        Chambers
      </Select>
      {selectedChambers?.map((chamberName) => (
        <View style={[styles.chamberCard, styles.borderBottom]}>
          <View style={styles.Hstack}>
            <View style={styles.iconWrapper}>
              <ChamberIcon color={getColor("green")} size={32} />
            </View>

            <View style={styles.Vstack}>
              <B1>{String(chamberName).slice(0, 48)}...</B1>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default Chambers;

const styles = StyleSheet.create({
  accordianBody: {
    flexDirection: "column",
    backgroundColor: getColor("light"),
  },
  packageRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: getColor("green", 100, 0.3),
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  seprator: {
    borderColor: getColor("green", 100),
    borderBottomWidth: 1,
  },
  PkgGroup: {
    flexDirection: "column",
    gap: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 8,
    borderColor: getColor("green", 100),
  },
  lastPkgGroup: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  firstPkgGroup: {
    borderTopWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
  chamberCard: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    minHeight: 48,
    paddingTop: 16,
  },
  Vstack: {
    flexDirection: "column",
    flexShrink: 1,
  },
  JustifyBetween: {
    justifyContent: "space-between",
  },
});
