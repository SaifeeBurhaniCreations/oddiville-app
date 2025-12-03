import { ComponentType } from "react";
import { IconProps } from "./icon";
import { RootStackParamList } from "./navigation";

export interface menuItemsProps {
    name: string;
    icon: ComponentType<IconProps>;
    href: keyof RootStackParamList;
}

export interface MenuCardProps { 
    item: menuItemsProps; 
    onPress: () => void; 
    style?: any; }