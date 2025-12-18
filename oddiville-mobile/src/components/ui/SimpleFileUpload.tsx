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
import { useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import TrashIcon from "../icons/common/TrashIcon";
import FileIcon from "../icons/common/FileIcon";

type UploadStrategy = "upload" | "browse" | "both";

type Props = {
  fileState: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ];
  error?: string;
  disabled?: boolean;
  onlyPhoto?: boolean;
  both?: boolean;
  children?: string | React.ReactNode;
  uploadedChildren?: string | React.ReactNode;
  title?: string;
  description?: string;
};

const SimpleFileUpload = ({
  fileState,
  error,
  disabled,
  onlyPhoto = false,
  both,
  children = "Upload receipt",
  uploadedChildren = "Uploaded receipt",
  title = "Upload file",
  description = "Supported: .png & .jpg & .jpeg",
}: Props) => {
  const [fileUri, setFileUri] = fileState;
  const [isPicking, setIsPicking] = useState(false);
  const [touched, setTouched] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;

  const strategy: UploadStrategy = useMemo(() => {
    if (both) return "both";
    if (onlyPhoto) return "upload";
    return "browse";
  }, [both, onlyPhoto]);

  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error && touched ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [error, touched]);

  // ---------- Permission helpers ----------
  const ensureMediaPermission = async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status === "granted") return true;
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return res.status === "granted";
  };

  const ensureCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  // ---------- Handlers ----------
  const handlePickFile = async () => {
    if (disabled || isPicking) return;
    setTouched(true);

    try {
      setIsPicking(true);
      const hasPermission = await ensureMediaPermission();
      if (!hasPermission) {
        alert("Permission is required to upload a file.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setFileUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking file:", err);
    } finally {
      setIsPicking(false);
    }
  };

  const handleTakePhoto = async () => {
    if (disabled || isPicking) return;
    setTouched(true);

    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
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
      setFileUri(result.assets[0].uri);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    setTouched(true);
    setFileUri(null);
  };

  // ---------- Helpers ----------
  const getFileName = (uri: string) => {
    const name = uri.split("/").pop() || "Unnamed file";
    return name.length > 24 ? `${name.slice(0, 21)}...` : name;
  };

  const renderActions = () => {
    switch (strategy) {
      case "both":
        return (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isPicking}
              onPress={handleTakePhoto}
            >
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isPicking}
              onPress={handlePickFile}
            >
              Browse
            </Button>
          </View>
        );
      case "upload":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isPicking}
            onPress={handleTakePhoto}
          >
            Upload
          </Button>
        );
      case "browse":
        return (
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isPicking}
            onPress={handlePickFile}
          >
            Browse
          </Button>
        );
    }
  };

  // ---------- Render ----------
  if (!fileUri) {
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
          disabled={disabled}
        >
          <View>
            <B3>{title}</B3>
            <C1 color={getColor("green", 400)}>{description}</C1>
          </View>

          {renderActions()}
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

  return (
    <View style={styles.cardWithLabel}>
      <H4>{uploadedChildren}</H4>

      <View
        style={[
          styles.uploadedCard,
          disabled ? styles.disabled : styles.enabled,
        ]}
      >
        <View style={styles.cardItemLeft}>
          <FileIcon />
          <H5>{getFileName(fileUri)}</H5>
        </View>

        <TouchableOpacity disabled={disabled} onPress={handleRemove}>
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

// ---------- Styles ----------
const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor("light"),
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
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