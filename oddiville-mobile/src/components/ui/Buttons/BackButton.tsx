import { StyleSheet, View } from 'react-native'
import React from 'react'
import { H2, H3 } from '../../typography/Typography'
import { BackButtonProps } from '@/src/types'
import { Pressable } from 'react-native'
import BackArrowIcon from '@/src/components/icons/page/BackArrowIcon'
import { getColor } from '@/src/constants/colors'
import { useRouter } from 'expo-router'
import { useAppNavigation } from '@/src/hooks/useAppNavigation'

const BackButton = ({ label, backRoute, backParams = "", onPress, style, ...props }: BackButtonProps) => {
    const router = useRouter();
    const { goTo } = useAppNavigation();

  const handlePress = () => {
    // 🔹 INTERNAL BACK
   if (onPress) {
      onPress();
      return;
    }

    // 🔹 App-level navigation back
    if (backRoute) {
      goTo(backRoute, backParams);
      return;
    }

    // 🔹 SAFE FALLBACK
    router.back();
  };
  return (
    <View style={[styles.HStack, styles.gap8, styles.alignCenter, style]} {...props}>
      <Pressable
  style={styles.backbutton}
  onPress={handlePress}>

      <BackArrowIcon />
    </Pressable>
      <H3>{label}</H3>
    </View>
  )
}

export default BackButton

const styles = StyleSheet.create({
  HStack: {
    flexDirection: "row"
  },
  alignCenter: {
    alignItems: "center"
  },
  gap8: {
    gap: 8,
  },
  backbutton: {
        backgroundColor : getColor("green"),
        padding: 8,
        borderRadius: 50
    }
})