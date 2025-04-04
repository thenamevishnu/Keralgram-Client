import { createSlice } from "@reduxjs/toolkit"

const currentChatSlice = createSlice({
    name: "current_chat",
    initialState: {
        currentChat: null
    },
    reducers: {
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload
        },
        removeCurrentChat: (state) => {
            state.currentChat = null
        }
    }
})

export const { setCurrentChat, removeCurrentChat } = currentChatSlice.actions
export const { reducer: currentChatReducer } = currentChatSlice