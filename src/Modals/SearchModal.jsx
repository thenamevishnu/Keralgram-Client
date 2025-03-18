import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import { toast } from "react-toastify"
import { api } from "../axios"
import { FaXmark } from "react-icons/fa6"
import { useSelector } from "react-redux"

export const SearchModal = ({ handleChatCreation, setShowSearch }) => {

    const { id } = useSelector(state => state.user)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResult, setSearchResult] = useState([])

    const handleUserFetch = async () => {
        try {
            const { data, status } = await api.get(`/v1/users/search`, { params: { query: searchQuery, id } })
            if (status == 200) setSearchResult(data)
        } catch (err) {
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery) {
                handleUserFetch()
            }
        }, 1600)
        return () => clearTimeout(debounce)
    }, [searchQuery])
    
    console.log(searchResult);

    return <div className="backdrop-blur-xs px-2 fixed top-0 left-0 w-screen h-screen z-[2] bg-black/10 flex items-center justify-center">
        <div className="w-full flex-col items-center flex justify-center">
            <div className="bg-[#333] rounded w-full max-w-[500px] h-96 overflow-auto p-2">
                <div className="rounded-full flex gap-1">
                    <input onChange={({ target: { value } }) => setSearchQuery(value)} value={searchQuery} type="text" placeholder="Eg: John Doe or johndoe@gmail.com" className="w-full bg-black/10 p-2 outline-none rounded-full" />
                    <div onClick={() => setShowSearch(prev => !prev)} className="p-2 bg-black/10 cursor-pointer rounded-full w-10 h-10 flex justify-center items-center">
                        <FaXmark />
                    </div>
                </div>
                <div className="mt-2">
                    {
                        searchQuery && searchResult.map(user => {
                            return <div key={user._id} onClick={() => handleChatCreation(user)} className="flex p-1 items-center justify-between cursor-pointer duration-200 hover:bg-black/20 rounded">
                                <div className="p-2 flex w-full items-center">
                                    <img className="h-12 w-12 rounded-full" src={user.picture} alt="" />
                                    <div className="ml-2">
                                        <p>{user.name}</p>
                                        <p className="text-xs">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                    {
                        !searchQuery && <div className="text-center mt-2">
                            <p className="text-xs">Type any query...</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
}