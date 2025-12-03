import React from "react";
import { View } from "react-native";
import MenuSheet from "./components/ui/MenuSheet";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
            <MenuSheet />
        </View>
    );
};

export default AppLayout;
