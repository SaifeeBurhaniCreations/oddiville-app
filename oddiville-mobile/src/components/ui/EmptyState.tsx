import { VStack } from "@/src/components/layout/VStack"
import CustomImage from "./CustomImage";
import { EmptyStateProps, RootStackParamList } from "@/src/types";
import { B4, H5 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import { StyleSheet, View } from "react-native";

import Button from "./Buttons/Button";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import * as SecureStorage from "expo-secure-store"

const noSearchResultImg = require("@/src/assets/images/illustrations/no-result.png");
    
    const EmptyState = ({ stateData, color = "green", compact=false, image = noSearchResultImg, style, button = {
    text: "",
    href: "login",
}, ...props }: EmptyStateProps) => {
    const { goTo } = useAppNavigation();

    const { title, description } = stateData

    const handlePress = async (href: keyof RootStackParamList) => {
        goTo(href);
        await SecureStorage.deleteItemAsync("metadata");;

    }
    return (
        <View style={[styles.emptyStateWrapper, style, {minHeight: compact ? 60 : 240,}]} {...props}>
            <CustomImage src={image} width={80} height={80} />
            <VStack gap={16}>
                <VStack gap={8}>
                <H5 color={getColor(color, 700)}>{title}</H5>
                <B4 color={getColor(color, 700)} style={styles.textCenter}>{description}</B4>
            </VStack>
                {button?.text?.length > 0 && (
                    <Button variant="fill" onPress={() => handlePress(button?.href)}>{button.text}</Button>
                )}
            </VStack>
            
        </View>
    )
}

export default EmptyState

const styles = StyleSheet.create({
    emptyStateWrapper: {
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 270,  
        height: "100%"
    },
    textCenter: {
        textAlign: "center",
    },
})