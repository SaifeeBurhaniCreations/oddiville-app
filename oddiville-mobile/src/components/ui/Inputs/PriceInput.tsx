import { StyleSheet, TextInput, View } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { PriceInputProps } from '@/src/types';
import { B4, C1, H4 } from '../../typography/Typography';

const PriceInput = ({
    placeholder,
    children,
    value,
    addonText,
    onChangeText,
    onBlur,
    style,
    error, 
    editable,
    keyboardType = "number-pad",
    ...props
}: PriceInputProps) => {
    const renderAddonText = (text: string) => (
        <B4 color={getColor("green", 400)} style={styles.addonText}>{text}</B4>
    );
    
    return (
        <View style={[styles.inputContainer, style]} {...props}>
            {children && <H4>{children}</H4>}

            <View
                style={[
                    styles.inputWrapper,
                    {
                        paddingRight: 0,
                        borderColor: error ? getColor("red", 500) : getColor("green", 100), 
                    },
                ]}
            >
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    editable={editable}
                    keyboardType={keyboardType}
                    onChangeText={onChangeText}
                    onBlur={onBlur}
                    placeholderTextColor={getColor("green", 700, 0.7)}
                    textAlignVertical="center"
                    value={value}
                />
                {addonText && renderAddonText(addonText)}
            </View>

            {error && <C1 style={styles.errorText}>{error}</C1>} 
        </View>
    );
};

export default PriceInput;

const styles = StyleSheet.create({
    textInput: {
        flex: 1,
        fontFamily: "FunnelSans-Regular",
        fontSize: 16,
        color: getColor("green", 700),
        height: 44
    },
    inputContainer: {
        flexDirection: "column",
        gap: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: getColor("light"),
        paddingHorizontal: 12,
        height: 44

    },
    addonText: {
        padding: 12,
        backgroundColor: getColor("green", 100),
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    errorText: {
        color: getColor("red"),
    }
});
