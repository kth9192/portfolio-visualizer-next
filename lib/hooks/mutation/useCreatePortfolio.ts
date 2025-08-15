import { postSavePortfolio } from "@/api/portfolio";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";

function useCreatePortfolio() {
 const queryClient = useQueryClient(); 
 
 return useMutation({
    mutationFn: postSavePortfolio,
    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.portfolios,
        })
    },
    onError: (error) => {
        console.error("포트폴리오 생성 실패:", error);
    },
    retry: 1,
 })
 

}

export default useCreatePortfolio