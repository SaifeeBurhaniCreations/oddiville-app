import React from "react";
import { Pressable, StyleSheet, View, Linking } from "react-native";
import { getColor } from "@/src/constants/colors";
import { SupervisorOrderCardProps } from "@/src/types";
import CustomImage from "../CustomImage";
import { getImageSource } from "@/src/utils/arrayUtils";
import Tag from "../Tag";
import StarIcon from "../../icons/page/StarIcon";
import {
  B4,
  B5,
  B6,
  C1,
  H3,
  H6,
  SubHeadingV3,
} from "../../typography/Typography";
import { chunkBySize } from "@/src/sbc/utils/chunkBy/chunkBy";
import { useOrders } from "@/src/hooks/dispatchOrder";
import { ICON_MAP } from "@/src/lookups/icons";

const KeyValueRow = ({
  iconKey,
  name,
  value,
}: {
  iconKey?: keyof typeof ICON_MAP;
  name: string;
  value: string | number;
}) => {
  const Icon = iconKey ? ICON_MAP[iconKey] : null;

  return (
    <View style={styles.rowItem}>
      {Icon && <Icon />}
      <View style={styles.keyValue}>
        <B6 color={getColor("green", 700)}>{name}:</B6>
        <C1 color={getColor("green", 700)}>{value}</C1>
      </View>
    </View>
  );
};

const SupervisorOrderDetailsCard = ({
  order,
  style,
  ...props
}: SupervisorOrderCardProps) => {
  const { data } = useOrders();
  const filteredData = data?.filter(
    (item) => item.customer_name === order.title
  );
  const pohneNumber = filteredData?.[0]?.phone;

  const call = () => {
    Linking.openURL(`tel:${pohneNumber}`);
  };

  return (
    <View style={[styles.wrapper, style]} {...props}>
      <View style={styles.card}>
        <View style={styles.topSection}>
          <View style={styles.titleRow}>
            {order.isImage && (
              <View style={styles.imageWrapper}>
                <CustomImage
                  src={getImageSource({ image: order.title }).image}
                  width={32}
                  height={32}
                  resizeMode="contain"
                />
              </View>
            )}
            <View style={styles.titleColumn}>
              {order.title && <H3>{order.title}</H3>}

              {Array.isArray(order.description) &&
                order.description?.length > 0 &&
                order?.description?.map((desc, idx) => (
                  <KeyValueRow
                    key={idx}
                    iconKey={desc.iconKey}
                    name={desc.name}
                    value={desc.value}
                  />
                ))}

              {order?.sideIconKey && (
                <Pressable style={[styles.sideIcon]} onPress={call}>
                  {order?.sideIconKey && (
                    (() => {
                      const Icon = ICON_MAP[order.sideIconKey];
                      return <Icon />;
                    })()
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {order.rating && (
            <Tag color="blue" icon={<StarIcon size={12} />}>
              {order.rating}
            </Tag>
          )}
        </View>

        {Array.isArray(order.details) &&
          order.details?.length > 0 &&
          order.details.map((detail, idx) => (
            <KeyValueRow
              key={idx}
              iconKey={detail.iconKey}
              name={detail.name!}
              value={detail.value}
            />
          ))}

        {(order.name || order.address) && (
          <View>
            {order.name && <H6>{order.name}</H6>}
            {order.address && (
              <C1 color={getColor("green", 400)}>
                {order.address} Bijju bhaiya
              </C1>
            )}
          </View>
        )}

        {order.sepratorDetails && order.sepratorDetails.length > 0 && (
          <View style={styles.sepratorRow}>
            {chunkBySize(order.sepratorDetails, 2).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                {row.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <KeyValueRow
                      iconKey={item.iconKey}
                      name={item.name}
                      value={item.value}
                    />
                    {itemIndex === 0 && row.length > 1 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>

      {order.helperDetails && order.helperDetails?.length > 0 && (
        <View style={styles.helperSection}>
          {order.helperDetails.map((h, idx) => (
            <React.Fragment key={idx}>
              <View style={styles.helperItem}>
                {(() => {
                  const Icon = h.iconKey ? ICON_MAP[h.iconKey] : null;

                  return Icon && <Icon />;
                })()}
                <View style={styles.keyValue}>
                  <H6 style={{ flexWrap: "wrap" }} color={getColor("light")}>
                    {h.name}:
                  </H6>
                  <B4 style={{ flexWrap: "wrap" }} color={getColor("light")}>
                    {h.value}
                  </B4>
                </View>
              </View>
              {order.helperDetails && idx < order.helperDetails?.length - 1 && (
                <View style={styles.helperDivider} />
              )}
            </React.Fragment>
          ))}
        </View>
      )}
      {order.dispatchDetails && order.dispatchDetails?.length > 0 && (
        <View style={styles.dispatchSection}>
          {order.dispatchDetails.map((h, idx) => (
            <React.Fragment key={idx}>
              <View style={styles.helperItem}>
                {idx % 2 === 0 ? (
                  <React.Fragment>
                    <View style={[styles.dispatchIcon]}> {(() => {
                      const Icon = h.iconKey ? ICON_MAP[h.iconKey] : null;
                      return Icon && <Icon />;
                    })()}</View>
                    <B5 style={{ flexWrap: "wrap" }} color={getColor("light")}>
                      {h.value}
                    </B5>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <B5 style={{ flexWrap: "wrap" }} color={getColor("light")}>
                      {h.value}
                    </B5>
                      <View style={[styles.dispatchIcon]}> {(() => {
                        const Icon = h.iconKey ? ICON_MAP[h.iconKey] : null;
                        return Icon && <Icon />;
                      })()}</View>
                  </React.Fragment>
                )}
              </View>
              {order.dispatchDetails &&
                idx < order.dispatchDetails?.length - 1 && (
                  <View style={[styles.dispatchDateLayout]}>
                    <View style={[styles.dispatchDateHyphen]} />
                    <View style={[styles.dispatchDateDifferencer]}>
                      <SubHeadingV3 color={getColor("light", 100)}>
                        {order.dateDifference}
                      </SubHeadingV3>
                    </View>
                    <View style={[styles.dispatchDateHyphen]} />
                  </View>
                )}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

export default SupervisorOrderDetailsCard;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: getColor("green"),
    borderRadius: 16,
    elevation: 2,
  },
  card: {
    backgroundColor: getColor("light"),
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    gap: 8,
  },
  titleColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
    alignItems: "center",
  },
  sepratorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopColor: getColor("green", 100),
    borderTopWidth: 1,
    flexWrap: "wrap",
    gap: 12,
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
    backgroundColor: getColor("green", 100),
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  keyValue: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  imageWrapper: {
    backgroundColor: getColor("green", 300),
    padding: 4,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  helperSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 12,
  },
  dispatchSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  helperItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  helperDivider: {
    width: 1,
    height: 16,
    backgroundColor: getColor("light", 300),
  },
  sideIcon: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: getColor("green", 100),
  },
  dispatchDateDifferencer: {
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: getColor("light", 100, 0.2),
    borderColor: getColor("green", 300),
    alignItems: "center",
    width: 58,
  },
  dispatchIcon: {
    padding: 4,
    borderRadius: "50%",
    backgroundColor: getColor("light", 100),
    flexDirection: "row",
    height: 25,
    width: 25,
  },
  dispatchDateLayout: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dispatchDateHyphen: {
    height: 1,
    width: 24,
    borderTopWidth: 1.5,
    borderColor: getColor("green", 100),
  },
});
