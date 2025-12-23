import { ActionButtonConfig } from "./cards";

export type AdminNotification = {
    id: string,
    itemId: string,
    identifier: string,
    type: string,
    title: string,
    badgeText: string,
    createdAt: string,
    description: string[],
    category: "informative" | "actionable" | "today",
    read: boolean,
    color: "red" | "yellow" | "green" | null,
    extraData: any | undefined,
    buttons?: ActionButtonConfig[],
}