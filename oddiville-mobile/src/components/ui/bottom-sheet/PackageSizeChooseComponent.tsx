import { StyleSheet, View, Pressable } from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColor } from '@/src/constants/colors';
import { getIcon } from '@/src/utils/iconUtils';
import { SubHeading } from '../../typography/Typography';
import Checkbox from '../Checkbox';
import { RootState } from '@/src/redux/store';
import { packageSize, togglePackageSize } from '@/src/redux/slices/bottomsheet/package-size.slice';
import { PackageSizeChooseComponentProps } from '@/src/types';

function parsePackageString(pkgStr: string): { size: number; unit: "gm" | "kg" } | null {
    if (!pkgStr) return null;
    const parts = pkgStr.trim().split(/\s+/);
    if (parts?.length !== 2) return null;
    const size = parseFloat(parts[0]);
    const unit = parts[1].toLowerCase();
    if (isNaN(size) || !unit) return null;
    return { size, unit };
}

const PackageSizeChooseComponent = ({ data }: PackageSizeChooseComponentProps) => {
    const selected = useSelector((state: RootState) => state.packageSize.selectedSizes);
    const dispatch = useDispatch();

    return (
        <View style={styles.container}>
            {data
                ?.map((item, index) => {
                    const parsed = parsePackageString(item?.name);
                    if (!parsed) {
                        console.log(`[PackageSizeChooseComponent] Invalid package string: "${item?.name}"`);
                        return null;
                    }
                    const packageData: packageSize = {
                        ...item,
                        size: parsed.size,
                        unit: parsed.unit,
                    };
                    const isSelected = selected.some((s) => s.name === packageData.name);

                    return (
                        <Pressable
                            key={item.name}
                            onPress={() => dispatch(togglePackageSize(packageData))}
                            style={[styles.row, index < data?.length - 1 && styles.separator]}
                        >
                            <Checkbox checked={isSelected} />
                            <View style={styles.icon}>{getIcon(item.icon)}</View>
                            <SubHeading>
                                {item.name}
                            </SubHeading>
                        </Pressable>
                    );
                })
                .filter(Boolean)}
        </View>
    );
};

export default PackageSizeChooseComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Instead of unsupported `gap`
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor('green', 100),
        width: '100%',
        paddingBottom: 12,
    },
    icon: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: getColor('green', 500, 0.1),
    },
});
