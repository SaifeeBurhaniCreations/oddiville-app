  import React from 'react';
  import { StyleSheet, View } from 'react-native';
  import Button from './Buttons/Button';

  type TabItem = {
    label: string;
    content: React.ReactNode;
  };

  type ButtonTabProps = {
    tabs: TabItem[];
    activeIndex: number;
    onChange: (index: number) => void;
  };

  const ButtonTab = ({ tabs, activeIndex, onChange }: ButtonTabProps) => {
    if (tabs?.length < 2 || tabs?.length > 4) {
      throw new Error('ButtonTab requires between 2 and 4 tabs.');
    }

    return (
      <View style={styles.container}>
        <View style={styles.buttonTab}>
          {tabs.map((tab, index) => (
            <Button
              key={index}
              variant={index === activeIndex ? 'fill' : 'outline'}
              half
              onPress={() => onChange(index)}
              color={index === activeIndex ? 'green' :"light"}
            >
              {tab.label}
            </Button>
          ))}
        </View>

        <View style={styles.tabContent} key={activeIndex}>
          {tabs[activeIndex].content}
        </View>
      </View>
    );
  };

  export default ButtonTab;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    buttonTab: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    tabContent: {
      flex: 1,
    },
  });
