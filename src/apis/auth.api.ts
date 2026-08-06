import axios from "@/configs/axios"

export const signinApi = async (payload: Pick<Account, "username" | "password">): Promise<ApiResponse<any>> => {
    const res = await axios.post('/auth/signin', payload)
    return res.data
}

export const signupApi = async (payload: {
    name: string
    username: string
    password: string
    email?: string
    phone?: string
    address?: string
}): Promise<ApiResponse<any>> => {
    const res = await axios.post('/auth/signup', payload)
    return res.data
}

export const checkAuthentication = async (): Promise<ApiResponse<any>> => {
    const res = await axios.get('/auth/me')
    return res.data
}