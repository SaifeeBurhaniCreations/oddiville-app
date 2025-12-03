import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Item {
  label: string;
  icon: string;
  isoCode: string;
}

interface LocationState {
  countries: Item;
  states: {
    name: string;
    isoCode: string;
  };
  cities: string;
  stateSearched: string;
  citySearched: string;
  countrySearched: string;
}

const initialState: LocationState = {
  countries: { label: "India", icon: "", isoCode: "IN" },
  states: { name: "", isoCode: "" },
  cities: "",
  stateSearched: "",
  citySearched: "",
  countrySearched: "",
};

const LocationSlice = createSlice({
  name: "location_csc",
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Item>) => {
      state.countries = action.payload;
    },
    setState: (state, action: PayloadAction<{ name: string, isoCode: string }>) => {
      state.states = action.payload;
    },
    setCity: (state, action: PayloadAction<string>) => {
      state.cities = action.payload;
    },
    setStateSearched: (state, action: PayloadAction<string>) => {
      state.stateSearched = action.payload;
    },
    setCitySearched: (state, action: PayloadAction<string>) => {
      state.citySearched = action.payload;
    },
    setCountrySearched: (state, action: PayloadAction<string>) => {
      state.countrySearched = action.payload;
    },
    clearLocations: (state) => {
      state.cities = "";
      state.states = { name: "", isoCode: "" };
      state.countries = { label: "", icon: "", isoCode: "" };
    },
    clearState: (state) => {
      state.states = { name: "", isoCode: "" };
    },
    clearCity: (state) => {
      state.cities = "";
    },
  },
});

export const {
  setCountry,
  setState,
  setCity,
  clearLocations,
  clearState,
  clearCity,
  setStateSearched,
  setCitySearched,
} = LocationSlice.actions;

export default LocationSlice.reducer;
