import Svg, { Rect } from 'react-native-svg';
import { View } from 'react-native';
import { getColor } from '@/src/constants/colors';

const DashedBorder = () => {
  return (
    <View style={{ padding: 20 }}>
      <Svg height="120" width="100%">
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100"
          stroke={getColor("green")}
          strokeWidth="2"
          strokeDasharray="10,6" 
          fill={getColor("light")}
          rx="16"
        />
      </Svg>
    </View>
  );
};

export default DashedBorder