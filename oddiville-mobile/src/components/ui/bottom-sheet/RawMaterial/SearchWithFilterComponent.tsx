import { SearchProps } from '@/src/types'
import { StyleSheet } from 'react-native'
import SearchInput from '../../SearchInput'
import ActionButton from '../../Buttons/ActionButton'
import FilterIcon from '../../../icons/page/FilterIcon'
import { View } from 'moti'

const SearchWithFilterComponent: React.FC<SearchProps> = ({ data, color }) => {

  const { searchTerm, placeholder } = data
  return (
    <View style={styles.searchFilter}>
    <SearchInput value=''
      onChangeText={() => { }}
      onSubmitEditing={() => { }}
      returnKeyType="search"
      placeholder={placeholder}
    />
    <ActionButton icon={FilterIcon} filled style={{ height: 44, width: 44 }} />
  </View>
  )
}

export default SearchWithFilterComponent


const styles = StyleSheet.create({
    searchFilter: {
        flexDirection: 'row',
        gap: 16,
        alignItems: "center",
      },
})