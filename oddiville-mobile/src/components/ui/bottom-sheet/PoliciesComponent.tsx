import { PoliciesCardProps } from "@/src/types";
import { Pressable, StyleSheet, View } from "react-native";
import { C1, H4 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import CustomImage from "@/src/components/ui/CustomImage";
import Checkbox from "@/src/components/ui/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import defaultPoliciesImage from "@/src/assets/images/default-image-policies.png";
import { RootState } from "@/src/redux/store";
import { togglePolicy } from "@/src/redux/slices/bottomsheet/policies.slice";

const PoliciesCardComponent: React.FC<PoliciesCardProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { selectedPolicies } = useSelector(
    (state: RootState) => state.policies,
  );

  return (
    <View style={styles.listContainer}>
      {data?.map((item, index) => {
        return (
          <Pressable
            style={styles.card}
            key={index}
            onPress={() => dispatch(togglePolicy(item))}
          >
            <View style={styles.titleWithImageSection}>
              <CustomImage
                src={defaultPoliciesImage}
                width={32}
                height={32}
                resizeMode="contain"
              />
              <View>
                <H4>{item.name}</H4>
                <C1 color={getColor("green", 400)}>{item.description}</C1>
              </View>
            </View>

            <Checkbox
              checked={selectedPolicies.includes(item)}
              onChange={() => dispatch(togglePolicy(item))}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default PoliciesCardComponent;

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: getColor("light"),
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  productImage: {
    backgroundColor: getColor("green", 300),
    borderRadius: 8,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  titleWithImageSection: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});
