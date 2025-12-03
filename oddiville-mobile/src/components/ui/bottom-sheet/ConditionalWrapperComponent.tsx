import React from 'react';
import { View } from 'react-native';

interface ConditionalWrapperComponentProps {
  children: React.ReactNode;
  conditions?: {
    [key: string]: () => boolean;
  };
  conditionKey?: string;
}

const ConditionalWrapperComponent: React.FC<ConditionalWrapperComponentProps> = ({
  children,
  conditions = {},
  conditionKey,
}) => {
  if (conditionKey && conditions[conditionKey] && !conditions[conditionKey]()) {
    return null;
  }

  return <View>{children}</View>;
};

export default ConditionalWrapperComponent;