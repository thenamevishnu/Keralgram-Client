import { jwtDecode } from "jwt-decode"
const key = "CHAT_SESSION_KEY"
export const cookie = {
    set: token => {
        const decode = jwtDecode(token)
        const expireAt = new Date(decode.exp * 1000).toUTCString()
        document.cookie = `${key}=${token}; expires=${expireAt}`
    },
    remove: () => {
        document.cookie = `${key}=; expires=;`
    },
    get: () => {
        const cookies = document.cookie.split(";")
        for (let cookie of cookies) {
            const [name, value] = cookie.split("=")
            if (name.trim() === key) {
                return value
            }
        }
        return null
    }
}