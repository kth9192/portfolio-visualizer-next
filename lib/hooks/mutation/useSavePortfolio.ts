import { postSavePortfolio } from "@/lib/api/portfolio";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { PortfolioCreateDTO } from "@/app/interface/dto/portfolio";

function useSavePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PortfolioCreateDTO & { portfolioId?: string }) => {
      if (data.portfolioId) {
        return postSavePortfolio(data, data.portfolioId);
      }
      return postSavePortfolio(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolios,
      });
    },
    onError: (error) => {
      console.error("포트폴리오 생성 실패:", error);
    },
    retry: 1,
  });
}

export default useSavePortfolio;
