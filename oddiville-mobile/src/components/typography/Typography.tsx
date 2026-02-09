import { BASE_FONT_SIZE } from "@/src/constants/BaseFontSize";
import { getColor } from "@/src/constants/colors";
import { typographyEnum } from "@/src/types/typography";
import { Text, TextProps } from "react-native";

function createTypographyComponent(variant: typographyEnum) {
  return function TypographyComponent({
    children,
    style,
    color = getColor("green", 700),
    ...props
  }: React.PropsWithChildren<TextProps & { color?: string }>) {
    const { size, line_height, font_family } = BASE_FONT_SIZE[variant];

    return (
      <Text
        {...props}
        style={[
          {
            fontSize: size,
            lineHeight: line_height,
            fontFamily: font_family,
            color,
          },
          style,
        ]}
      >
        {children}
      </Text>
    );
  };
}

export const H1 = createTypographyComponent(typographyEnum.H1);
export const H2 = createTypographyComponent(typographyEnum.H2);
export const H3 = createTypographyComponent(typographyEnum.H3);
export const H4 = createTypographyComponent(typographyEnum.H4);
export const H5 = createTypographyComponent(typographyEnum.H5);
export const H6 = createTypographyComponent(typographyEnum.H6);

export const B1 = createTypographyComponent(typographyEnum.B1);
export const B2 = createTypographyComponent(typographyEnum.B2);
export const B3 = createTypographyComponent(typographyEnum.B3);
export const B4 = createTypographyComponent(typographyEnum.B4);
export const B5 = createTypographyComponent(typographyEnum.B5);
export const B6 = createTypographyComponent(typographyEnum.B6);

export const C1 = createTypographyComponent(typographyEnum.C1);

export const BoldHeading = createTypographyComponent(typographyEnum.BoldHeading);
export const BoldHeadingV2 = createTypographyComponent(typographyEnum.BoldHeadingV2);
export const SubHeading = createTypographyComponent(typographyEnum.SubHeading);
export const SubHeadingV2 = createTypographyComponent(typographyEnum.SubHeadingV2);
export const SubHeadingV3 = createTypographyComponent(typographyEnum.SubHeadingV3);