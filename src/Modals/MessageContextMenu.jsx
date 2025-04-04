import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { api } from "../axios";
import { useSelector } from "react-redux";
import { Fragment } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { AudioPlayer } from "../components/AudioPlayer";

export const MessageContextMenu = ({ showContextMenu: message, setContextMenu, handleDeleteSuccess }) => {

    const { id } = useSelector(state => state.user)
    const handleDelete = async type => {
        try {
            const { data, status } = await api.delete(`/v1/messages/${message._id}`, { params: { type } })
            if (status === 200) handleDeleteSuccess(data.updated, data.type)
            setContextMenu(false)
        } catch (err){
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    return <div className="flex overflow-auto justify-center pt-10 z-[2] backdrop-blur-xs fixed w-full left-0 top-0 h-full bg-black/10">
        <div className="px-2 justify-center">
            <div className="w-full max-w-[500px] min-w-[150px] relative bg-[#222] p-2 rounded-md">
                {
                    message.type == "image" ? <img src={message.message} alt="image" className="aspect-square w-52 h-52  rounded-md" /> : 
                    message.type == "video" ? <VideoPlayer id={0} sender={0} video={message.message} /> :
                    message.type == "audio" ? <AudioPlayer id={0} sender={0} audio={message.message} type="audio" /> :  
                    message.type == "voice" ? <AudioPlayer id={0} sender={0} audio={message.message} type="voice" /> :  
                    message.type == "text" ? <p className="break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.message }}></p> : <button className="p-2 flex items-center justify-center gap-2 bg-gray-500/10 rounded-md"><FaDownload /> {message.file_name || "Unknown File"}</button>
                    
                }
            </div>
            <div className="mt-1 w-full max-w-auto rounded-md p-2 bg-black/30 backdrop-blur-xl">
                    {
                        id == message.sender && <Fragment>
                            {message.type=="text"&&<div className="flex hover:bg-black/20 items-center justify-start gap-2 p-1.5 rounded cursor-pointer"><FaEdit /> Edit</div>}
                            <div className="flex hover:bg-black/20 items-center justify-start gap-2 p-1.5 rounded cursor-pointer" onClick={() => handleDelete("everyone")}><FaTrash /> Delete for everyone</div>
                        </Fragment>
                    }
                    {
                        id != message.sender && <Fragment>
                
                        </Fragment>
                }
                    <div className="flex hover:bg-black/20 items-center gap-2 p-1.5 rounded cursor-pointer" onClick={() => handleDelete(id)}><FaTrash /> Delete for me</div>
                    <div className="flex hover:bg-black/20 items-center gap-2 p-1.5 rounded cursor-pointer" onClick={() => setContextMenu(false)}><FaXmark /> Close</div>
                </div>
        </div>
    </div>
}