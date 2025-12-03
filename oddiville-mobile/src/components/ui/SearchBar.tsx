import React, { useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import CustomImage from "./CustomImage";
import { getColor } from "@/src/constants/colors";
import { H2 } from "../typography/Typography";
import SearchInput from "./SearchInput";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const SearchBar = () => {
    const { goTo } = useAppNavigation();

    const [searchText, setSearchText] = useState("");

    const handleSubmit = () => {
        goTo("search-results", { query: searchText });
    };

    const inputStyle = useMemoizedStyle(
        {
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: [{ translateX: -(screenWidth * 0.8) / 2 }],
            zIndex: 1,
        },
        [screenWidth]
    );

    const headingStyle = useMemoizedStyle(
        {
            position: "absolute",
            top: 10,
            left: 10,
            width: "60%",
            color: getColor("green", 700),
            textAlign: "left",
        },
        []
    );

    return (
        <View style={styles.searchBg}>
            <H2 style={headingStyle} numberOfLines={2} adjustsFontSizeToFit>
                Search anything what do you want
            </H2>

            <SearchInput
                style={inputStyle}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                placeholder={"Search"}
                w={0.8}
            />

            <CustomImage
                src={require("@/src/assets/images/illustrations/home-banner.png")}
                width={"100%"}
                style={styles.image}
            />
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    searchBg: {
        backgroundColor: getColor("yellow", 100),
        height: screenHeight * 0.17,
        borderRadius: 16,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "flex-end",
        position: "relative",
        marginBottom: 16,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
});
