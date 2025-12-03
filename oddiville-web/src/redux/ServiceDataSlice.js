import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    data : [],
    chamber: []
}

const ServiceDataSlice = createSlice({
    name: "ServiceDataSlice",

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
                project.id === updatedProject.id ? updatedProject : project
            );
        },
        handleFetchCategory: (state, action) => {            
            state.chamber = action.payload
        },
        handlePostCategory: (state, action) => {
            state.chamber.push(action.payload)
        },
        handleRemoveCategory: (state, action) => {
            state.chamber = state.chamber.filter(chamber => chamber.id !== action.payload);
        },
    }
})

export default ServiceDataSlice.reducer;
export const {resetState, handleFetchData, handlePostData, handleRemoveData, handleFetchCategory, handlePostCategory, handleRemoveCategory, handleModifyData} = ServiceDataSlice.actions;