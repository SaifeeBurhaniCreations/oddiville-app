import { TitleCheckCountProps } from '@/src/types'
import { StyleSheet, View } from 'react-native'
import Checkbox from '../../Checkbox'
import { B2, B4 } from '@/src/components/typography/Typography'
import { getColor } from '@/src/constants/colors'

const TitleCheckCountComponent: React.FC<TitleCheckCountProps> = ({ data, color }) => {

    const { title, count, isChecked } = data
    return (
        <View style={styles.wrapper}>
        <View style={styles.checkTitleWrapper}>
            <Checkbox checked={isChecked} shouldBePending={() => true} />
            <B2>{title}</B2>
        </View>
            <B4 color={getColor("green", 400)}>Selected: {count}</B4>
        </View>
    )
}

export default TitleCheckCountComponent

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    checkTitleWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
})