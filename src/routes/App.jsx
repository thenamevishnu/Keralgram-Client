import { BrowserRouter, Route, Routes } from "react-router"
import { ChatPage } from "../pages/ChatPage"
import { NoLogin, ProtectedRoute } from "../Protected"
import { LoginPage } from "../pages/LoginPage"

export const App = () => {
    return <BrowserRouter>
        <Routes>
            <Route path="/">
                <Route path="" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/auth" element={<NoLogin><LoginPage /></NoLogin>} />
            </Route>
        </Routes>
    </BrowserRouter>
}