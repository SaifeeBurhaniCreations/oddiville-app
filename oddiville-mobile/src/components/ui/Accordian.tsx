import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DownChevron from '../icons/navigation/DownChevron'
import UpChevron from '../icons/navigation/UpChevron'
import { getColor } from '@/src/constants/colors'

const AccordianIcon = ({ open }: { open: boolean }) => {
  if (open) {
    return <UpChevron color={getColor("green", 700)} />;
  } else {
    return <DownChevron color={getColor("green", 700)} />;
  }
};

type AccordianProps = {
  open: boolean;
  onPress: () => void;
};

const Accordian = ({ open, onPress }: AccordianProps) => {
  return (
    <Pressable onPress={onPress} style={styles.accordian}>
      <AccordianIcon open={open} />
    </Pressable>
  );
};

export default Accordian;

const styles = StyleSheet.create({
    accordian : {
        backgroundColor: getColor("light"),
        padding: 6,
        borderRadius: 999,
    }
})