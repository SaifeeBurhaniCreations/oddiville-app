import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';
import { CustomImageProps } from "@/src/types";
import { useMemoizedStyle } from '@/src/hooks/useMemoizedStyle';
import Loader from './Loader';


const CustomImage: React.FC<CustomImageProps> = ({
    src,
    width = "100%",
    height = "100%",
    style = {},
    borderRadius,
    resizeMode = 'cover',
    fallback = { uri: "https://via.placeholder.com/150" },
    //   fallback = require('../assets/fallback.png'), 
    loadingIndicator = true,
}) => {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Determine the image source
    const source: ImageSourcePropType =
        imageError ? fallback : typeof src === 'string' ? { uri: src } : src;

    const imageStyle = useMemoizedStyle(
        [
            { width, height, borderRadius: borderRadius ?? 16 },
            style,
        ],
        [width, height, borderRadius, style]
    );

    return (
        <View style={[styles.container, { width, height }]}>
            {/* Loading Indicator */}
            {loading && loadingIndicator && (
               <Loader />
            )}

            {/* Image */}
            <Image
                source={source}
                style={imageStyle}
                resizeMode={resizeMode}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setImageError(true);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        borderRadius: 16,
    },
    loader: {
        position: 'absolute',
    },
});

export default CustomImage;