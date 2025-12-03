import { B2 } from '@/src/components/typography/Typography'
import { Pressable, StyleSheet, View } from 'react-native'
import Checkbox from '../Checkbox'
import { StockDataItem, TitleWithCheckboxProps } from '@/src/types'
import { getColor } from '@/src/constants/colors'
import React, { useState } from 'react'
import { RootState } from '@/src/redux/store'
import { runFilter } from '@/src/utils/bottomSheetUtils'
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet'
import { useChamberStock } from '@/src/hooks/useChamberStock'
import { useSelector } from 'react-redux'
import { pluck } from '@/src/sbc/utils/pluck/pluck'
import { FilterEnum } from '@/src/schemas/BottomSheetSchema'

const getSelectedFilters = (node: Record<string, any>, key: string): string[] => {
  const keys = key.split(':');
  let current: any = node;
  for (const part of keys) {
    if (!current[part]) return [];
    current = current[part];
    if (current.children) current = current.children;
  }
  if (typeof current.value === 'string' && current.value.length > 0) return [current.value];
  if (Array.isArray(current.value)) return current.value;
  return [];
};

const TitleWithCheckboxComponent: React.FC<TitleWithCheckboxProps> = ({ data }) => {
  const { data: stockData = [] } = useChamberStock();
  const { meta } = useSelector((state: RootState) => state.bottomSheet);

  const filters = useSelector((state: RootState) => state.filter.filters);
  const [mainSelection, setMainSelection] = useState<string>("");
  const [subSelection, setSubSelection] = useState<string>("");

  const { key } = data;
  const prevSelected = getSelectedFilters(filters, key);

  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const filterDataMap: Record<string, any> = {
    "chamber:detailed:Name": pluck([...stockData, { id: "all", product_name: "All", category: "material", image: "", unit: "", chamber: [] }].filter((value: StockDataItem) => value.category === "material"), "product_name"),
    "chamber:detailed:Category": Array.from(new Set(pluck(stockData, "category"))),
    "raw-material:overview:Name": pluck([...stockData, { id: "all", product_name: "All", category: "material", image: "", unit: "", chamber: [] }].filter((value: StockDataItem) => value.category === "material"), "product_name"),
  };

  const toggleCheck = (filterName: string) => {

    if (meta?.mode === "select-main") {
      setMainSelection(key);
      setSubSelection(filterName);

      runFilter({
        key,
        validateAndSetData,
        mode: "select-detail",
        filterData: filterDataMap[`${key}:${filterName}`],
        extraMeta: { mainSelection: key, subSelection: filterName }
      });

    } else if (meta?.mode === "select-detail") {
      // const { mainSelection, subSelection } = meta || {};
      // if (mainSelection && subSelection) {
      //   dispatch(applyFilter({ path: [mainSelection, subSelection, filterName].filter(Boolean), value: filterName }));
      // } else {
      //   console.warn("No main/sub selection in meta!");
      // }
    }
  };

  return (
    <View style={styles.container}>
      {data?.options?.map((detail, index) => (
        <React.Fragment key={index}>
          <Pressable style={styles.roleCheckbox} onPress={() => toggleCheck(detail.text)}>
            <Checkbox checked={prevSelected.includes(detail.text)} />
            <B2>{detail.text}</B2>
          </Pressable>
          {index < data?.options.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  )
}

export default TitleWithCheckboxComponent

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 16,
  },
  roleCheckbox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  separator: {
    height: 1,
    backgroundColor: getColor("green", 100),
    width: "100%"
  },
})