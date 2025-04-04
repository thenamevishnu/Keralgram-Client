import { FaBars, FaImage, FaSearch, FaSignOutAlt } from "react-icons/fa"
import { CurrentChatScreen } from "./CurrentChatScreen"
import { useEffect, useState } from "react"
import { api } from "../axios"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { SearchModal } from "../Modals/SearchModal"
import { useSocket } from "../Context/SocketProvider"
import { cookie } from "../lib/cookie"
import { userLogout } from "../Redux/user.slice"
import { useNavigate } from "react-router"
import { ProfileModal } from "../Modals/ProfileModal"
import { FaFile, FaVideo } from "react-icons/fa6"
import { BsFileEarmarkMusic } from "react-icons/bs";
import { RiVoiceprintFill } from "react-icons/ri"
import { Loading } from "../components/Loading"
import { removeCurrentChat, setCurrentChat } from "../Redux/currentChat.slice"

let mounted = false
let mountedInit = false

export const ChatPage = () => {

    const { id, picture, name } = useSelector(state => state.user)
    const { currentChat } = useSelector(state => state.current_chat)
    const { socket } = useSocket()
    const [users, setUsers] = useState([])
    const [updateList, setUpdateList] = useState(new Date())
    const [showSearch, setShowSearch] = useState(false)
    const [toggleMenu, setToggleMenu] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [query, setQuery] = useState("")
    const [isLoading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const getChatList = async () => {
        try {

            const { status, data } = await api.get(`/v1/chats/${id}?query=${query}`)
            if (status === 200) {
                setLoading(false)
                return setUsers(data)
            }
            setLoading(false)
            return toast.error(data.message)
        } catch (err) {
            setLoading(false)
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        setLoading(true)
        if (!mounted) {
            getChatList()
            mounted = true
        } else {
            let timeOut = setTimeout(() => {
                getChatList()
            }, 1300);
            return () => {
                clearTimeout(timeOut)
            }
        }
    }, [query])

    useEffect(() => {
        if (mountedInit) {
            getChatList()
        } else {
            mountedInit = true
        }
    }, [updateList])
    const getOpponent = users => users.users_info.find(user => user._id !== id)

    const handleChatCreation = async user => {
        try {
            const { data, status } = await api.post("/v1/chats", { user1: id, user2: user?._id })
            if (status !== 200) return toast.error(data.message)
            dispatch(setCurrentChat(data))
        } catch (err) {
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        if (id) socket.emit("join", id)
        socket.on("receive_message_alt", _message => setUpdateList(new Date()))
    }, [id, socket])

    const handleLogout = () => {
        cookie.remove()
        dispatch(userLogout())
        return navigate("/auth")
    }

    return <div className="flex">
        {showProfile && <ProfileModal setShowProfile={setShowProfile}/>}
        {showSearch && <SearchModal setShowSearch={setShowSearch} handleChatCreation={handleChatCreation} />}
        <div className={`${currentChat && "hidden md:flex"} flex w-10 h-10 rounded-full justify-center items-center fixed bottom-1 left-1 bg-black/30 cursor-pointer`}>
            <FaBars size={22} onClick={() => setToggleMenu(menu => !menu)} />
            <div className="absolute flex bottom-13 left-0 flex-col">
                <div onClick={() => setShowSearch(true)} className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-24" : "bottom-0 opacity-0 pointer-events-none"} h-10 flex justify-center items-center rounded-full overflow-hidden bg-black/30`}><FaSearch size={22} /></div>
                <div onClick={() => setShowProfile(true)} className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-12" : "bottom-0 opacity-0 pointer-events-none"} h-10 rounded-full overflow-hidden bg-black/30`}><img src={picture} alt={name} /></div>
                <div onClick={handleLogout} className={`w-10 absolute duration-200 ${toggleMenu ? "bottom-0" : "bottom-0 opacity-0 pointer-events-none"} text-red-500 h-10 rounded-full flex justify-center items-center overflow-hidden bg-black/30`}><FaSignOutAlt /></div>
            </div>
        </div>
        <div className={`h-screen w-full md:w-[600px] shadow shadow-black/50 overflow-y-scroll scroll-none ${currentChat && "hidden md:block"}`}>
            <h2 className="h-[40px] px-2 flex items-center text-md font-bold">KERALGRAM</h2>
            <div className="h-[50px] sticky z-[1] top-0 bg-[#222] flex items-center px-2">
                <div className="bg-white/10 items-center w-full flex rounded-full">
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} name="search" placeholder="Searhc query..."  id="search" className="outline-none p-2 w-full" />
                </div>
            </div>
            <div className="px-2 h-[calc(100%-90px)]">
                {
                    isLoading && <div className="flex justify-center mt-2"><Loading /></div>
                }
                {
                    !isLoading && users?.length == 0 && <div className="text-center mt-2">No chats found!</div>
                }
                {
                    !isLoading && users.map((u) => {
                        const user = getOpponent(u)
                        return <div key={user._id} onClick={() => handleChatCreation(user)} className="flex p-1 items-center justify-between cursor-pointer duration-200 hover:bg-black/10 rounded">
                            <div className="p-1 flex w-full">
                                <img className="h-12 w-12 rounded-full" src={user.picture} alt="" />
                                <div className="ml-2">
                                    <p>{user.name}</p>
                                    {
                                        u.last_message_type == "text" ? <p className="text-sm truncate">{u.last_message.length > 10 ? u.last_message.slice(0, 10) + "..." : u.last_message}</p> : 
                                            u.last_message_type == "image" ? <p className="text-sm truncate flex items-center gap-1"><FaImage size={15}/> Photo</p> : 
                                                u.last_message_type == "video" ? <p className="text-sm truncate flex items-center gap-1"><FaVideo /> Video</p> :
                                                    u.last_message_type == "audio" ? <p className="text-sm truncate flex items-center gap-1"><BsFileEarmarkMusic /> Audio</p> :
                                                        u.last_message_type == "voice" ? <p className="text-sm truncate flex items-center gap-1"><RiVoiceprintFill  /> Voice</p> : <p className="text-sm truncate flex items-center gap-1"><FaFile /> File</p>
                                    }
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
