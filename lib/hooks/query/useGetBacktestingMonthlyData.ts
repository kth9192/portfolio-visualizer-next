import { ApiResponse } from "@/app/interface/dto/api";
import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getBacktestDataMonthly } from "@/api/backtesting";
import { BacktestingReq } from "@/app/interface/dto/backtesting";

interface useGetBacktestingMonthlyDataProps {
  req: BacktestingReq;
  options?: Omit<
    UseQueryOptions<
      ApiResponse<ETFPriceMonthlyDTO[]>,
      Error,
      ETFPriceMonthlyDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetBacktestingMonthlyData({ req, options }: useGetBacktestingMonthlyDataProps) {
  return useQuery({
    queryKey: [queryKeys.backtestingMonthly , req.ticker, req.startDate, req.endDate, req.rebalanceFrequency],
    queryFn: () =>
      getBacktestDataMonthly({
        ticker: req.ticker,
        startDate: req.startDate,
        endDate: req.endDate,
        rebalanceFrequency: req.rebalanceFrequency,
      }),
    select: (data) => (data.success ? data.data : null),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useGetBacktestingMonthlyData;
