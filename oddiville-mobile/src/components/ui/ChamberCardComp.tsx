import { getColor } from "@/src/constants/colors";
import { getFillColorByPercent } from "@/src/utils/numberUtils";
import { View } from "moti";
import { B6, H3, H5 } from "../typography/Typography";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import { Dimensions, StyleSheet } from "react-native";
const screenWidth = Dimensions.get("window").width;
const chamberSize = screenWidth / 2 - 30;

const ChamberCard = ({
  filled,
  capacity,
  name,
}: {
  filled: number;
  capacity: number;
  name: string;
}) => {
  const percent = (filled / capacity) * 100;
  const heightPercent = 100 - percent;
  const color = getFillColorByPercent(percent);

  return (
    <View
      style={[
        styles.chamberContainer,
        { backgroundColor: getColor(color, 100) },
      ]}
    >
      <View style={styles.chamber}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 80"
          style={{ position: "absolute", bottom: 0 }}
        >
          <Defs>
            <ClipPath id="clip">
              <Rect x="0" y="0" width="100" height="100" rx="10" />
            </ClipPath>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill={getColor(color, 100)}
            clipPath="url(#clip)"
          />
          <Path
            d={`M 0 ${heightPercent}
                Q 25 ${heightPercent - 2}, 50 ${heightPercent}
                T 100 ${heightPercent}
                V 100
                H 0
                Z`}
            fill={getColor(color)}
            clipPath="url(#clip)"
          />
        </Svg>
        <View style={styles.chamberOverlay}>
          <H3 color={getColor("green", 700)}>{Math.round(percent)}%</H3>
          <B6 color={getColor("green", 700)}>
            {filled}Kg / {capacity}Kg
          </B6>
          <H5 color={getColor("light")}>{name}</H5>
        </View>
      </View>
    </View>
  );
};

export default ChamberCard;

const styles = StyleSheet.create({
  chamberContainer: {
    width: chamberSize,
    height: chamberSize * 1.2,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  chamber: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  chamberOverlay: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },

});