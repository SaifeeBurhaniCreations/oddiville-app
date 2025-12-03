import { ReactNode } from "react";
import { ViewProps } from "react-native";

export interface GridProps {
    columns?: number;
    children: ReactNode;
    gap?: string;
    className?: string;
}

export interface CenterProps {
    children: ReactNode;
    className?: string;
    fullScreen?: boolean;
}

export interface HStackProps extends ViewProps {
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    gap?: number;
    w?: number | `${number}%` | "auto";
    maxW?: number | `${number}%` | "auto";
    children: ReactNode;
}

export interface VStackProps extends ViewProps {
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    gap?: number;
    w?: number | `${number}%` | "auto";
    maxW?: number | `${number}%` | "auto";
    children: ReactNode;
}

export type StackWrapperProps = {
    children: React.ReactNode;
    direction?: "row" | "column"; // Default: row
    gap?: string;
    className?: string;
};

export type SectionProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
};

export type BoxProps = {
    children: React.ReactNode;
    bg?: string;
    border?: string;
    shadow?: string;
    rounded?: string;
    className?: string;
    style?: object;
    p?: string;
    m?: string;
};
