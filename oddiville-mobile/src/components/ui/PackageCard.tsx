import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { PackageCardProps } from '@/src/types';
import Overlay from '@/src/assets/images/packaging/Overlay';
import { getColor } from '@/src/constants/colors';
import CustomImage from './CustomImage';
import { H6 } from '../typography/Typography';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';

const OVERLAY_HEIGHT = 110;

const PackageCard = ({ name, img, style, href, bundle, id, ...props }: PackageCardProps) => {
  const { goTo } = useAppNavigation();

  const handlePress = () => {
  if (!href) return;
  goTo(href, { id, name });
};
  return (
    <Pressable onPress={handlePress} style={[styles.packageCard, style]}>
      
      {/* Main product image */}
      <View style={styles.mainImage} {...props}>
        <CustomImage src={img} width={130}  style={{height: '100%', width: '100%', objectFit: 'cover',}} height={150} borderRadius={0}  />
      </View>

      {/* <View style={styles.productImage}>
        <CustomImage src={img} width={56} height={56} style={{height: '100%', width: '100%', objectFit: 'contain',}}  borderRadius={0}  />
      </View> */}

      {/* Overlay */}
      <View style={styles.title}>
        <H6 style={{width: '100%'}}>
          {name}
        </H6>
      </View>
      <Overlay width="150" height="95" style={[styles.overlayStyle, { bottom: -OVERLAY_HEIGHT / 3 }]} />
    </Pressable>
  );
};

export default PackageCard;

const styles = StyleSheet.create({
  packageCard: {
    backgroundColor: 'hsla(150, 11%, 82%, 1)',
    borderColor: getColor('green', 100),
    borderWidth: 1,
    position: 'relative',
    borderRadius: 10,
    height: 150,
    width: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    position: 'absolute',
    bottom: '2%',
    left: '50%',
    transform: [{ translateX: -68 }],
    flexWrap: 'wrap',
    width: '50%'
  },
  mainImage: {
    position: 'relative',
    height: '100%',
    width: '100%',
    objectFit: 'contain',
    zIndex: -2,
    alignItems: 'center'
  },
  productImage: {
    position: 'absolute',
    // height: '100%',
    // width: 90,
    zIndex: 10,
    bottom: 10,
    right: 4
  },
  overlayStyle: {
    position: 'absolute',
     bottom: -25,
    left: '50%',
    transform: [{ translateX: -75 }],
    zIndex: -1,
  },
});
