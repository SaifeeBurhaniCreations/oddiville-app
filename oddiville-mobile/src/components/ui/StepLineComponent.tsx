import { getColor } from '@/src/constants/colors'
import { StepLineProps } from '@/src/types'
import { StyleSheet, View } from 'react-native'

const StepLineComponent: React.FC<StepLineProps> = ({ count, active, color }) => {

  return (
    <View style={styles.stepLineWrapper}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepLine,
            index <= active - 1 ? styles.active : styles.inActive
          ]}
        />
      ))}
    </View>
  )
}

export default StepLineComponent

const styles = StyleSheet.create({
  stepLineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  stepLine: {
    height: 4,
    borderRadius: 2,
    flex: 1
  },
  inActive: {
    backgroundColor: getColor("green", 100)
  },
  active: {
    backgroundColor: getColor("green")
  },
})