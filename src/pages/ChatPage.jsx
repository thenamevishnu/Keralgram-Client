import { FaBars, FaSearch, FaSignOutAlt } from "react-icons/fa"
import { CurrentChatScreen } from "./CurrentChatScreen"
import { useChat } from "../Context/ChatProvider"
import { useEffect, useState } from "react"
import { api } from "../axios"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { SearchModal } from "../Modals/SearchModal"
import { FaGear } from "react-icons/fa6"
import { useSocket } from "../Context/SocketProvider"
import { cookie } from "../lib/cookie"
import { userLogout } from "../Redux/user.slice"
import { useNavigate } from "react-router"

export const ChatPage = () => {

    const { id, picture, name } = useSelector(state => state.user)
    const { setCurrentChat, currentChat } = useChat()
    const { socket } = useSocket()
    const [users, setUsers] = useState([])
    const [updateList, setUpdateList] = useState(new Date())
    const [showSearch, setShowSearch] = useState(false)
    const [toggleMenu, setToggleMenu] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        setCurrentChat(null)
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const { status, data } = await api.get("/v1/chats/" + id)
                if (status === 200) {
                    return setUsers(data)
                }
                return toast.error(data.message)
            } catch (err) {
                console.log(err);
                return toast.error(err.response?.data.message || "Something went wrong")
            }
        })()
    }, [updateList])

    const getOpponent = users => {
        return users.users_info.find(user => user._id !== id)
    }

    const handleChatCreation = async user => {
        try {
            const { data, status } = await api.post("/v1/chats", { user1: id, user2: user?._id })
            if (status !== 200) return toast.error(data.message)
            setCurrentChat(data)
        } catch (err) {
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        if (!currentChat) {
            socket.on("receive_message_alt", _message => {
                setUpdateList(new Date())
            })
        }
    }, [socket, id, currentChat])

    useEffect(() => {
        if (id) {
            socket.emit("join", id)
        }
    }, [id, socket])

    const handleLogout = () => {
        cookie.remove()
        dispatch(userLogout())
        return navigate("/auth")
    }

    return <div className="flex">
        {showSearch && <SearchModal setShowSearch={setShowSearch} handleChatCreation={handleChatCreation} />}
        <div className={`${currentChat && "hidden md:flex"} flex w-10 h-10 rounded-full justify-center items-center fixed bottom-1 left-1 bg-black/30 cursor-pointer`}>
            <FaBars size={22} onClick={() => setToggleMenu(menu => !menu)} />
            <div className="absolute flex bottom-13 left-0 flex-col">
                <div onClick={() => setShowSearch(true)} className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-36" : "bottom-0 opacity-0 pointer-events-none"} h-10 flex justify-center items-center rounded-full overflow-hidden bg-black/30`}><FaSearch size={22} /></div>
                <div className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-24" : "bottom-0 opacity-0 pointer-events-none"} h-10 flex justify-center items-center rounded-full overflow-hidden bg-black/30`}><FaGear size={22} /></div>
                <div className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-12" : "bottom-0 opacity-0 pointer-events-none"} h-10 rounded-full overflow-hidden bg-black/30`}><img src={picture} alt={name} /></div>
                <div onClick={handleLogout} className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-0" : "bottom-0 opacity-0 pointer-events-none"} text-red-500 h-10 rounded-full flex justify-center items-center overflow-hidden bg-black/30`}><FaSignOutAlt /></div>
            </div>
        </div>
        <div className={`h-screen w-full md:w-[600px] shadow shadow-black/50 overflow-y-scroll scroll-none ${currentChat && "hidden md:block"}`}>
            <h2 className="h-[40px] px-2 flex items-center text-md font-bold">KERALGRAM</h2>
            <div className="h-[50px] sticky z-[1] top-0 bg-[#222] flex items-center px-2">
                <div className="bg-white/10 items-center w-full flex rounded-full">
                    <input type="text" name="search" placeholder="Searhc query..." id="search" className="outline-none p-2 w-full" />
                    <div className="p-2">
                        <FaSearch />
                    </div>
                </div>
            </div>
            <div className="px-2 h-[calc(100%-90px)]">
                {
                    users.map((u) => {
                        const user = getOpponent(u)
                        return <div key={user._id} onClick={() => handleChatCreation(user)} className="flex p-1 items-center justify-between cursor-pointer duration-200 hover:bg-black/10 rounded">
                            <div className="p-1 flex w-full">
                                <img className="h-12 w-12 rounded-full" src={user.picture} alt="" />
                                <div className="ml-2">
                                    <p>{user.name}</p>
                                    <p className="text-sm truncate">{u.last_message.length > 10 ? u.last_message.slice(0, 10) + "..." : u.last_message}</p>
                                </div>
                            </div>
                            <div className="text-xs text-nowrap ">{new Date(u.last_message_time * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()}</div>
                        </div>
                    })
                }
            </div>
        </div>
        <div className={`h-screen w-full ${currentChat && "block"} ${!currentChat && "hidden md:block"}`}>
            <CurrentChatScreen setUpdateList={setUpdateList} />
        </div>
    </div>
}