import CustomSpinner from "@/components/spinner/customSpinner";
import { queryKeys } from "@/lib/hooks/query/keys";
import HydrationWapper from "@/lib/hydration-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import PortfolioList from "./widget/portfolioList";
import PortfolioPageLoading from "./loading";
import { createPortfolioService } from "@/lib/server/database";
import { ApiResponse, createApiResponse } from "@/app/interface/dto/api";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";

async function PortfolioListPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.portfolios,
    queryFn: async () => {
      const portfolioService = createPortfolioService();
      const portfolios = await portfolioService.getPortfolios();

      return createApiResponse(portfolios, true, "success", 200) as ApiResponse<
        PortfolioDTO[]
      >;
    },
  });

  const data = queryClient.getQueryData(queryKeys.portfolios);

  const dehydratedState = dehydrate(queryClient);

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
          <p className="text-gray-600 mt-1">저장된 포트폴리오를 관리하세요</p>
        </div>
      </div>

      <HydrationWapper state={dehydratedState}>
        <PortfolioList />
      </HydrationWapper>
    </section>
  );
}

export default PortfolioListPage;
