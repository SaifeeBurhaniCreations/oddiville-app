import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    data : []
}

const RawMaterialDataSlice = createSlice({
    name: "RawMaterialDataSlice",

    initialState,
    reducers : {
        resetState : (state) =>{
            
        },
        handleFetchData: (state, action) => {
            state.data = action.payload
        },
        handlePostData: (state, action) => {
            state.data.push(action.payload)
        },
        handleRemoveData: (state, action) => {
            state.data = state.data.filter(project => project?.id !== action.payload);
        },
        handleModifyData: (state, action) => {
            const updatedProject = action.payload;
            state.data = state.data.map(project => 
                project._id === updatedProject._id ? updatedProject : project
            );
        }
    }
})

export default RawMaterialDataSlice.reducer;
export const {resetState, handleFetchData, handlePostData, handleRemoveData, handleModifyData} = RawMaterialDataSlice.actions;