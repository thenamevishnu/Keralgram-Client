import { createSlice } from "@reduxjs/toolkit"

const activeSlice = createSlice({
    name: "active_users",
    initialState: {
        online: []
    },
    reducers: {
        setOnline: (state, action) => {
            state.online = action.payload
        },
        addOnline: (state, action) => {
            state.online = [...state.online, action.payload]
        },
        removeOnline: (state, action) => {
            state.online = state.online.filter(item => item != action.payload)
        }
    }
})

export const { addOnline, removeOnline, setOnline } = activeSlice.actions
export const { reducer: activeReducer } = activeSlice