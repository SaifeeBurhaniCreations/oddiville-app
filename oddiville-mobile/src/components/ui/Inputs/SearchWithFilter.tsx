import { StyleSheet, Text, View } from 'react-native'
import SearchInput from '../SearchInput'
import ActionButton from '../Buttons/ActionButton'
import FilterIcon from '../../icons/page/FilterIcon'
import { ComponentType } from 'react';
import { IconProps } from '@/src/types';

const SearchWithFilter = ({
  placeholder = "Search",
  onFilterPress,
  value,
  cross,
  onChangeText,
  onSubmitEditing,
  onClear,
  icon = FilterIcon,
  style
}: {
  placeholder?: string;
  onFilterPress?: () => void;
  value: string;
  cross?: boolean;
  onSubmitEditing?: any;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  icon?: ComponentType<IconProps>;
  style?: any;
}) => {
  
  return (
    <View style={[styles.searchFilter, style]}>
      <SearchInput
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        placeholder={placeholder}
        onClear={onClear}
        cross={cross}
        onSubmitEditing={onSubmitEditing}
      />
      <ActionButton
        icon={icon}
        onPress={onFilterPress}
        filled
        style={{ height: 44, width: 44 }}
      />
    </View>
  );
};


export default SearchWithFilter

const styles = StyleSheet.create({
  searchFilter: {
    flexDirection: 'row',
    gap: 16,
    alignItems: "center",
  },
})