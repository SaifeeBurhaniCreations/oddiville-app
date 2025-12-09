// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface FilterState {
//     filters: Record<string, string[]>;
// }

// const initialState: FilterState = {
//     filters: {},
// };

// interface ApplyFilterPayload {
//     main: string;
//     sub: string[];
// }

// const filterSlice = createSlice({
//     name: "filter",
//     initialState,
//     reducers: {
//         applyFilter: (state, action: PayloadAction<ApplyFilterPayload>) => {
//             state.filters[action.payload.main] = action.payload.sub;
//         },
//         clearFilter: (state, action: PayloadAction<string>) => {
//             delete state.filters[action.payload];
//         },
//         clearAllFilters: (state) => {
//             state.filters = {};
//         },
//     },
// });

// export const { applyFilter, clearFilter, clearAllFilters } = filterSlice.actions;
// export default filterSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterNode {
  value?: string;
  children?: Record<string, FilterNode>;
}

interface FilterState {
  filters: Record<string, FilterNode>;
}

const initialState: FilterState = {
  filters: {},
};

interface ApplyFilterPayload {
  path: string[];
  value?: string;
}

function setFilterNode(
  node: Record<string, FilterNode>,
  path: string[],
  value?: string
) {
  const [head, ...rest] = path;
  if (!node[head]) node[head] = {};
  if (rest.length === 0) {
    node[head].value = value;
  } else {
    if (!node[head].children) node[head].children = {};
    setFilterNode(node[head].children!, rest, value);
  }
}

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    applyFilter: (state, action: PayloadAction<ApplyFilterPayload>) => {
      const { path, value } = action.payload;
      const [mainKey, ...rest] = path;

      if (mainKey === "chamber:detailed") {
        state.filters[mainKey] = {};

        if (rest.length === 0) {
          state.filters[mainKey].value = value;
        } else {
          state.filters[mainKey].children = {};
          setFilterNode(state.filters[mainKey].children!, rest, value);
        }

        return;
      }

      setFilterNode(state.filters, path, value);
    },

    // applyFilter: (state, action: PayloadAction<ApplyFilterPayload>) => {
    //     setFilterNode(state.filters, action.payload.path, action.payload.value);
    // },
    clearFilter: (state, action: PayloadAction<string[]>) => {
      const removeNode = (node: Record<string, FilterNode>, path: string[]) => {
        const [head, ...rest] = path;
        if (!node[head]) return;
        if (rest.length === 0) {
          delete node[head];
        } else {
          node[head].children && removeNode(node[head].children!, rest);
        }
      };
      removeNode(state.filters, action.payload);
    },
    clearAllFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { applyFilter, clearFilter, clearAllFilters } =
  filterSlice.actions;
export default filterSlice.reducer;
