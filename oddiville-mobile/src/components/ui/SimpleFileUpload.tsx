import { getColor } from "@/src/constants/colors";
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Animated,
} from "react-native";
import { B3, B4, C1, H4, H5 } from "../typography/Typography";
import Button from "./Buttons/Button";
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import TrashIcon from "../icons/common/TrashIcon";
import FileIcon from "../icons/common/FileIcon";

const SimpleFileUpload = ({
  fileState,
  error,
  disabled,
  onlyPhoto,
  both,
  children = "Upload receipt",
}: {
  fileState: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ];
  error?: string;
  disabled?: boolean;
  onlyPhoto?: boolean;
  both?: boolean;
  children?: string | React.ReactNode;
}) => {
  const [isPicking, setIsPicking] = useState(false);
  const [touched, setTouched] = useState(false);
  const [imageUri, setImageUri] = fileState;

  const [selectedFile, setSelectedFile] = fileState;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const STRATEGY = both ? "both" : "upload";
  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error && touched ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [error, touched]);

  const handlePickFile = async () => {
    if (disabled) return;
    setTouched(true);
    try {
      setIsPicking(true);
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== "granted") {
          alert("Permission is required to upload a file.");
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
      console.error("Error picking file:", error);
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemove = () => {
    setTouched(true);
    setSelectedFile(null);
    setImageUri(null);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take a photo.");
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

  if (!imageUri) {
    // if (!selectedFile) {
    return (
      <View style={styles.cardWithLabel}>
        <H4>{children}</H4>
        <Pressable
          style={[
            styles.card,
            {
              borderColor:
                error && touched ? getColor("red") : getColor("green"),
            },
          ]}
          // onPress={handleTakePhoto}
          // onPress={handlePickFile}
          disabled={isPicking || disabled}
        >
          <View style={styles.cardItemLeft}>
            <View>
              <B3>Upload file</B3>
              <C1 color={getColor("green", 400)}>Supported: .pdf & .jpeg</C1>
            </View>
          </View>
          {STRATEGY === "both" ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button variant="outline" size="sm" onPress={handleTakePhoto}>
                Upload
              </Button>
              <Button variant="outline" size="sm" onPress={handlePickFile}>
                Browse
              </Button>
            </View>
          ) : (
            <Button variant="outline" size="sm" onPress={handleTakePhoto}>
              Upload
            </Button>
          )}
          {STRATEGY === "upload" && onlyPhoto && (
            <Button variant="outline" size="sm" onPress={handleTakePhoto}>
              Upload
            </Button>
          )}
        </Pressable>
        {error && touched && (
          <Animated.View style={{ opacity: errorOpacity }}>
            <B4 color={getColor("red", 700)}>
              {String(error || "Something went wrong.")}
            </B4>
          </Animated.View>
        )}
      </View>
    );
  }

  const fileName = imageUri.split("/").pop() || "Unnamed file";
  // const fileName = selectedFile.split('/').pop() || 'Unnamed file';
  const maxLength = 24;
  const truncatedName =
    fileName?.length > maxLength
      ? `${fileName.slice(0, maxLength - 3)}...`
      : fileName;

  return (
    <View style={styles.cardWithLabel}>
      <H4>Uploaded receipt</H4>
      <View
        style={[
          styles.uploadedCard,
          disabled ? styles.disabled : styles.enabled,
        ]}
      >
        <View style={styles.cardItemLeft}>
          <FileIcon />
          <H5>{truncatedName}</H5>
        </View>
        <TouchableOpacity onPress={() => !disabled && handleRemove()}>
          <TrashIcon size={24} color={getColor("green")} />
        </TouchableOpacity>
      </View>
      {error && touched && (
        <Animated.View style={{ opacity: errorOpacity }}>
          <B4 color={getColor("red", 700)}>
            {String(error || "Something went wrong.")}
          </B4>
        </Animated.View>
      )}
    </View>
  );
};

export default SimpleFileUpload;

const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor("light"),
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    borderStyle: "dashed",
  },
  cardItemLeft: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  cardWithLabel: {
    flexDirection: "column",
    gap: 12,
  },
  uploadedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: getColor("green", 100),
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: getColor("green", 100),
  },
  enabled: {
    opacity: 1,
    backgroundColor: getColor("light"),
  },
});
