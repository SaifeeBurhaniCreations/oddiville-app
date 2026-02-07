import { SectionList } from "react-native";
import { ItemCardData } from "@/src/types";
import ItemCard from "./ItemCard";
import { B3 } from "../typography/Typography";
import { getColor } from "@/src/constants/colors";
import { View } from "react-native";
import { RefreshControl } from "react-native";

interface ItemCardSection {
    title: string;
    data: ItemCardData[];
}

type ItemCardSectionListProps = {
    sections: ItemCardSection[];
    refreshing: boolean;
    onRefresh: () => void;
};

const ItemCardSectionList = ({
    sections,
    refreshing,
    onRefresh,
}: ItemCardSectionListProps) => {
    
    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderSectionHeader={({ section }) => (
                <B3
                    color={getColor("yellow", 700)}
                    style={{ textTransform: "uppercase", paddingVertical: 8 }}
                >
                    {section.title}
                </B3>
            )}
            renderItem={({ item }) => <ItemCard {...item} />}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        />
    );
};

export default ItemCardSectionList;