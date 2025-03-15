import { cookie } from "./lib/cookie"
import { jwtDecode } from "jwt-decode"
import { Navigate } from "react-router"
import { useMemo } from "react"

export const ProtectedRoute = ({ children }) => {
    const token = useMemo(() => cookie.get(), [])
    
    if (!token) {
        cookie.remove()
        return <Navigate to={"/auth"} />
    }

    try {
        const decode = jwtDecode(token)
        const expireAt = decode.exp
        if (expireAt < Math.floor(new Date().getTime() / 1000)) {
            cookie.remove()
            return <Navigate to={"/auth"} />
        }
        return children
    } catch (err) {
        cookie.remove()
        return <Navigate to={"/auth"} />
    }
}

export const NoLogin = ({ children }) => {
    const token = useMemo(() => cookie.get(), [])
    
    if (!token) {
        cookie.remove()
        return children
    }

    try {
        const decode = jwtDecode(token)
        const expireAt = decode.exp
        if (expireAt < Math.floor(new Date().getTime() / 1000)) {
            cookie.remove()
            return children
        }
        return <Navigate to={"/"} />
    } catch (err) {
        cookie.remove()
        return children
    }
}