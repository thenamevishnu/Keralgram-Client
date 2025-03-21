import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore } from "redux-persist"
import { userReducer } from "./user.slice"
import { configureStore } from "@reduxjs/toolkit"

const persistConfig = {
    key: "root",
    storage
}

const persistedUserReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({
    reducer: {
        user: persistedUserReducer
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