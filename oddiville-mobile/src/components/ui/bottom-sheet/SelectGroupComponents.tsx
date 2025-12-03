import { StyleSheet, View } from 'react-native'
import Select from '../Select'
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { SelectGroupProps } from '@/src/types';

const SelectGroupComponent = ({ data }: SelectGroupProps) => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  
  const { labels, values } = data;
  
  const handleFirstSelectPress = () => {
    validateAndSetData("abcd1", "add-raw-material");
  };

  const handleSecondSelectPress = () => {
    validateAndSetData("abcd1", "add-raw-material");

  };
  return (
    <View style={styles.selectGroup}>
       <Select
       value={values[0]}
        style={styles.flexGrow}
        isVirtualised={false}
        showOptions={false}
        onPress={handleFirstSelectPress}>
          {labels[0]}
          </Select>
      <Select
      value={values[1]}
        style={styles.flexGrow}
        isVirtualised={false}
        showOptions={false}
        onPress={handleSecondSelectPress}>
          {labels[1]}
          </Select>
    </View>
  )
}

export default SelectGroupComponent

const styles = StyleSheet.create({
  selectGroup: {
    flexDirection: "row",
    flex: 1,
    gap: 16
  },
  flexGrow: {
    flex: 1
  }
})