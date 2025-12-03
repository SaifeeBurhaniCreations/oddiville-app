import { typographyEnum } from "../types/typography";

export const BASE_FONT_SIZE: Record<typographyEnum, { size: number; line_height: number; font_family?: string }> = {
    [typographyEnum.H1]: { size: 24, line_height: 32, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.H2]: { size: 20, line_height: 28, font_family: "FunnelSans-Bold" },
    [typographyEnum.H3]: { size: 18, line_height: 24, font_family: "FunnelSans-Bold" },
    [typographyEnum.H4]: { size: 18, line_height: 24, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.H5]: { size: 16, line_height: 24, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.H6]: { size: 14, line_height: 20, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.B1]: { size: 16, line_height: 24, font_family: "FunnelSans-Bold" },
    [typographyEnum.B2]: { size: 16, line_height: 24, font_family: "FunnelSans-Regular" },
    [typographyEnum.B3]: { size: 14, line_height: 20, font_family: "FunnelSans-Bold" },
    [typographyEnum.B4]: { size: 14, line_height: 20, font_family: "FunnelSans-Regular" },
    [typographyEnum.B5]: { size: 12, line_height: 16, font_family: "FunnelSans-Bold" },
    [typographyEnum.B6]: { size: 12, line_height: 16, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.C1]: { size: 12, line_height: 16, font_family: "FunnelSans-Regular" },
    [typographyEnum.BoldHeading]: { size: 32, line_height: 40, font_family: "FunnelSans-Bold" },
    [typographyEnum.BoldHeadingV2]: { size: 32, line_height: 36, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.SubHeading]: { size: 20, line_height: 26, font_family: "FunnelSans-Regular" },
    [typographyEnum.SubHeadingV2]: { size: 22, line_height: 28, font_family: "FunnelSans-SemiBold" },
    [typographyEnum.SubHeadingV3]: { size: 12, line_height: 12, font_family: "FunnelSans-Regular" },
};
