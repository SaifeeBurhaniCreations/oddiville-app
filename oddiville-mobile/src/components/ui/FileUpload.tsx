import { getColor } from '@/src/constants/colors';
import { Image, Pressable, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import CameraIcon from '../icons/page/CameraIcon';
import { B1, B6, H4 } from '../typography/Typography';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import TrashIcon from '../icons/common/TrashIcon';
import RefreshIcon from '../icons/common/RefreshIcon';
import { BlurView } from 'expo-blur';

const { height: screenHeight } = Dimensions.get("screen");
const FileUpload= ({
  fileState,
  error,
}: {
  fileState: [string | null, React.Dispatch<React.SetStateAction<string | null>>],   error?: string;
}) => {
  const [imageUri, setImageUri] = fileState;
  const [isPicking, setIsPicking] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsPicking(true);
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          alert('Permission is required to upload a profile photo.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    } finally {
      setIsPicking(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take a photo.');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  

  return (
    <View style={styles.fileUploadWrapper}>
      <View style={styles.fileUploadHeader}>
        <H4>Capture photo</H4>
        <Pressable  onPress={handlePickImage} disabled={isPicking}>
        <B1 color={getColor('green')}>Browse from gallery</B1>
        </Pressable>
      </View>

      {!imageUri ? (
        <Pressable style={styles.card} onPress={handleTakePhoto} disabled={isPicking}>
          <View style={styles.cardBody}>
            <CameraIcon />
            <B6>Take a photo</B6>
          </View>
        </Pressable>
      ) : (
        <View style={styles.previewCard}>
          <Image source={{ uri: imageUri }} style={styles.backgroundImage} />
          <View style={styles.iconOverlay}>
            <View style={styles.blurIconWrapper}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              <TouchableOpacity onPress={() => setImageUri(null)}>
                <TrashIcon size={24} color={getColor('light')} />
              </TouchableOpacity>
            </View>

            <View style={styles.blurIconWrapper}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              <TouchableOpacity onPress={handlePickImage}>
                <RefreshIcon size={24} color={getColor('light')} />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      )}
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  fileUploadWrapper: {
    flexDirection: 'column',
    gap: 12,
  },
  fileUploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    position: 'relative',
    height: screenHeight * 0.18,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: getColor('green'),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('light'),
  },
  cardBody: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    position: 'relative',
    height: screenHeight * 0.18,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: getColor('light'),
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  blurIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 17, 13, 0.3)',
    position: 'relative',
  },

});
