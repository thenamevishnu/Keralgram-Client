import { GoogleLogin } from "@react-oauth/google"
import { useDispatch } from "react-redux"
import { api } from "../axios"
import { userLogin } from "../Redux/user.slice"
import { jwtDecode } from "jwt-decode"
import { toast } from "react-toastify"
import { cookie } from "../lib/cookie"
import { useNavigate } from "react-router"

export const LoginPage = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSuccess = async ({ credential }) => {
        try {
            const { data, status } = await api.post("/v1/users", { credential }) 
            if (status === 200) {
                console.log(data);
                const { sub: user } = jwtDecode(data.token)
                dispatch(userLogin({
                    name: user.name,
                    username: user.email.split("@")[0],
                    email: user.email,
                    picture: user.picture,
                    id: user._id
                }))
                cookie.set(data.token)
                toast.success("Logged in successfully")
                return navigate("/")
            }
            return toast.error(data.message)
        } catch (err) {
            console.log(err);
            return toast.error(err.response?.data.message || "Something went wrong")
        }
    }

    const handleError = () => {
        return toast.error("Something went wrong")
    }

    return <div className="flex justify-center items-center h-screen flex-col">
        <div className="font-medium text-xl mb-3">Login to continue</div>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError}/>
    </div>
}