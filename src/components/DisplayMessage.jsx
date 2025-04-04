import { Fragment } from "react"
import { formatFileSize } from "../lib/file"
import { RiDownloadCloudLine, RiProhibitedLine } from "react-icons/ri"
import { AudioPlayer } from "./AudioPlayer"
import VideoPlayer from "./VideoPlayer"

export const DisplayMessage = ({ message, id, handleContextMenu, handleDownload, showDate, toDate }) => {
    
    const fileSize = formatFileSize(message.file_size)

    return <Fragment>
        {showDate && <div className="text-white text-center flex justify-center">
            <div className="bg-black/10 p-1 px-4 rounded-xl">
                {toDate}
            </div>
        </div>}
        <div className={`w-full ${message.sender == id ? "flex-row-reverse" : "flex-row"} flex my-1`}>
            <div onContextMenu={(e) => !message.delete_for_everyone && handleContextMenu(e, message)} >
                {
                    message.delete_for_everyone ? <div className={`flex gap-1 p-1 items-center max-w-[170px] xs:max-w-[300px] sm:max-w-[400px] lg:max-w-[600px] px-3 rounded-xl ${message.sender == id ? "bg-[#1E1E50] rounded-xl-br-none" : "bg-[#3A1E50] rounded-xl-bl-none"}`}>
                            <RiProhibitedLine /> This message was deleted
                        </div> :
                    message.type == "text" ? <div className={`p-1 w-full rounded-xl break-words px-3 whitespace-pre-wrap bg-gradient-to-r max-w-[170px] xs:max-w-[300px] sm:max-w-[400px] lg:max-w-[600px] min-w-[80px] ${message.sender == id ? "rounded-xl-br-none bg-[#1E1E50]" : "rounded-xl-bl-none bg-[#3A1E50]"}`} dangerouslySetInnerHTML={{ __html: message.message + `<br><div style="font-size: 0.7rem; text-align: end">${new Date(message.time * 1000).toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()}</div>` }}>
                        </div> :
                    message.type == "image" ? <div className="relative max-w-[500px]">
                        <span className="absolute bottom-0 right-1 text-xs">{new Date(message.time * 1000).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()} ({fileSize})</span>
                        <img src={message.message} alt="image file" className="max-w-full rounded-xl"/>
                    </div> :
                    message.type == "video" ? <div className="relative max-w-[500px]">
                        <span className="absolute z-[1] bottom-0 right-1 text-xs">{new Date(message.time * 1000).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()} ({fileSize})</span>
                        <VideoPlayer video={message.message} id={id} sender={message.sender}/>
                    </div> : 
                    message.type == "audio" ? <div className="relative max-w-[500px] w-full">
                        <span className="absolute z-[1] bottom-0 right-1 text-xs">{new Date(message.time * 1000).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()} ({fileSize})</span>
                        <AudioPlayer type={"audio"} audio={message.message} id={id} sender={message.sender}/>
                    </div> :
                        message.type == "voice" ? <div className="relative max-w-[500px] w-full">
                        <span className="absolute z-[1] bottom-0 right-1 text-xs">{new Date(message.time * 1000).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()} ({fileSize})</span>
                        <AudioPlayer type={"voice"} audio={message.message} id={id} sender={message.sender}/>
                    </div> :
                    <div className={`p-1 max-w-[300px] px-3 ${message.sender == id ? "bg-[#1E1E50] rounded-xl-br-none" : "bg-[#3A1E50] rounded-xl-bl-none"} rounded-xl`}>
                        <marquee>{message.file_name || "Unknown File"}</marquee>
                        <button onClick={() => handleDownload(message)} className="flex cursor-pointer items-center gap-2 w-full justify-center bg-white/10 p-1 rounded-xl"><RiDownloadCloudLine /> {fileSize}</button>
                        <div style={{fontSize: "0.7rem", textAlign: "end"}}>{new Date(message.time * 1000).toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric", hour12: true }).toUpperCase()}</div>
                    </div>

                }
            </div>
        </div>
    </Fragment>
}