import { getColor } from '@/src/constants/colors';
import { DescriptionComponentProps } from '@/src/types';
import { StyleSheet, View } from 'react-native';
import { B3, B4 } from '../../typography/Typography';

const DescriptionComponent = ({ data }: DescriptionComponentProps) => {
    return (
        <View style={[styles.column, styles.detailsBorder]}>
               <B3 color={getColor("yellow", 700)} style={{ textTransform: "uppercase" }}>
                        {data.title}
                    </B3>
                <B4>{data.description}</B4>
        </View>
    );
};


export default DescriptionComponent;

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 8,
    },
    detailsBorder: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 16,
    },
});
