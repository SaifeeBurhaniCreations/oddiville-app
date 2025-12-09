import { getColor } from "@/src/constants/colors";
import { getFillColorByPercent } from "@/src/utils/numberUtils";
import { View } from "moti";
import { B6, H3, H5 } from "../typography/Typography";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const chamberSize = screenWidth / 2 - 30;

const VIEW_W = 100;
const VIEW_H = 80;

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const ChamberCard = ({
  filled,
  capacity,
  name,
}: {
  filled: number;
  capacity: number;
  name: string;
}) => {
  const f = Number(filled ?? 0);
  const c = Number(capacity ?? 0);
  const percent = c > 0 && Number.isFinite(f) ? clamp((f / c) * 100, 0, 100) : 0;
  const colorName = getFillColorByPercent(percent);
  const color = colorName;

  const y = VIEW_H * (1 - percent / 100);

  const amp = Math.max(1, VIEW_H * 0.03);
  const leftControlY = clamp(y - amp, 0, VIEW_H);
  const middleY = clamp(y + (amp * 0.2), 0, VIEW_H);
  const rightControlY = clamp(y - amp, 0, VIEW_H);

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
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: 0 }}
        >
          <Defs>
            <ClipPath id="clip">
              <Rect x="0" y="0" width={VIEW_W} height={VIEW_H} rx="10" />
            </ClipPath>
          </Defs>

          <Rect
            x="0"
            y="0"
            width={VIEW_W}
            height={VIEW_H}
            fill={getColor(color, 100)}
            clipPath="url(#clip)"
          />

          <Path
            d={`
              M 0 ${y}
              Q ${VIEW_W * 0.25} ${leftControlY} ${VIEW_W * 0.5} ${middleY}
              T ${VIEW_W} ${rightControlY}
              V ${VIEW_H}
              H 0
              Z
            `}
            fill={getColor(color)}
            clipPath="url(#clip)"
          />
        </Svg>

        <View style={styles.chamberOverlay}>
          <H3 color={getColor("green", 700)}>{Math.round(percent)}%</H3>
          <B6 color={getColor("green", 700)}>
            {f.toFixed(2)}Kg / {c}Kg
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
});
