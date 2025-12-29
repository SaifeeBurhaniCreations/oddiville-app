import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import InfoCircleIcon from '../icons/common/InfoCircleIcon';
import { getColor } from '@/src/constants/colors';
import { B6, H6 } from '../typography/Typography';

type TooltipInfoProps = {
  tooltipText?: {
    title: string;
    description: string;
  };
  showTooltip?: boolean;
};

const { width: screenWidth } = Dimensions.get("screen")
const Tooltip: React.FC<TooltipInfoProps> = ({ tooltipText, showTooltip = true }) => {
  const [visible, setVisible] = useState(false);

  if (!showTooltip) return null;

  const toggleTooltip = () => setVisible(!visible);

  return (
    <Pressable onPress={toggleTooltip} style={styles.wrapper}>
      <InfoCircleIcon />
      {visible && (
        <View style={styles.tooltip}>
          <View style={{ justifyContent: "center" }}>
            <H6 style={styles.tooltipText}>{tooltipText?.title}</H6>
            <B6 style={styles.tooltipText}>{tooltipText?.description}</B6>
          </View>
          <View style={styles.triangle} />
        </View>
      )}

    </Pressable>
  );
};

export default Tooltip;

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 8,
    position: 'relative',
    width: "100%"
  },
  tooltip: {
    position: 'absolute',
    top: Number(`-${(screenWidth * 0.24)}`),
    left: Number(`-${screenWidth * 0.27}`),
    backgroundColor: '#00110D',
    padding: 6,
    zIndex: 10,
    maxWidth: screenWidth * 0.56,
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    color: getColor("light"),
    textAlign: 'center',
  },
  triangle: {
    position: 'absolute',
    bottom: -9, 
    left: '50%',
    marginLeft: screenWidth * 0.035, 
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00110D',
  },
  
});
