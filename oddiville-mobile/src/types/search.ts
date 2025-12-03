import { ReactNode, SetStateAction, Dispatch } from "react";
import { ReturnKeyTypeOptions } from "react-native";

export interface SearchInputProps {
  style?: any;
  onChangeText?: any;
  value?: string;
  onSubmitEditing?: any;
  returnKeyType: ReturnKeyTypeOptions
  border?: boolean;
  placeholder?: string;
  cross?: boolean;
  w?: number;
  defaultValue?: string;
  variant?: "bordered" | "default";
  onClear?: () => void;
}


export interface RecentSearchItemProps {
  children: ReactNode;
  color: "red" | "green" | "blue" | "yellow";
  setRecentSearchTerm?: Dispatch<SetStateAction<string[]>>;
  recentSearchTerm: string[];
  index: number;
}