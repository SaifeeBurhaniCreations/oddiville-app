import { SearchProps } from "@/src/types";
import { StyleSheet } from "react-native";
import SearchInput from "../SearchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  setCitySearched,
  setStateSearched,
} from "@/src/redux/slices/bottomsheet/location.slice";
import { RootState } from "@/src/redux/store";
import { setRMSearchTerm } from "@/src/redux/slices/bottomsheet/rawMaterialSearch.slice";
import { setProductSearch } from "@/src/redux/slices/bottomsheet/product-search.slice";
import { setPackageSizeSearch } from "@/src/redux/slices/bottomsheet/package-size-search.slice";

const SearchComponent: React.FC<SearchProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { stateSearched, citySearched } = useSelector(
    (state: RootState) => state.location,
  );
  const RmSearched = useSelector(
    (state: RootState) => state.rawMaterialSearch.searchTerm,
  );
  const ProductSearched = useSelector(
    (state: RootState) => state.productSearch.productSearched,
  );
  const PackageSizeSearched = useSelector(
    (state: RootState) => state.packageSizeSearch.packageSizeSearched,
  );

  const value =
    data.searchType === "add-package"
      ? PackageSizeSearched
      : data.searchType === "add-product"
        ? ProductSearched
        : data.searchType === "add-raw-material"
          ? RmSearched
          : data.searchType === "state"
            ? stateSearched
            : citySearched;

  const setSearched =
    data.searchType === "add-package"
      ? setPackageSizeSearch
      : data.searchType === "add-product"
        ? setProductSearch
        : data.searchType === "add-raw-material"
          ? setRMSearchTerm
          : data.searchType === "state"
            ? setStateSearched
            : setCitySearched;

  return (
    <SearchInput
      style={{ borderWidth: 1 }}
      value={data.searchTerm ? data.searchTerm : value}
      onChangeText={(text: string) => dispatch(setSearched(text))}
      returnKeyType="search"
      placeholder={data.placeholder}
    />
  );
};

export default SearchComponent;

const styles = StyleSheet.create({});
