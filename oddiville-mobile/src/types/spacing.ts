
export type GapWrapperProps = {
    children: React.ReactNode;
    gap?: string;  // Example: "4", "md:6 lg:10"
    direction?: "row" | "column"; // Default: row
    className?: string;
  };
  export type MarginWrapperProps = {
    children: React.ReactNode;
    m?: string;  // Example: "4", "md:6 lg:8"
    mx?: string;
    my?: string;
    mt?: string;
    mb?: string;
    ml?: string;
    mr?: string;
    className?: string;
  };
  
  export type PaddingWrapperProps = {
    children: React.ReactNode;
    p?: string;  // Example: "4", "md:8 lg:12"
    px?: string; // Horizontal padding
    py?: string; // Vertical padding
    pt?: string;
    pb?: string;
    pl?: string;
    pr?: string;
    className?: string;
  };
  
  export type SpacerProps = {
    size?: string; // Example: "lg", "md:8 lg:12", "16"
    direction?: "vertical" | "horizontal"; // Default: vertical
    className?: string;
  };