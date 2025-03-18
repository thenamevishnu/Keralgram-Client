import { FaEllipsisVertical } from "react-icons/fa6"
import { useChat } from "../Context/ChatProvider"
import { FaChevronLeft, FaPaperclip, FaPhoneAlt, FaRegPaperPlane, FaVideo } from "react-icons/fa"
import { SiGooglemessages } from "react-icons/si"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useSocket } from "../Context/SocketProvider"
import { RiEmojiStickerFill, RiProhibitedLine } from "react-icons/ri";
import { api } from "../axios"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import { MessageContextMenu } from "../Modals/MessageContextMenu"
import EmojiPicker from "emoji-picker-react"

export const CurrentChatScreen = ({ setUpdateList }) => {
    
    const { id } = useSelector(state => state.user)
    const { currentChat, setCurrentChat } = useChat()
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const messageRef = useRef(null)
    const { socket } = useSocket()
    const timeOutRef = useRef(null)
    const [typing, setTyping] = useState(false)
    const dateRef = useRef(null)
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [showEmojiList, setEmojiList] = useState(false)

    const handleTyping = useCallback(() => {
        socket.emit("start_typing", { chat_id: currentChat._id, user: id })
        clearInterval(timeOutRef.current)
        if (timeOutRef) {
            timeOutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { chat_id: currentChat._id, user: id })
            }, 1000)
        }
    }, [socket, currentChat, id])

    useEffect(() => {
        if (currentChat) {
            (async () => {
                try {
                    const { data, status } = await api.get(`/v1/messages/${currentChat._id}`)
                    if (status === 200) {
                        return setMessages(data)
                    }
                    setCurrentChat(null)
                } catch (err) {
                    setCurrentChat(null)
                    return toast.error(err.response?.data.message || "Something went wrong")
                }
            })()
        }
    }, [currentChat])

    const sendMessage = useCallback(async (e, type, msg=null) => {
        e.preventDefault()
        setEmojiList(false)
        if (!msg && !message) return;
        const messageObj = {
            message: msg || message,
            type: type,
            chat_id: currentChat._id,
            time: Math.floor(new Date().getTime() / 1000),
            sender: id,
            to: currentChat.users_info.find(u => u._id !== id)?._id
        }
        console.log(messageObj);
        try {
            const { data, status } = await api.post(`/v1/messages`, messageObj)
            if (status != 200) {
                messages.pop()
                setMessages(messages)
                return toast.error(data.message)
            }
            setMessages(msgs => [...msgs, data])
            socket.emit("send_message", data)
            setMessage("")
            setUpdateList(new Date())
        } catch (err) {
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }, [message, currentChat, id, setMessages, socket, setUpdateList])

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTo({
                top: messageRef.current.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [messages])
    
    useEffect(() => {
        if (currentChat) socket.emit("join_chat", { chat_id: currentChat._id })
    }, [currentChat])

    useEffect(() => {
        socket.on("receive_message", (messageObj) => {
            setMessages(msgs => [...msgs, messageObj])
            setUpdateList(new Date())
        })
        socket.on("on_start_typing", ({ user }) => {
            if (user != id) setTyping(true)
        })
        socket.on("on_stop_typing", ({ user }) => {
            if (user != id) setTyping(false)
        })
        socket.on("on_delete_message", message => setMessages(msgs => msgs.map(msg => msg._id == message._id ? message : msg)))
    }, [socket])

    const handleContextMenu = useCallback((e, message) => {
        e.preventDefault()
        setShowContextMenu(message)
    }, [])

    if (!currentChat) {
        return <div className="w-full flex justify-center items-center h-full">
            <div className="p-2 rounded-full px-4 cursor-pointer bg-black/20 backdrop-blur-xl">Select Chat To Continue</div>
        </div>
    }

    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    let showDate = false
    if (dateRef.current !== today) {
        showDate = true
        dateRef.current = today
    }

    const handleEmojiClick = emoji => setMessage(message => (message + emoji.emoji))

    const handleFileUpload = file => {
        (async () => {
            try {
                const newForm = new FormData()
                newForm.append("file", file)
                const { data, status } = await api.post("/v1/messages/upload", newForm, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                if (status === 200) {
                    console.log(data);
                    return sendMessage({preventDefault: () => {}}, data.type, data.url)
                }
                return setMessage("")
            } catch (err) {
                return toast.error(err.response?.data.message || "Something went wrong")
            }
        })()
    }

    return <div className="h-full">
        {showContextMenu && <MessageContextMenu setContextMenu={setShowContextMenu} showContextMenu={showContextMenu} handleDeleteSuccess={(message, type) => {
            setMessages(msgs => msgs.map(msg => msg._id == message._id ? message : msg))
            setShowContextMenu(false)
            if (type == "everyone") socket.emit("message_deleted", message)
        }} />}
        <div className="h-full">
            <div className="flex shadow shadow-black/30 justify-between p-2 h-[60px] gap-2 items-center sticky top-0">
                <div className="flex items-center gap-2">
                    <FaChevronLeft className="cursor-pointer" onClick={() => setCurrentChat(null)} />
                    <img src={currentChat.users_info.find(u => u._id !== id)?.picture} alt={currentChat.users_info.find(u => u._id !== id)?.name} className="w-12 h-12 rounded-full" />
                    <div className="truncate">
                        <p className="truncate">{currentChat.users_info.find(u => u._id !== id)?.name}</p>
                        <p className="text-green-400 text-xs">{typing && "Typing..."}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <FaPhoneAlt size={18} />
                    <FaVideo size={18} />
                    <FaEllipsisVertical size={18} />
                </div>
            </div>
            <div ref={messageRef} className="h-[calc(100%-120px)] p-2 overflow-y-scroll scroll flex flex-col gap-2">
                {
                    messages.map((message) => {
                        if (message.delete_for_me?.includes(id)) return null
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                        const d = new Date(message.time * 1000)
                        const toDate = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " - " + days[d.getDay()]
                        let showDate = false
                        if (dateRef.current !== toDate) {
                            showDate = true
                            dateRef.current = toDate
                        }
                        return <Fragment key={message._id}>
                            {showDate && <div className="text-white text-center flex justify-center">
                                <div className="bg-black/10 p-1 px-4 rounded-full">
                                    {toDate}
                                </div>
                            </div>}
                            <div className={`w-full ${message.sender == id ? "flex-row-reverse" : "flex-row"} flex`}>
                                <div onContextMenu={(e) => handleContextMenu(e, message)} className={`flex ${message.sender == id ? "bg-white/5" : "bg-black/20"} px-2 rounded-md active:bg-black  min-w-[120px] max-w-[200px] xs:max-w-[300px] lg:max-w-[450px] items-center gap-2`}>
                                    <div className="flex w-full flex-col gap-1 p-1">
                                        {
                                            message.delete_for_everyone ? <div className="italic flex gap-1 items-center"> <RiProhibitedLine />This message was deleted</div> :
                                                <Fragment>
                                                    {message.type == "image" ? <img src={message.message} alt="image" className="aspect-square object-containrounded-md" /> : 
                                                    message.type == "video" ? <video src={message.message} controls className="w-full h-full rounded-md" /> : 
                                                    <p className="break-words whitespace-pre-wrap">{message.message}</p>}
                                                    <div className={`text-[10px] text-end`}>{new Date(message.time * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()}</div>
                                                </Fragment>
                                        }
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    })
                }
            </div>
            <form onSubmit={e => sendMessage(e, "text")} className="sticky shadow shadow-black/30 bottom-0 h-[60px] flex items-center gap-3 p-2">
                <div className={`absolute bottom-[60px] ${showEmojiList ? "h-[400px]" : "h-0"} duration-150 ease-linear overflow-hidden`}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={400} width={350} suggestedEmojisMode="frequent" placeholder="Search Emoji..." emojiStyle="apple" theme="dark" />
                </div>
                <div className="flex rounded-full items-center w-full">
                    <div className="p-3 pe-0 flex items-center cursor-pointer"><RiEmojiStickerFill size={25} onClick={() => setEmojiList(pre => !pre)}/></div>
                    <div className="p-3 pe-0 flex items-center relative cursor-pointer overflow-hidden">
                        <FaPaperclip size={20}/>
                        <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} className="absolute opacity-0 cursor-pointer"/>
                    </div>
                    <textarea onInput={handleTyping} type="text" value={message} onChange={({ target: { value } }) => setMessage(value)} placeholder="Message..." className="p-3 w-full outline-none resize-none scroll-none" rows={1} />
                </div>
                <button type="submit" className="p-3 rounded-full cursor-pointer"><FaRegPaperPlane size={25} cursor={"pointer"} /></button>
            </form>
        </div>
    </div>
}
