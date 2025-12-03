import React from 'react';
import { Dimensions, View, Image } from 'react-native';
import ImageZoomOriginal from 'react-native-image-pan-zoom';
import { ImagePreviewComponentProps } from '@/src/types';
import { getColor } from '@/src/constants/colors';
import { B3 } from '../../typography/Typography';

const ImageZoom = ImageZoomOriginal as unknown as React.ComponentType<any>;

const screenWidth = Dimensions.get('window').width;
const screenHeight = 500;

const ImagePreviewComponent = ({ data }: ImagePreviewComponentProps) => {
  const { imageUri } = data;
    
  if (!imageUri) {
    return (
      <View>
        <B3>No Image found</B3>
      </View>
    );
  }
    return (
        <View style={{ height: screenHeight, borderRadius: 12, overflow: 'hidden', backgroundColor: getColor("light", 200), borderColor: getColor("green", 100), borderWidth: 1 }}>
            <ImageZoom
                cropWidth={screenWidth}
                cropHeight={screenHeight}
                imageWidth={screenWidth}
                imageHeight={screenHeight}
            >
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </ImageZoom>
        </View>
    );
};

export default ImagePreviewComponent;
