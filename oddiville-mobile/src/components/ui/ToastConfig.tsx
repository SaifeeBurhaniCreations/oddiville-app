import { ToastConfig } from 'react-native-toast-message';
import { View, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B4 } from '../typography/Typography';

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <View style={styles.toastContainer}>
      <B4 style={styles.toastText}>{text1}</B4>
    </View>
  ),
};

const styles = StyleSheet.create({
    toastContainer: {
      backgroundColor: '#00110D',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 50,
      marginHorizontal: 32,
      alignSelf: 'center',
      position: 'absolute',
      zIndex: 4 ,
    },
    toastText: {
      color: getColor("light"),
      textAlign: 'center',
    },
  });
  