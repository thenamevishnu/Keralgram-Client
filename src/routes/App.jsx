import { BrowserRouter, Route, Routes } from "react-router"
import { ChatPage } from "../pages/ChatPage"
import { NoLogin, ProtectedRoute } from "../Protected"
import { LoginPage } from "../pages/LoginPage"
import { useEffect } from "react"
import { useSocket } from "../Context/SocketProvider"
import { useDispatch } from "react-redux"
import { addOnline, removeOnline, setOnline } from "../Redux/active.slice"
import { api } from "../axios"

export const App = () => {

    const { socket } = useSocket()
    const dispatch = useDispatch()

    useEffect(() => {
        api.get("/v1/chats/list/active").then(({ data, status }) => {
            if (status == 200) dispatch(setOnline(data.map(i => i.user_id)))
        }).catch(_ => {})
        socket.on("active_status_update", ({ id, online }) => {
            if (online) {
                dispatch(addOnline(id))
            } else {
                dispatch(removeOnline(id))
            }
        })
    }, [socket])

    return <BrowserRouter>
        <Routes>
            <Route path="/">
                <Route path="" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/auth" element={<NoLogin><LoginPage /></NoLogin>} />
            </Route>
        </Routes>
    </BrowserRouter>
}