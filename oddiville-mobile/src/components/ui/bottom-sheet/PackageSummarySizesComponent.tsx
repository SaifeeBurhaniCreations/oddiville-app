import { StyleSheet, View } from "react-native";
import React from "react";
import { PackageSummarySizeProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { B3, B4, H5 } from "@/src/components/typography/Typography";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import StarIcon from "@/src/components/icons/page/StarIcon";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";

// const PackageSummarySizesComponent = ({ data }: PackageSummarySizeProps) => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <B3 color={getColor("yellow", 700)} style={styles.headerText}>
//           {data.title}
//         </B3>
//       </View>

//       {data.sizes.map((packet, index) => {
//         const details = [
//           { label: "Size", value: packet.size, icon: BoxIcon },
//           // { label: "Bags", value: packet.bags, icon: BigBagIcon },
//           { label: "Packets", value: packet.packets, icon: PaperRollIcon },
//           { label: "Rating", value: packet.rating, icon: StarIcon },
//         ];

//         const hasLongValue = details.some((d) => String(d.value).length > 30);

//         return (
//           <View style={styles.card} key={index}>
//             <View style={styles.grid}>
//               {details.map((item, i) => {
//                 const isLong = String(item.value).length > 30;
// const Icon = item.icon;
//                 return (
//                   <View
//                     key={i}
//                     style={[
//                       styles.detailItem,
//                       hasLongValue && isLong && styles.fullWidth,
//                     ]}
//                   >
//                     <Icon color={getColor("green", 700)} size={18}/>

//                     <View style={styles.kvRow}>
//                       <H5>{item.label}:</H5>
//                       <B4
//                         style={[styles.valueText, isLong && styles.longValue]}
//                       >
//                         {item.value}
//                       </B4>
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           </View>
//         );
//       })}
//     </View>
//   );
// };

const PackageSummarySizesComponent = ({ data }: PackageSummarySizeProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View>
        <B3 color={getColor("yellow", 700)} style={styles.headerText}>
          {data.title}
        </B3>

        <View style={styles.ratingRow}>
          <StarIcon color={getColor("green", 700)} size={16} />
          <B4>Rating: {data.rating}</B4>
        </View>
      </View>

      {data.sizes.map((packet) => {
        const details = [
          { label: "Size", value: packet.size, icon: BoxIcon },
          { label: "Packets", value: packet.packets, icon: PaperRollIcon },
        ];

        return (
          <View style={styles.card} key={packet.id}>
            <View style={styles.grid}>
              {details.map((item, i) => {
                const Icon = item.icon;
                return (
                  <View key={i} style={styles.detailItem}>
                    <Icon color={getColor("green", 700)} size={18} />
                    <View style={styles.kvRow}>
                      <H5>{item.label}:</H5>
                      <B4>{item.value}</B4>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },

  headerText: {
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: getColor("light"),
    borderWidth: 1,
    borderColor: getColor("green", 100),
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  longValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  longValueText: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  valueWrap: {
    flexWrap: "wrap",
    flexShrink: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  kvRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    flexShrink: 1,
  },

  valueText: {
    flexShrink: 1,
    flexWrap: "wrap",
  },

  longValue: {
    maxWidth: "85%",
  },

  detailItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  fullWidth: {
    width: "100%",
  },

  ratingRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
},

});

export default PackageSummarySizesComponent;
