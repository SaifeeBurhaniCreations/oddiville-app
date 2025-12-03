import { StyleSheet, TouchableOpacity, View } from "react-native";
import { memo, useMemo } from "react";
import { getColor } from "@/src/constants/colors";
import { B6, C1, H3, H6 } from "../../typography/Typography";
import CustomImage from "../CustomImage";
import fallbackTruck from "@/src/assets/images/fallback/truck-fallback.png";
import { TruckProps } from "@/src/types";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { formatDateAgo } from "@/src/utils/dateUtils";
import Calendar12Icon from "@/src/components/icons/page/Calendar12Icon";
import Tag from "../Tag";

const TruckCard = memo(({
  color = "green",
  name,
  profileImg,
  extra_details,
  arrival_date,
  id,
  bgSvg: BgSvg,
  disabled = false,
  bottomConfig,
  href,
  badgeText,
  cardref,
}: TruckProps) => {
  const { goTo } = useAppNavigation();
  
  const mainColor = useMemo(() => getColor(color, disabled ? 200 : 700), [color, disabled]);
  const subColor = useMemo(() => getColor(color, disabled ? 200 : 400), [color, disabled]);
  const avatarStyle = useMemo(() => [{ opacity: disabled ? 0.5 : 1 }, styles.avatar], [disabled]);

  const handleOpen = () => {
    if (href) {
      goTo(href, { id: id })
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleOpen}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {BgSvg && <BgSvg style={styles.cardBackgroundImage} />}

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.leftRow}>
          <CustomImage
                style={avatarStyle}
                src={profileImg ?? fallbackTruck}
                width={40}
                height={40}
              />
            <View style={styles.nameSection}>
              <View style={styles.nameRow}>
                <H3 color={mainColor}>{name}</H3>
                {badgeText && (
                 <Tag size="md">
                      {badgeText}
                    </Tag>
                )}
              </View>
              <C1 color={subColor}>{extra_details}</C1>
            </View>
          </View>
          <View style={styles.headerRow}>
            <Calendar12Icon />
            <B6 color={mainColor}>
              {arrival_date ? formatDateAgo(arrival_date) : ""}
            </B6>
          </View>
        </View>

        {bottomConfig && (
          <View style={styles.nameSection}>
            <H6>{bottomConfig?.title}</H6>
            <C1 color={subColor}>{bottomConfig?.description}</C1>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default TruckCard;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: getColor("light", 500),
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
},
  card: {
    padding: 12,
    gap: 8,
    backgroundColor: getColor("light"),
    borderRadius: 16,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  nameSection: {
    flexDirection: "column",
    gap: 0,
    flexShrink: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  avatar: {
    borderRadius: 8,
  },
  roleDefinationText: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardBackgroundImage: {
    position: "absolute",
    bottom: 0,
    right: 12,
    width: 120,
    height: 120,
    opacity: 0.3,
    zIndex: 1,
    resizeMode: "contain",
},
});
