export const colors = {
  red: {
    100: "#FDDCD8",
    500: "#F55747",
    700: "#CB1D0B",
  },
  blue: {
    100: "#D8EFFD",
    500: "#45B3F7",
    700: "#0982CE",
  },
  green: {
    100: "#CCD6D1",
    200: "#84A49D",
    300: "#9BC698",
    400: "#548076",
    500: "#3D874C",
    700: "#0A493B",
  },
  yellow: {
    100: "#FFEFD6",
    500: "#FF9D00",
    700: "#CC7E00",
  },
  light: {
    200: "#FCF9F7",
    500: "#FFFFFF",
  },
  other: {
    500: "#F6EADA",
  },
  dark: {
    500: "#D1D5DB",
  },
  gradients: {
    primary: ["#3182ce", "#2c5282"],
    secondary: ["#D1D5DB", "#4B5563"],
  },
  transparency: {
    overlay: "rgba(0,0,0,0.5)",
  },
} as const;
// Type definitions
type ColorType = keyof typeof colors;
type VariantType<T extends ColorType> = keyof (typeof colors)[T] & string;
type ShadeType<T extends ColorType, V extends VariantType<T>> = keyof (typeof colors)[T][V];

// Fallback color
const FALLBACK_COLOR = "#808080"; 

const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = args.join("-");
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

export const getColor = memoize((type: ColorType, shade?: number, opacity?: number | string): string => {
  const colorSet = colors[type];

  if (!colorSet || typeof colorSet !== "object") {
    console.warn(`Color type "${type}" not found, using fallback`);
    return FALLBACK_COLOR;
  }

  const isShadedColor = (obj: any): obj is Record<number, string> =>
    typeof obj === "object" && Object.keys(obj).every((key) => !isNaN(Number(key)));

  if (isShadedColor(colorSet)) {
    let shadeValue: string | undefined = undefined;
  
    if (typeof shade === "number" && shade in colorSet) {
      shadeValue = (colorSet as Record<number, string>)[shade];
    }
    if (!shadeValue && '500' in colorSet) {
      shadeValue = (colorSet as any)[500];
    }
    if (!shadeValue) {
      shadeValue = FALLBACK_COLOR;
    }
  
    if (opacity !== undefined) {
      const opacityValue = typeof opacity === "string" ? parseFloat(opacity) / 100 : opacity;
      return convertToRGBA(shadeValue, opacityValue);
    }
    return shadeValue;
  }

  console.warn(`Invalid shade "${shade}" for "${type}", using fallback`);
  return FALLBACK_COLOR;
});

const convertToRGBA = (hex: string, opacity: number = 1): string => {
  const hexCode = hex.replace("#", "");

  const r = parseInt(hexCode.substring(0, 2), 16);
  const g = parseInt(hexCode.substring(2, 4), 16);
  const b = parseInt(hexCode.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};



export const useTheme = (isDarkMode: boolean): { text: string; bg: string; border: string } => ({
  text: isDarkMode ? colors.dark[500] : colors.light[500],
  bg: isDarkMode ? colors.dark[500] : colors.light[500],
  border: isDarkMode ? colors.dark[500] : colors.light[500],
});
