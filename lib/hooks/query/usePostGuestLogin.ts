import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./keys"
import { postGuestLogin } from "@/lib/api/auth"
import { GuestLoginRes } from "@/app/interface/dto/auth"
import { ApiResponse } from "@/app/interface/dto/api"


interface UseGuestLoginProps {
    onCreateSuccess?: (data: GuestLoginRes) => void
    onCreateError?: (error: Error) => void
    mutationOptions?: UseMutationOptions<ApiResponse<GuestLoginRes>, Error, void, unknown>
}

export const usePostGuestLogin = ({onCreateSuccess, onCreateError, mutationOptions}: UseGuestLoginProps) => {
 
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn:async () => {
            const res = await postGuestLogin()
            return res
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.login,
            })

            if(response.success){
                onCreateSuccess?.(response.data)
            }
        },
        onError: (error) => {
           console.error("error");
           
           onCreateError?.(error)
        },
        retry:1,
        ...mutationOptions,

    })
}