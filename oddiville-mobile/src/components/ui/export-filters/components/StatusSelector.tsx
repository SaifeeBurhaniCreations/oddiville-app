import { StyleSheet, Text, View } from "react-native";
import Select from "../../Select";
import { getPlaceholder } from "@/src/utils/inputUtils";
import { useMemo } from "react";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { B1 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import ClockIcon from "@/src/components/icons/common/ClockIcon";
import { FilterComponentProps } from "@/src/types/export/types";
import { setSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";

export const truncate = (value: any, max = 32) => {
  const text = String(value ?? "");
  return text.length > max ? text.slice(0, max) + "..." : text;
};

const StatusSelector = ({ state, setState }: FilterComponentProps) => {
    const dispatch = useDispatch();

const selectedStatuses = useSelector(
  (state: RootState) => state.exportStatus.selectedStatuses
);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const handleSelect = () => {
    dispatch(setSource("export-status")); 
    validateAndSetData("nothing", "select-status");
  };

  const displayValue = useMemo(() => {
    if (!selectedStatuses.length) return "";
    const joined = selectedStatuses.join(", ");
    return joined.length > 32 ? joined.slice(0, 32) + "..." : joined;
  }, [selectedStatuses]);

  const placeholder = getPlaceholder("Select status", displayValue);

  return (
    <View>
      <Select
        style={{ width: "100%" }}
        value={placeholder}
        options={[]}
        onPress={handleSelect}
        showOptions={false}
      >
        Select status
      </Select>
      {selectedStatuses?.map((status) => (
        <View style={[styles.chamberCard, styles.borderBottom]} key={status}>
          <View style={styles.Hstack}>
            <View style={styles.iconWrapper}>
              <ClockIcon color={getColor("green")} size={32} />
            </View>

            <View style={styles.Vstack}>
              <B1>{truncate(status)}</B1>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default StatusSelector;

const styles = StyleSheet.create({
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
  borderBottom: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
});
