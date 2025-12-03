import { closeMenu, openMenu } from "@/src/redux/slices/menusheet.slice";
import { ToggleMenuProps } from "../types";

export const toggleMenu = ({ isOpen, dispatch }: ToggleMenuProps) => {
    dispatch(isOpen ? closeMenu() : openMenu());
};