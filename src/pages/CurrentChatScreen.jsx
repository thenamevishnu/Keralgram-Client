import { FaEllipsisVertical, FaMicrophone } from "react-icons/fa6"
import { FaChevronLeft, FaPaperclip, FaPhoneAlt, FaRegPaperPlane, FaRegStopCircle, FaStopCircle, FaVideo } from "react-icons/fa"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSocket } from "../Context/SocketProvider"
import { RiEmojiStickerFill } from "react-icons/ri";
import { api } from "../axios"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { MessageContextMenu } from "../Modals/MessageContextMenu"
import EmojiPicker from "emoji-picker-react"
import { DisplayMessage } from "../components/DisplayMessage"
import { AudioPlayer } from "../components/AudioPlayer"
import { Loading } from "../components/Loading"
import { removeCurrentChat } from "../Redux/currentChat.slice"

export const CurrentChatScreen = ({ setUpdateList }) => {
    
    const { id } = useSelector(state => state.user)
    const { currentChat } = useSelector(state => state.current_chat)
    const { online } = useSelector(state => state.online_users)
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const messageRef = useRef(null)
    const { socket } = useSocket()
    const timeOutRef = useRef(null)
    const [typing, setTyping] = useState(false)
    const dateRef = useRef(null)
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [showEmojiList, setEmojiList] = useState(false)
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const [isLoading, setLoading] = useState(false)
    const audioChunksRef = useRef([]);
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(removeCurrentChat())
    }, [])

    const startRecording = async ({ }) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(audioBlob);
                setAudioURL(URL.createObjectURL(audioBlob));
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            toast.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const sendAudioMessage = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        const file_name = new Date().getTime()
        formData.append("file", audioBlob, `${file_name}.webm`);

        try {
            const { data, status } = await api.post("/v1/messages/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (status === 200) {
                sendMessage(null, "voice", data.url, file_name+".webm", "webm", audioBlob.size);
                setAudioBlob(null);
                setAudioURL(null);
            }
        } catch (err) {
            toast.error("Failed to send audio message.");
        }
    };

    console.log(online);

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
        setLoading(true)
        if (currentChat) {
            (async () => {
                try {
                    const { data, status } = await api.get(`/v1/messages/${currentChat._id}`)
                    if (status === 200) {
                        await api.post(`/v1/messages/unread`, { chat_id: currentChat._id, to: (currentChat.users_info.find(user => user._id !== id))?._id, reset: true })
                        setLoading(false)
                        setUpdateList(new Date())
                        return setMessages(data)
                    }
                    setLoading(false)
                    dispatch(removeCurrentChat())
                } catch (err) {
                    setLoading(false)
                    dispatch(removeCurrentChat())
                    return toast.error(err.response?.data.message || "Something went wrong")
                }
            })()
        }
    }, [currentChat])

    const sendMessage = useCallback(async (e=null, type, msg=null, file_name=null, ext=null, file_size) => {
        setEmojiList(false)
        if (!msg && !message) return;
        const messageObj = {
            message: msg || message,
            type: type,
            file_name,
            file_size,
            file_extension: ext,
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
            return toast.error(err.response?.data.message || "Unsupported media type")
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
                    return sendMessage({preventDefault: () => {}}, data.type, data.url, data.file_name, data.ext, file.size)
                }
                return setMessage("")
            } catch (err) {
                return toast.error(err.response?.data.message || "Something went wrong")
            }
        })()
    }

    const handleDownload = ({ message: file, file_name}) => {
        const link = document.createElement("a")
        link.href = file
        link.download = file_name
        link.click()
    }

    return <div className="h-full">
        {showContextMenu && <MessageContextMenu setContextMenu={setShowContextMenu} showContextMenu={showContextMenu} handleDeleteSuccess={(message, type) => {
            setMessages(msgs => msgs.map(msg => msg._id == message._id ? message : msg))
            setShowContextMenu(false)
            if (type == "everyone") socket.emit("message_deleted", message)
        }} />}
        <div className="h-full">
            <div className="flex shadow shadow-black/30 justify-between p-2 h-[60px] gap-2 items-center">
                <div className="flex items-center gap-2">
                    <FaChevronLeft className="cursor-pointer" onClick={() => dispatch(removeCurrentChat())} />
                    <img src={currentChat.users_info.find(u => u._id !== id)?.picture} alt={currentChat.users_info.find(u => u._id !== id)?.name} className="w-12 h-12 rounded-full" />
                    <div className="truncate">
                        <p className="truncate">{currentChat.users_info.find(u => u._id !== id)?.name}</p>
                        <p className="text-green-400 text-xs">{typing ? "Typing..." : online?.includes(currentChat.users_info.find(u => u._id !== id)?._id) ? "Online" : <span className="text-red-500">Offline</span>}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <FaPhoneAlt size={18} />
                    <FaVideo size={18} />
                    <FaEllipsisVertical size={18} />
                </div>
            </div>
            <div ref={messageRef} className="h-[calc(100%-120px)] p-2 overflow-y-scroll scroll flex flex-col gap-1">
                {
                    isLoading && <div className="flex justify-center mt-2"><Loading /></div>
                }
                {
                    !isLoading && messages?.length == 0 && <div className="text-center mt-2">No messages found!</div>
                }
                {
                    !isLoading && messages.map((message) => {
                        if (message.delete_for_me?.includes(id)) return null
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                        const d = new Date(message.time * 1000)
                        const toDate = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " - " + days[d.getDay()]
                        let showDate = false
                        if (dateRef.current !== toDate) {
                            showDate = true
                            dateRef.current = toDate
                        }
                        return <DisplayMessage key={message._id} message={message} id={id} handleContextMenu={handleContextMenu} showDate={showDate} toDate={toDate} handleDownload={handleDownload}/>
                    })
                }
            </div>
            <form className="shadow shadow-black/30 h-[60px] flex items-center gap-3 p-2">
                <div className={`absolute bottom-[60px] ${showEmojiList ? "h-[400px]" : "h-0"} duration-150 ease-linear overflow-hidden`}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={400} width={350} suggestedEmojisMode="frequent" placeholder="Search Emoji..." emojiStyle="apple" theme="dark" />
                </div>
                <div className="flex rounded-full items-center w-full">
                    <div className="p-3 pe-0 flex items-center cursor-pointer"><RiEmojiStickerFill size={25} onClick={() => setEmojiList(pre => !pre)}/></div>
                    <div className="p-3 pe-0 flex items-center relative cursor-pointer overflow-hidden">
                        <FaPaperclip size={20}/>
                        <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} className="absolute opacity-0 cursor-pointer"/>
                    </div>
                    {audioBlob ? <AudioPlayer type={"voice"} className="ms-2" audio={audioURL} id={0} sender={0}/> : <textarea onInput={handleTyping} type="text" value={message} onChange={({ target: { value } }) => setMessage(value)} placeholder="Message..." className="p-3 w-full outline-none resize-none scroll-none" rows={1} />}
                </div>
                <div className="flex gap-3">
                {
                    recording ? <button type="button" onClick={stopRecording} className="py-3 rounded-full cursor-pointer" ><FaRegStopCircle  size={25} cursor={"pointer"} /></button> : <button type="button" onClick={startRecording} className="py-3 rounded-full cursor-pointer"><FaMicrophone size={25} cursor={"pointer"} /></button>
                }
                <button type="button" onClick={() => audioBlob ? sendAudioMessage() :sendMessage(null, "text")} className="py-3 rounded-full cursor-pointer"><FaRegPaperPlane size={25} cursor={"pointer"} /></button>
                </div>
            </form>
        </div>
    </div>
}


