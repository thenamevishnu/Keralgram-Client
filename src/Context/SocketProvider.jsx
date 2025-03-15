import { createContext, useContext, useMemo } from "react";
import io from "socket.io-client"

const Context = createContext()

export const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io(import.meta.env.VITE_SERVER), [])
    return <Context.Provider value={{socket}}>
        {children}
    </Context.Provider>
}

export const useSocket = () => {
    return useContext(Context)
}