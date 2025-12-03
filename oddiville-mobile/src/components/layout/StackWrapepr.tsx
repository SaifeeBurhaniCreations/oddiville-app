import { StackWrapperProps } from "@/src/types";

  
  const StackWrapper = ({ children, direction = "row", gap = "4", className = "" }: StackWrapperProps) => {
    return (
      <div className={`flex ${direction === "column" ? "flex-col" : ""} gap-${gap} ${className}`}>
        {children}
      </div>
    );
  };
  
  export default StackWrapper;
  
//   usage

// <StackWrapper direction="row" gap="6" className="items-center">
//   <Text>Name</Text>
//   <Button>Edit</Button>
// </StackWrapper>
