import { Text, View } from "react-native";
import { SectionProps } from "@/src/types";

const Section = ({ title, description, children, className = "" }: SectionProps) => {
    return (
        <View className={`mb-8 ${className}`}>
            <Text className="text-2xl font-bold">{title}</Text>
            {description && <Text className="text-gray-600">{description}</Text>}
            <View className="mt-4">{children}</View>
        </View>
    );
};

export default Section;


//   usage
{/* <Section title="Employee Management" description="Manage all employees from here">
  <AutoGrid columns={3}>
    <Card title="Employee 1">Details...</Card>
    <Card title="Employee 2">Details...</Card>
    <Card title="Employee 3">Details...</Card>
  </AutoGrid>
</Section> */}
