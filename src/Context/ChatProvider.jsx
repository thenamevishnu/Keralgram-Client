import { createContext, useContext, useState } from "react";

const Context = createContext()

export const ChatProvider = ({ children }) => {
    const [currentChat, setCurrentChat] = useState(null)
    return <Context.Provider value={{ currentChat, setCurrentChat }}>
        {children}
    </Context.Provider>
}

export const useChat = () => {
    return useContext(Context)
}