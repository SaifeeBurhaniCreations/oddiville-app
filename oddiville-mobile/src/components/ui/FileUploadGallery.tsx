import { getColor } from '@/src/constants/colors';
import { StyleSheet, View, Pressable, Image, Dimensions, Alert } from 'react-native';
import { B6, H4 } from '../typography/Typography';
import { FileUploadGalleryProps } from '@/src/types';
import { useState, useMemo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import PlusIcon from '../icons/page/PlusIcon';

const { width: screenWidth } = Dimensions.get("screen");
const FileUploadGallery = ({ children, fileStates, existingStates, maxImage = 10 }: FileUploadGalleryProps) => {
  const [capturePhotos, setCapturePhotos] = fileStates;
  const [existingPhotos, setExistingPhotos] = existingStates;
  const safeCapturePhotos = Array.isArray(capturePhotos) ? capturePhotos : [];
  const safeExistingPhotos = Array.isArray(existingPhotos) ? existingPhotos : [];
  const [isPicking, setIsPicking] = useState(false);

  const totalPhotos = useMemo(() => safeCapturePhotos.length + safeExistingPhotos.length, [safeCapturePhotos.length, safeExistingPhotos.length]);

  const remainingSlots = Math.max(0, maxImage - totalPhotos);

  const handlePickImage = async () => {
    try {
      if (remainingSlots <= 0) {
        Alert.alert("Limit reached", `You can only upload up to ${maxImage} images.`);
        return;
      }

      setIsPicking(true);

      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission required', 'Permission is required to upload a photo.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
        const assets = result.assets.slice(0, remainingSlots);
        const newUris = assets.map(asset => asset.uri);

        setCapturePhotos([...(Array.isArray(capturePhotos) ? capturePhotos : []), ...newUris]);

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            "Limit reached",
            `Only ${remainingSlots} image(s) were added to respect the maximum of ${maxImage} images.`
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "Failed to pick image. Try again.");
    } finally {
      setIsPicking(false);
    }
  };

  const disablePicker = isPicking || remainingSlots <= 0;

  return (
    <View style={styles.fileUploadWrapper}>
      <H4>{children}</H4>
      <View style={styles.gallery}>
        <Pressable
          style={[styles.fileUpload, disablePicker ? styles.fileUploadDisabled : null]}
          onPress={handlePickImage}
          disabled={disablePicker}
        >
          <PlusIcon color={getColor("green", 700)} size={32} />
          <B6>{ disablePicker ? `Max ${maxImage}` : "Take a photo" }</B6>
        </Pressable>

        {safeCapturePhotos.map((uri, index) => (
          <Image key={`new-${index}-${uri}`} source={{ uri }} style={styles.previewImage} />
        ))}

        {safeExistingPhotos.map((uri, index) => (
          <Image key={`existing-${index}-${uri}`} source={{ uri }} style={styles.previewImage} />
        ))}
      </View>
    </View>
  );
};

export default FileUploadGallery;

const styles = StyleSheet.create({
  fileUploadWrapper: {
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 16,
  },
  fileUpload: {
    width: screenWidth * 0.284,
    height: screenWidth * 0.284,
    borderWidth: 1,
    borderColor: getColor('green'),
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: getColor('light'),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fileUploadDisabled: {
    opacity: 0.5,
  },
  previewImage: {
    width: screenWidth * 0.284,
    height: screenWidth * 0.284,
    borderRadius: 16,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  }
});