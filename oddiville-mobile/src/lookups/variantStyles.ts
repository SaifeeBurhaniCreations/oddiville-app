import { StyleSheet } from "react-native";
import { getColor } from "../constants/colors";

export type Variant =
    | "outline"
    | "ghost"
    | "fill";

export interface VariantStyleArgs {
    baseStyles: any;
    style: any;
    color: "red" | "green" | "blue" | "yellow" | "light";
    isPressed: boolean;
    full: boolean;
    half: boolean;
    disabled: boolean;
}

type VariantStyleHandler = (args: VariantStyleArgs) => {
    container: any[];
    textColor: string;
};

export const variantStylesMap: Record<Variant, VariantStyleHandler> = {
    outline: ({ baseStyles, style }) => ({
        container: [
            styles.btnOutline,
            { borderColor: getColor("green", 500), backgroundColor: getColor("light") },
            baseStyles,
            style,
        ],
        textColor: getColor("green", 500),
    }),
    ghost: ({ baseStyles, style, color, isPressed }) => ({
        container: [
            styles.btnGhost,
            {
                backgroundColor: isPressed ? getColor(color, 100) : "transparent",
            },
            baseStyles,
            style,
        ],
        textColor: getColor("green", 500),
    }),
    fill: ({ baseStyles, style, color, disabled }) => ({
        container: [
            styles.btnFill,
            { backgroundColor: disabled ? getColor(color, 100) : getColor(color, 500) },
            baseStyles,
            style,
        ],
        textColor: color === "light" ? getColor("green", 500) : getColor("light", 200),
    }),
};


const styles = StyleSheet.create({
    btnOutline: {
        borderWidth: 1,
        borderRadius: 8,
    },
    btnFill: {
        borderRadius: 8,
    },
    btnGhost: {
        borderRadius: 8,
    },
    lightButtonShadow: {
        shadowColor: "rgba(7, 3, 25, 0.08)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 11,
        elevation: 8,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
