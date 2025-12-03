import { FullWidthSliderComponentProps } from "@/src/types";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Modal,
  FlatList,
  ViewToken,
} from "react-native";
import { B3 } from "../../typography/Typography";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const FullWidthSliderComponent: React.FC<FullWidthSliderComponentProps> = ({
  data,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const openSliderAt = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const closeSlider = () => setVisible(false);

  useEffect(() => {
    if (visible && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentIndex,
        animated: false,
      });
    }
  }, [visible, currentIndex]);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken[];
      changed: ViewToken[];
    }) => {
      if (
        viewableItems?.length > 0 &&
        viewableItems[0].index !== null &&
        viewableItems[0].index !== undefined
      ) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  );

  if (!data || data.length === 0) {
    return (
      <View>
        <B3>No Images found</B3>
      </View>
    );
  }

  return (
    <View style={styles.gallery}>
      {data?.map((uri, index) => (
        <Pressable key={index} onPress={() => openSliderAt(index)}>
          <Image source={{ uri }} style={styles.previewImage} />
        </Pressable>
      ))}

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <Pressable style={styles.closeTop} onPress={closeSlider} />
          <Pressable style={styles.closeBottom} onPress={closeSlider} />
          <Pressable style={styles.closeLeft} onPress={closeSlider} />
          <Pressable style={styles.closeRight} onPress={closeSlider} />

          <FlatList
            ref={flatListRef}
            data={data}
            keyExtractor={(_uri, idx) => `${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, i) => ({
              length: screenWidth,
              offset: screenWidth * i,
              index: i,
            })}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth, alignItems: "center" }}>
                <Image
                  source={{ uri: item }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default FullWidthSliderComponent;

const styles = StyleSheet.create({
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    backgroundColor: "rgba(0,0,0,0.94)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight * 0.95,
  },
  closeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.35,
    zIndex: 99,
  },

  closeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.35,
    zIndex: 99,
  },

  closeLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 1,
    zIndex: 99,
  },

  closeRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 1,
    zIndex: 99,
  },
});
