import { useState } from "react"
import { FaCheckCircle, FaEdit } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { api } from "../axios"
import { usernameUpdate } from "../Redux/user.slice"
import { FaXmark } from "react-icons/fa6"

export const ProfileModal = ({ setShowProfile }) => {
    
    const [editUsername, setEditUsername] = useState(false)
    const [editedUsername, setEditedUsername] = useState("")
    const { id, picture, name, username, email } = useSelector(state => state.user)
    const dispatch = useDispatch()

    const handleUsernameChange = async () => {
        try {
            if (editedUsername.toLowerCase() == username.toLowerCase()) {
                setEditUsername(false)
                return setEditedUsername("")
            }
            if(editedUsername.length < 4 || editedUsername.length > 20) return;
            const { status } = await api.patch(`/v1/users/${id}`, { username: editedUsername })
            if (status === 200) {
                dispatch(usernameUpdate({ username: editedUsername }))
                setEditUsername(false)
                return setEditedUsername("")   
            }
        } catch (err) {
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    return <div className="w-screen justify-center h-screen fixed top-0 left-0 backdrop-blur-xs bg-black/10 z-[2]">
        <div className="flex flex-col justify-center items-center h-full">
            <div className="bg-[#222] p-3 rounded">
                <div className="flex flex-col items-center gap-3">
                    <img src={picture} alt={name} className="rounded-full" />
                    <div className="text-center">
                        <h3>{name}</h3>
                        <p className="flex gap-3 items-center justify-center text-sm">@{editUsername ? <input type="text" value={editedUsername} onChange={e => setEditedUsername(e.target.value)} className="w-full outline-none" /> : username} {editUsername ? <FaCheckCircle onClick={handleUsernameChange} cursor={"pointer"}/> : <FaEdit onClick={() => { setEditUsername(true); setEditedUsername(username); }} cursor={"pointer"}/>}</p>
                        <p className="mt-2">{email}</p>
                    </div>
                </div>
                <p className="text-gray-400 italic text-xs mt-3">NB: You can{"'"}t change your profile picture, name, email from here</p>
            </div>
            <button className="flex gap-2 items-center cursor-pointer p-2" onClick={() => setShowProfile(prev => !prev)}><FaXmark /> Close</button>
        </div>
    </div>
}