import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { ImageGalleryComponentProps } from "@/src/types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const ImageGalleryComponent: React.FC<ImageGalleryComponentProps> = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <View style={styles.gallery}>
      {data?.map((uri, index) => (
        <Pressable key={index} onPress={() => setSelectedImage(uri)}>
          <Image source={{ uri }} style={styles.previewImage} />
        </Pressable>
      ))}

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.overlay}>
          <Pressable style={styles.closeArea} onPress={() => setSelectedImage(null)} />
          
          <Image
            source={{ uri: selectedImage! }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailStrip}>
            {data?.map((uri, index) => {
              const isSelected = uri === selectedImage;
              return (
                <Pressable key={index} onPress={() => setSelectedImage(uri)}>
                  <Image
                    source={{ uri }}
                    style={[
                      styles.thumbnail,
                      isSelected && styles.selectedThumbnail
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ImageGalleryComponent;

const styles = StyleSheet.create({
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  previewImage: {
    width: screenWidth * 0.27,
    height: screenWidth * 0.27,
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.6,
    borderRadius: 12,
    marginBottom: 24,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 24,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    opacity: 0.7,
  },
  selectedThumbnail: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
});
