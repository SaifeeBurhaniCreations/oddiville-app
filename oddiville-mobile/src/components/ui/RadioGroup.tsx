import { StyleSheet, View, Pressable, ViewStyle } from 'react-native'
import Radio from './Radio'

type Option = { text: string }

const RadioGroup = ({
  options,
  selected,
  onSelect,
  style
}: {
  options: Option[]
  selected: string | number
  onSelect: (value: string | number) => void;
  style: ViewStyle,
}) => {
  return (
    <View style={[styles.radios, style]}>
      {options.map((option, index) => (
        <Pressable key={index}>
          <Radio onPress={()=>onSelect(option.text)} isChecked={selected === index}>{option.text}</Radio>
        </Pressable>
      ))}
    </View>
  )
}

export default RadioGroup

const styles = StyleSheet.create({
  radios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})
