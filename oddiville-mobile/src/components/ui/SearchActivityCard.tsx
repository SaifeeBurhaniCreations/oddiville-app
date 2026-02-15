// Imports
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getColor } from "@/src/constants/colors";
import { ButtonActionType, SearchActivityCardProps } from "@/src/types";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import * as SecureStore from "expo-secure-store"

// UI Components
import CalendarIcon from "../icons/page/Calendar12Icon";
import Tag from "./Tag";
import CtaButton from "./Buttons/CtaButton";
import TimeAgo from "./TimeAgo";
import { B4, B5, C1, H2 } from "../typography/Typography";
import { buttonActionMap } from "@/src/utils/buttonUtils";
import { useMarkNotificationRead } from "@/src/hooks/useNotifications";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/redux/store";
import { updateBottomSheetMeta } from "@/src/redux/slices/bottomsheet.slice";

const SearchActivityCard = ({ activity, color, bgSvg: BgSvg, style, onPress }: SearchActivityCardProps) => {
    const [username, setUsername] = useState<string | null>(null);
    const { goTo } = useAppNavigation();
    const meta = useSelector((state: RootState) => state.bottomSheet.meta);

    const dispatch = useDispatch<AppDispatch>();
    const tagColor = color === "yellow" ? "green" : "yellow";
    const typeColor = color === "red" ? "green" : "red";
const {
  type,
  createdAt,
  id,
  itemId,
  params,
  dateDescription,
  title,
  badgeText,
  extra_details,
  buttons,
  read,
  extraData,
  action,
} = activity;
    
    useEffect(() => {
        const getUserFromStorage = async () => {
            try {
                const stringifiedUser = await SecureStore.getItemAsync("newsync");

                if (!stringifiedUser) return;

                const user = JSON.parse(stringifiedUser);
                if (user?.username) {

                    setUsername(user.username);
                }
            } catch (error) {
                console.error("Failed to load user from storage:", error);
            }
        };

        getUserFromStorage();
    }, []);

    const markRead = useMarkNotificationRead();

  const handleCardPress = () => {
  if (!action) return;

  switch (action.type) {
    case "navigate":
      goTo(action.screen, params);
      break;

    case "bottomSheet":
      onPress?.(itemId, action.key);

      if (meta?.type === action.key) {
        dispatch(updateBottomSheetMeta({ ...meta, data: extraData }));
      }
      break;

    case "none":
    default:
      return;
  }

  // mark read (kept global — works for search too)
  if (id) {
    markRead.mutate({
      id,
      read: true,
      updateQueryKeys: [
        ["notifications", "informative"],
        ["notifications", "actionable"],
        ["notifications", "today"],
      ],
    });
  }
};


    return (
      <Pressable style={[styles.container, style]} onPress={handleCardPress}>
        <BgSvg style={styles.cardBackgroundImage} />
        <View style={styles.card}>
          <View style={styles.cardHeaderContent}>
            <View style={styles.cardHeader}>
              {type && (
                <B5
                  color={getColor(typeColor, 700)}
                  style={{ textTransform: "uppercase" }}
                >
                  {type}
                </B5>
              )}
              {createdAt && (
                <View style={styles.cardHeaderTime}>
                  <CalendarIcon color={getColor(color, 700)} />
                  {dateDescription && <B4>{dateDescription}</B4>}
                  <TimeAgo createdAt={createdAt} color={getColor(color, 700)} />
                </View>
              )}
            </View>

            <View style={styles.cardHeaderLayout}>
              <View style={styles.cardHeaderMain}>
                <H2 color={getColor(color, 700)}>{title}</H2>
                {!read ? (
                  <Tag color={tagColor} size="sm">
                    New
                  </Tag>
                ) : (
                  badgeText && (
                    <Tag color={tagColor} size="sm">
                      {badgeText}
                    </Tag>
                  )
                )}
              </View>
            </View>

            {extra_details?.length > 0 && (
              <View style={styles.cardHeaderDetails}>
                <C1 color={getColor(color, 400)}>
                  {extra_details.join(" | ")}
                </C1>
              </View>
            )}
          </View>

          {buttons && buttons?.length > 0 && (
            <View style={styles.actionButtonsContainer}>
              {buttons.map((btn, index) => (
                <CtaButton
                  key={index}
                  color={color}
                  onPress={() => {
                    const action = buttonActionMap[btn.key as ButtonActionType];
                    if (action) {
                      action({ goTo, dispatch, meta });
                    } else {
                      console.warn("No action handler found for:", btn.key);
                    }
                  }}
                  disabled={false}
                >
                  {btn.text}
                </CtaButton>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
};

export default SearchActivityCard;

const styles = StyleSheet.create({
    container: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: getColor("light", 500),
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        marginBottom: 8
    },
    card: {
        padding: 12,
        gap: 16,
        flexDirection: "column",
    },
    cardHeaderContent: {
        flexDirection: "column",
        gap: 4,
    },
    cardHeaderLayout: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardHeaderTime: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardHeaderMain: {
        flexDirection: "row",
        gap: 6,
    },
    cardHeaderDetails: {
        flexDirection: "row",
        gap: 6,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    cardBackgroundImage: {
        position: "absolute",
        bottom: 0,
        right: 12,
        width: 120,
        height: 120,
        opacity: 0.3,
        zIndex: -1,
        resizeMode: "contain",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    twoColumnRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    separator: {
        width: 1,
        backgroundColor: getColor("green", 100),
        alignSelf: "stretch",
        marginHorizontal: 4,
    },
    border: {
        borderTopWidth: 1,
        borderColor: getColor("green", 100),
        paddingTop: 8,
    },
    dispatchSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 8,
        gap: 4,
    },
    helperItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dispatchDateDifferencer: {
        padding: 4,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: getColor("green", 100, 0.4),
        borderColor: getColor("green", 300, 0.6),
        width: 74,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    dispatchIcon: {
        padding: 4,
        borderRadius: 9999,
        flexDirection: "row",
        height: 25,
        width: 25,
    },
    dispatchIconActive: {
        backgroundColor: getColor('green', 700),
    },
    dispatchIconInActive: {
        backgroundColor: getColor('light'),
        borderWidth: 1,
        borderColor: getColor('green', 100)
    },
    dispatchDateLayout: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    dispatchDateHyphen: {
        height: 1,
        width: 18,
        borderTopWidth: 1.5,
        borderColor: getColor("green", 100),
    },
});