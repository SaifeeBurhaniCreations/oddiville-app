import { getColor } from '@/src/constants/colors'
import { StyleSheet, View } from 'react-native'
import { B2 } from '../typography/Typography'

const Alert = ({color = "red", text}: {color?: "red" | "green" | "blue" | "yellow", text: string}) => {
  return (
    <View style={[styles.alert, {backgroundColor: getColor(color, 100), borderColor: getColor(color),}]}>
      <B2 color={getColor(color, 700)}>{text}</B2>
    </View>
  )
}

export default Alert

const styles = StyleSheet.create({
  alert: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    
  }
})