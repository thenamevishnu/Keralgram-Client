import { FaEdit, FaTrash } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { api } from "../axios";
import { useSelector } from "react-redux";
import { Fragment } from "react";

export const MessageContextMenu = ({ showContextMenu: message, setContextMenu, handleDeleteSuccess }) => {

    const { id } = useSelector(state => state.user)
    const handleDelete = async type => {
        try {
            const { data, status } = await api.delete(`/v1/messages/${message._id}`, { params: { type } })
            if (status === 200) {
                return handleDeleteSuccess(data.updated, data.type)
            }
            setContextMenu(false)
        } catch (err){
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    return <div className="flex justify-center pt-10 z-[2] backdrop-blur-xs fixed w-full left-0 top-0 h-full bg-black/10">
        <div className="px-2 justify-center">
            <div className="w-full max-w-[500px] min-w-[150px] relative bg-[#222] p-2 rounded-md">
                {message.message}
            </div>
            <div className="mt-1 w-full max-w-auto rounded-md p-2 bg-black/30 backdrop-blur-xl">
                    {
                        id == message.sender && <Fragment>
                            <div className="flex hover:bg-black/20 items-center justify-center gap-2 p-1.5 rounded cursor-pointer"><FaEdit /> Edit</div>
                            <div className="flex hover:bg-black/20 items-center justify-center gap-2 p-1.5 rounded cursor-pointer" onClick={() => handleDelete("everyone")}><FaTrash /> Delete for everyone</div>
                        </Fragment>
                    }
                    {
                        id != message.sender && <Fragment>
                            <div className="flex hover:bg-black/20 items-center gap-2 p-1.5 rounded cursor-pointer"><FaEdit /> Edit</div>
                            <div className="flex hover:bg-black/20 items-center gap-2 p-1.5 rounded cursor-pointer" onClick={() => handleDelete(id)}><FaTrash /> Delete for me</div>
                        </Fragment>
                    }
                    <div className="flex hover:bg-black/20 items-center gap-2 p-1.5 rounded cursor-pointer" onClick={() => setContextMenu(false)}><FaXmark /> Close</div>
                </div>
        </div>
    </div>
}