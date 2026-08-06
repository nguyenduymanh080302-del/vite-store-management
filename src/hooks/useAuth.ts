import { useMutation } from '@tanstack/react-query'
import { signinApi, signupApi } from '@/apis/auth.api'

export const useSignin = () => {
    return useMutation({
        mutationFn: signinApi,
    })
}

export const useSignup = () => {
    return useMutation({
        mutationFn: signupApi,
    })
}
