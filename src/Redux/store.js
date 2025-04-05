import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore } from "redux-persist"
import { userReducer } from "./user.slice"
import { configureStore } from "@reduxjs/toolkit"
import { currentChatReducer } from "./currentChat.slice"
import { activeReducer } from "./active.slice"

const persistConfig = {
    key: "root",
    storage
}
const persistConfig2 = {
    key: "root2",
    storage
}

const persistedUserReducer = persistReducer(persistConfig, userReducer)
const persistedCurrentChatReducer = persistReducer(persistConfig2, currentChatReducer)

export const store = configureStore({
    reducer: {
        user: persistedUserReducer,
        current_chat: persistedCurrentChatReducer,
        online_users: activeReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoreActions: ["persist/PERSIST"]
            }
        })
    }
})

export const persistor = persistStore(store)