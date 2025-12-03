import React from 'react';
import { Text } from 'react-native';

export const TextHighlighter = (
  sentence: string,
  highlightWords: string[]
) => {
  if (!sentence || !highlightWords?.length) return sentence;
  
  return sentence?.split("").map((sen, index) => {
    const isHighlighted = highlightWords.includes(sen);
    return (
      <Text
      key={index}
      style={isHighlighted ? { fontFamily: 'FunnelSans-Bold', fontSize: 70 } : undefined}
    >
      {sen}
    </Text>
    )
  })
};
