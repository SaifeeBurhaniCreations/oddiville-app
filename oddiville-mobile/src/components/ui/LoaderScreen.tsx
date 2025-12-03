import { Dimensions, StyleSheet, StatusBar as RNStatusBar, Platform } from 'react-native'
import { getColor } from '@/src/constants/colors'
import CustomImage from '@/src/components/ui/CustomImage'

import { StatusBar } from "expo-status-bar";
import { MotiView } from 'moti';

const { width: screenWidth } = Dimensions.get("screen");
const logoWidth = screenWidth * 0.7; 
const logoHeight = logoWidth * (190 / 280); 

const SCREEN_WIDTH = Dimensions.get('window').width;

const LoaderScreen = () => {

  return (
    <MotiView
    from={{ translateY: SCREEN_WIDTH, opacity: 0 }}
    animate={{ translateY: 0, opacity: 1 }}
    transition={{
      type: 'timing',
      duration: 600,
    }}
    style={[styles.pageContainer, { paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0 }]}
  >
      <StatusBar backgroundColor={getColor("green")} style="light" />

      <CustomImage src={require("@/src/assets/images/logo.png")} width={logoWidth} height={logoHeight} />
    </MotiView>
  )
}

export default LoaderScreen

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor('green'),
    justifyContent: "center",
    alignItems: "center",
},
})