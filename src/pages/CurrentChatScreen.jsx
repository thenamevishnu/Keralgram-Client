import { FaEllipsisVertical, FaRegMessage } from "react-icons/fa6"
import { useChat } from "../Context/ChatProvider"
import { FaChevronLeft, FaPhoneAlt, FaRegPaperPlane, FaVideo } from "react-icons/fa"
import { SiGooglemessages } from "react-icons/si"
import { Fragment, useEffect, useRef, useState } from "react"
import { useSocket } from "../Context/SocketProvider"
import { api } from "../axios"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"

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

    const handleTyping = () => {
        socket.emit("start_typing", { chat_id: currentChat._id, user: id })
        clearInterval(timeOutRef.current)
        if (timeOutRef) {
            timeOutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { chat_id: currentChat._id, user: id })
            }, 1000)
        }
    }

    useEffect(() => {
        if(currentChat) {
            (async () => {
                try {
                    const { data, status } = await api.get(`/v1/messages/${currentChat._id}`)
                    console.log(currentChat);
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

    const sendMessage = async e => {
        e.preventDefault()
        if (!message) return;
        const messageObj = {
            message,
            chat_id: currentChat._id,
            time: Math.floor(new Date().getTime() / 1000),
            sender: id,
            to: currentChat.users_info.find(u => u._id !== id)?._id
        }
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
    }

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTo({
                top: messageRef.current.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [messages])
    
    useEffect(() => {
        if (currentChat) {
            socket.emit("join_chat", {chat_id: currentChat._id})
        }
    }, [currentChat])

    useEffect(() => {
        socket.on("receive_message", (messageObj) => {
            setMessages(msgs => [...msgs, messageObj])
            setUpdateList(new Date())
        })
        socket.on("on_start_typing", ({ user }) => {
            if (user != id) {
                setTyping(true)
            }
        })
        socket.on("on_stop_typing", ({ user }) => {
            if (user != id) {
                setTyping(false)
            }
        })
    }, [socket])

    if (!currentChat) {
        return <div className="w-full flex justify-center items-center h-full">
            <div className="p-2 rounded-full px-4 cursor-pointer bg-black/20 backdrop-blur-xl">Select Chat To Continue</div>
        </div>
    }

    return <div className="h-full">
        <div className="h-full">
            <div className="flex shadow shadow-black/30 justify-between p-2 h-[60px] gap-2 items-center sticky top-0">
                <div className="flex items-center gap-2">
                    <FaChevronLeft className="cursor-pointer" onClick={() => setCurrentChat(null)}/>
                    <img src={currentChat.users_info.find(u => u._id !== id)?.picture} alt={currentChat.users_info.find(u => u._id !== id)?.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p>{currentChat.users_info.find(u => u._id !== id)?.name}</p>
                        <p className="text-green-400 text-xs">{typing ? "Typing..." : "Online"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <FaPhoneAlt size={18}/>
                    <FaVideo size={18} />
                    <FaEllipsisVertical size={18}/>
                </div>
            </div>
            <div ref={messageRef} className="h-[calc(100%-120px)] p-2 overflow-y-scroll scroll flex flex-col gap-2">
                {
                    messages.map((message) => {
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                        const d = new Date(message.time * 1000)
                        const toDate = d.toLocaleDateString() + " - " + days[d.getDay()]
                        const msg = (<Fragment>
                            {
                                dateRef.current != toDate && <div className="text-white text-center flex justify-center">
                                    <div className="bg-black/10 p-1 px-4 rounded-full">
                                        {toDate}
                                    </div>
                                </div>
                            }
                        </Fragment>)
                        if (dateRef.current != toDate) {
                            dateRef.current = toDate
                        }
                        return <Fragment key={message._id}>
                            {msg}
                            <div className={`w-full ${message.sender == id ? "flex-row-reverse" : "flex-row"} flex` }>
                                <div className={`flex ${message.sender == id ? "bg-white/5" : "bg-black/20"} px-2 rounded-md md:max-w-[300px] lg:max-w-[450px] items-center gap-2`}>
                                    <div className="flex w-full flex-col gap-2">
                                        <p className="break-words p-2">{message.message}</p>
                                    </div>
                                </div>
                            </div>
                        </Fragment>
                    })
                }
            </div>
            <form onSubmit={sendMessage} className="sticky shadow bottom-0 h-[60px] flex items-center gap-3 p-2">
                <div className="flex rounded-full items-center w-full">
                    <div className="p-3 pe-0 flex items-center"><SiGooglemessages size={25}/></div>
                    <input onInput={handleTyping} type="text" value={message} onChange={({ target: { value } }) => setMessage(value)} placeholder="Message..." className="p-3 w-full outline-none" />
                </div>
                <button type="submit" className="p-3 rounded-full cursor-pointer"><FaRegPaperPlane size={25} cursor={"pointer"}/></button>
            </form>
        </div>
    </div>
}