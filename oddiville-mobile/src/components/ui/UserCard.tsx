import { StyleSheet, TouchableOpacity, View } from "react-native";
import { memo, useMemo } from "react";
import { getColor } from "@/src/constants/colors";
import { B4, C1, H3, H6 } from "../typography/Typography";
import Tag from "./Tag";
import CustomImage from "./CustomImage";
import ActionButton from "./Buttons/ActionButton";
import { UserProps } from "@/src/types";
import { validTagRole } from "@/src/utils/userUtils";
import Button from "./Buttons/Button";
import ThreeDot from "../icons/common/ThreeDot";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

const UserCard = memo(
  ({
    color,
    name,
    profileImg,
    extra_details,
    role = "supervisor",
    policies = [],
    label,
    username,
    access,
    disabled = false,
    roleDefination,
    bottomConfig,
    href,
    cardref,
    isShowAccess,
    onPress,
    onActionPress,

    tempDisabled = false,
  }: UserProps) => {
    const { goTo } = useAppNavigation();
    const { validateAndSetData } = useValidateAndOpenBottomSheet()
    
    const tagColor =
      role === "superadmin" ? "yellow" : role === "admin" ? "blue" : role === "supervisor" && policies?.length === 6 ? "green" : "red";
    const mainColor = useMemo(
      () => getColor(color ?? "yellow", disabled ? 200 : 700),
      [color, disabled]
    );
    const subColor = useMemo(
      () => getColor(color ?? "blue", disabled ? 200 : 400),
      [color, disabled]
    );
    const avatarStyle = useMemo(
      () => [{ opacity: disabled ? 0.5 : 1 }, styles.avatar],
      [disabled]
    );

    const showAccess =
      !!label &&
      access &&
      access?.length > 0 &&
      role !== "admin" &&
      role !== "superadmin";

    const handleOpen = () => {
      if (!disabled && cardref) {
        goTo(cardref, { userId: username });
      }
    };

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress && onPress() || handleOpen()}
        activeOpacity={1}
        disabled={disabled}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.leftRow}>
              {profileImg && (
                <CustomImage
                  style={avatarStyle}
                  src={profileImg}
                  width={40}
                  height={40}
                />
              )}
              <View style={styles.nameSection}>
                <View style={styles.nameRow}>
                  <H3 color={mainColor}>{name}</H3>
                  {validTagRole(role) && tagColor !== "red" && (
                    <Tag color={tagColor} size="md">
                      {role}
                    </Tag>
                  )}
                </View>
                <C1 color={subColor}>{extra_details}</C1>
              </View>
            </View>
            {isShowAccess ? (
              <Button
                variant="outline"
                size="icon"
                style={{ borderColor: getColor("green", 100) }}
              >
                <ThreeDot />
              </Button>
            ) : (
              !tempDisabled && username && role !== "superadmin" && (
                <ActionButton
                  icon={ThreeDot}
                  onPress={() => onActionPress && onActionPress(username)}
                />
              )
            )}
            
          </View>

          {showAccess && (
            <View style={styles.nameSection}>
              <H6>{label}</H6>
              <C1 color={subColor}>{access.join(", ")}</C1>
            </View>
          )}

          {bottomConfig && (
            <View style={styles.nameSection}>
              <H6>{bottomConfig?.title}</H6>
              <C1 color={subColor}>{bottomConfig?.description}</C1>
            </View>
          )}
        </View>
        {roleDefination && (
          <B4 color={getColor("light")} style={styles.roleDefinationText}>
            {roleDefination}
          </B4>
        )}
      </TouchableOpacity>
    );
  }
);

export default UserCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor("green"),
    borderRadius: 16,
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
    alignItems: "center",
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
    gap: 4,
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
});
