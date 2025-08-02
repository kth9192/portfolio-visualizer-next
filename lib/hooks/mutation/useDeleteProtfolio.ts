import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { deletePortfolio } from "@/api/portfolio";
import { showToast } from "@/components/toast/customToast";

function useDeletePortfolio() {
const queryClient = useQueryClient();

return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.portfolios,
        })
        showToast.success("포트폴리오가 삭제되었습니다.")
    },
    onError: (error) => {
        console.error("포트폴리오 삭제 실패:", error);
        showToast.error("포트폴리오 삭제 실패")
    },
    retry: 1,
})
}

export default useDeletePortfolio;
