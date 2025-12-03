import { getColor } from '@/src/constants/colors'
import { StyleSheet, View, Pressable, TouchableOpacity, Animated } from 'react-native'
import { B3, B4, C1, H4, H5 } from '../typography/Typography'
import Button from './Buttons/Button'
import { useEffect, useRef, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import TrashIcon from '../icons/common/TrashIcon'
import FileIcon from '../icons/common/FileIcon'

const SimpleFileUpload = ({
    fileState,
    error,
    disabled,
}: {
    fileState: [string | null, React.Dispatch<React.SetStateAction<string | null>>],
    error?: string;
    disabled?: boolean;
}) => {
    const [isPicking, setIsPicking] = useState(false);
    const [touched, setTouched] = useState(false);

    const [selectedFile, setSelectedFile] = fileState;
    const errorOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(errorOpacity, {
            toValue: error && touched ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [error, touched]);

    // Set touched on first action attempt
    const handlePickFile = async () => {
        if (disabled) return;
        setTouched(true); // Mark as touched at user intent!
        try {
            setIsPicking(true);
            const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (newStatus !== 'granted') {
                    alert('Permission is required to upload a file.');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedFile(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking file:', error);
        } finally {
            setIsPicking(false);
        }
    };

    // Set touched on removal as well
    const handleRemove = () => {
        setTouched(true);
        setSelectedFile(null);
    };

    if (!selectedFile) {
        return (
            <View style={styles.cardWithLabel}>
                <H4>Upload receipt</H4>
                <Pressable
                    style={[styles.card, { borderColor: error && touched ? getColor('red') : getColor('green') }]}
                    onPress={handlePickFile}
                    disabled={isPicking || disabled}
                >
                    <View style={styles.cardItemLeft}>
                        <View>
                            <B3>Upload file</B3>
                            <C1 color={getColor('green', 400)}>Supported: .pdf & .jpeg</C1>
                        </View>
                    </View>
                    <Button variant='outline' size='sm' onPress={handlePickFile}>
                        Browse
                    </Button>
                </Pressable>
                {/* Error visible ONLY if touched! */}
                {error && touched && (
                    <Animated.View style={{ opacity: errorOpacity }}>
                        <B4 color={getColor('red', 700)}>
                            {String(error || 'Something went wrong.')}
                        </B4>
                    </Animated.View>
                )}
            </View>
        );
    }

    const fileName = selectedFile.split('/').pop() || 'Unnamed file';
    const maxLength = 24;
    const truncatedName =
        fileName?.length > maxLength ? `${fileName.slice(0, maxLength - 3)}...` : fileName;

    return (
        <View style={styles.cardWithLabel}>
            <H4>Uploaded receipt</H4>
            <View style={styles.uploadedCard}>
                <View style={styles.cardItemLeft}>
                    <FileIcon />
                    <H5>{truncatedName}</H5>
                </View>
                <TouchableOpacity onPress={handleRemove}>
                    <TrashIcon size={24} color={getColor('green')} />
                </TouchableOpacity>
            </View>
            {/* Error visible ONLY if touched! */}
            {error && touched && (
                <Animated.View style={{ opacity: errorOpacity }}>
                    <B4 color={getColor('red', 700)}>
                        {String(error || 'Something went wrong.')}
                    </B4>
                </Animated.View>
            )}
        </View>
    );
};

export default SimpleFileUpload

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("light"),
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        alignItems: "center",
        borderStyle: "dashed"
    },
    cardItemLeft: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center"
    },
    cardWithLabel: {
        flexDirection: "column",
        gap: 12
    },
    uploadedCard: {
        backgroundColor: getColor("light"),
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: getColor("green", 100),
        alignItems: "center",
    }
})
