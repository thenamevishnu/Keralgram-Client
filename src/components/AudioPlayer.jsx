import { Fragment, useEffect, useRef, useState } from "react"
import { BsFileEarmarkMusic } from "react-icons/bs"
import { FaPause, FaPlay } from "react-icons/fa6"
import { RiVoiceprintFill } from "react-icons/ri"

export const AudioPlayer = ({ audio, type, className="", id, sender }) => {
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause()
        } else {
            audioRef.current?.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleProgress = (e) => {
        const current = e.target.currentTime
        const dur = e.target.duration
        const prog = (current / dur) * 100
        setProgress(prog)
        setCurrentTime(current)
        setDuration(dur)
        if (prog === 100) {
            setIsPlaying(false)
        }
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener('loadedmetadata', () => {
                setDuration(audioRef.current?.duration)
            })
        }
    }, [])

    return <Fragment>
        <audio ref={audioRef} src={audio} onTimeUpdate={handleProgress} className="hidden" />
        <div className={`max-w-full ${className} min-w-[200px] sm:min-w-[300px] px-1 rounded-xl h-12 flex border-0 items-center w-full gap-2 ${id === sender ? "bg-[#1E1E50]" : "bg-[#3A1E50]"}`}>
            <button type="button" onClick={handlePlayPause} className={`flex cursor-pointer items-center shrink-0 justify-center w-10 h-10 rounded-xl ${id === sender ? "bg-[#4545b7]" : "bg-[#7b40a8]"}`}>
                {isPlaying ? <FaPause className="text-white" /> : type == "voice" ? <RiVoiceprintFill className="text-white" /> : <BsFileEarmarkMusic  className="text-white" />}
            </button>
            {currentTime != Infinity && <div className="flex items-center justify-center text-xs text-white">
                {formatTime(currentTime)} 
            </div>}
            <div className="w-full h-1 bg-gray-600 rounded-full mx-2">
                <div className="h-full bg-gradient-to-r from-gray-600 to-white rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            {duration != Infinity && <div className="flex items-center justify-center text-xs text-white">
                {formatTime(duration)}
            </div>}
        </div>
    </Fragment>
}

