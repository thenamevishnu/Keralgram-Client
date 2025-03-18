import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user_info",
    initialState: {
        id: "",
        name: "",
        username: "",
        email: "",
        picture: ""
    },
    reducers: {
        userLogin: (state, action) => {
            state.id = action.payload.id
            state.name = action.payload.name
            state.username = action.payload.username
            state.email = action.payload.email
            state.picture = action.payload.picture
        },
        userLogout: (state) => {
            state.id = ""
            state.name = ""
            state.username = ""
            state.email = ""
            state.picture = ""
        },
        usernameUpdate: (state, action) => {
            state.username = action.payload.username
        }
    }
})

export const { userLogin, userLogout, usernameUpdate } = userSlice.actions
export const { reducer: userReducer } = userSlice