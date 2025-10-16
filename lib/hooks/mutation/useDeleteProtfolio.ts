import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { deletePortfolio } from "@/lib/api/portfolio";
import { showToast } from "@/components/toast/customToast";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { useState } from "react";

function useDeletePortfolio() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return {
    ...useMutation({
      mutationFn: deletePortfolio,
      onMutate: async (portfolioId) => {
        setDeletingId(portfolioId);
        //경쟁 상태 방지
        await queryClient.cancelQueries({
          queryKey: queryKeys.portfolios,
        });

        const prevPortfolios = queryClient.getQueryData<PortfolioDTO[]>([
          queryKeys.portfolios,
        ]);

        //낙관적 업데이트
        queryClient.setQueryData<PortfolioDTO[]>(
          [queryKeys.portfolios],
          (old) => {
            const currentData = old ?? [];
            return currentData.filter((p) => p.id !== portfolioId);
          }
        );

        //onError에서 사용
        return { prevPortfolios };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.portfolios,
        });
        showToast.success("포트폴리오가 삭제되었습니다.");
      },
      onError: (error) => {
        console.error("포트폴리오 삭제 실패:", error);
        showToast.error("포트폴리오 삭제 실패");
      },
      retry: 1,
    }),
    deletingId,
  };
}

export default useDeletePortfolio;
