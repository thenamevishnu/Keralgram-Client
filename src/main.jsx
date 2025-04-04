import { createRoot } from "react-dom/client"
import { App } from "./routes/App"
import "./main.css"
import { SocketProvider } from "./Context/SocketProvider"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store } from "./Redux/store"
import { Provider } from "react-redux"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ToastContainer } from "react-toastify"

const app = createRoot(document.getElementById("app"))

app.render(<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_LOGIN_CLIENT_ID}>
    <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
            <SocketProvider>
                <App />
                <ToastContainer autoClose={1700} limit={1}/>
            </SocketProvider>
        </Provider>
    </PersistGate>
</GoogleOAuthProvider>)