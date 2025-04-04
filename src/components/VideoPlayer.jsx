import { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { FaPause, FaPlay, FaExpand } from "react-icons/fa6";

const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const VideoPlayer = ({ video, id, sender }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleMuteUnmute = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleFullScreen = () => {
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    const handleTimeUpdate = () => {
        const current = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setProgress((current / dur) * 100);
        setCurrentTime(current);
        setDuration(dur);
        if (current === dur) setIsPlaying(false);
    };

    const handleSeek = (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        videoRef.current.currentTime = newTime;
        setProgress(percent * 100);
    };

    useEffect(() => {
        const vid = videoRef.current;
        vid.src = video;
        vid.addEventListener("timeupdate", handleTimeUpdate);
        return () => vid.removeEventListener("timeupdate", handleTimeUpdate);
    }, [video]);

    return (
        <div
            className="relative w-full max-w-3xl rounded-xl overflow-hidden shadow-xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-auto bg-black"
                muted={isMuted}
                contextMenu="nodownload"
            />

            <div
                className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/60 transition-opacity duration-300 ${
                    isHovered || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePlayPause}
                            className="text-white hover:scale-110 transition-transform"
                        >
                            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                        </button>

                        <button
                            onClick={handleMuteUnmute}
                            className="text-white hover:scale-110 transition-transform"
                        >
                            {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                        </button>

                        <span className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <button
                        onClick={handleFullScreen}
                        className="text-white hover:scale-110 transition-transform"
                    >
                        <FaExpand size={18} />
                    </button>
                </div>

                <div
                    className="relative w-full h-2 bg-white/20 mt-3 rounded-full cursor-pointer"
                    onClick={handleSeek}
                >
                    <div
                        className={`absolute top-0 left-0 h-full bg-white rounded-full`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

