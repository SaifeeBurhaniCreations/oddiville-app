import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { SubHeadingV2 } from '@/src/components/typography/Typography';
import Tag from '@/src/components/ui/Tag';
import { TitleWithTagProps } from "@/src/types";
import StarIcon from '../../icons/page/StarIcon';


const TitleWithTagComponent: React.FC<TitleWithTagProps> = ({ data, color }) => {
  const tagColor = color === "yellow" ? "green" : "yellow"
  const { label, tag, rating } = data
  
  if(data.rating) {
    return (
      <View style={styles.cardHeaderMain}>
        <SubHeadingV2 color={getColor(color, 700)}>{label}</SubHeadingV2>
        <View style={styles.tag}>
        {tag && (
          <Tag color={tagColor} size={tag.size || 'md'}>
            {tag.text}
          </Tag>
        )}
   
        {rating && tag && (
          <Tag color={"blue"} size={tag.size || 'md'} icon={<StarIcon />}>
            {rating}
          </Tag>
        )}
        </View>
      </View>
    )
  } else {
    return (
      <View style={styles.cardHeaderMain}>
        <SubHeadingV2 color={getColor(color, 700)}>{label}</SubHeadingV2>
        {tag && (
          <Tag color={tagColor} size={tag.size || 'md'}>
            {tag.text}
          </Tag>
        )}
      </View>
    )
  }
 
 
};

export default TitleWithTagComponent;

const styles = StyleSheet.create({
  cardHeaderMain: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  }
});