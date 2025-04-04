import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import { toast } from "react-toastify"
import { api } from "../axios"
import { FaXmark } from "react-icons/fa6"
import { useSelector } from "react-redux"
import { Loading } from "../components/Loading"

export const SearchModal = ({ handleChatCreation, setShowSearch }) => {

    const { id } = useSelector(state => state.user)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [isLoading, setLoading] = useState(true)

    const handleUserFetch = async () => {
        try {
            const { data, status } = await api.get(`/v1/users/search`, { params: { query: searchQuery, id } })
            if (status == 200) {
                setSearchResult(data)
                return setLoading(false)
            }
            setLoading(false)
        } catch (err) {
            setLoading(false)
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        setLoading(true)
        const debounce = setTimeout(() => {
            if(searchQuery == "") {
                setLoading(false)
            }
            if (searchQuery) {
                handleUserFetch()
            }
        }, 1600)
        return () => clearTimeout(debounce)
    }, [searchQuery])
    
    return <div className="backdrop-blur-xs px-2 fixed top-0 left-0 w-screen h-screen z-[2] bg-black/10 flex items-center justify-center">
        <div className="w-full flex-col items-center flex justify-center">
            <div className="bg-[#333] rounded w-full max-w-[500px] max-h-96 overflow-auto p-2">
                <div className="rounded-full flex gap-1">
                    <input onChange={({ target: { value } }) => setSearchQuery(value)} value={searchQuery} type="text" placeholder="Eg: John Doe or johndoe@gmail.com" className="w-full bg-black/10 p-2 outline-none rounded-full" />
                    <div onClick={() => setShowSearch(prev => !prev)} className="p-2 bg-black/10 cursor-pointer rounded-full w-10 h-10 flex justify-center items-center">
                        <FaXmark />
                    </div>
                </div>
                <div className="mt-2">
                    {
                        isLoading && <div className="flex justify-center mt-2"><Loading /></div>
                    }
                    {
                        !isLoading && searchResult?.length == 0 && <div className="text-center mt-2">No results found!</div>
                    }
                    {
                        !isLoading && searchQuery && searchResult.map(user => {
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
                        !isLoading && !searchQuery && <div className="text-center mt-2">
                            <p className="text-xs">Type any query...</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
}