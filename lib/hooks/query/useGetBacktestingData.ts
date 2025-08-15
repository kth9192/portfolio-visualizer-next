import { ApiResponse } from "@/app/interface/dto/api";
import { BacktestingRes } from "@/app/interface/dto/backtesting";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getBacktestingData } from "@/api/backtesting";
import { BacktestingReq } from "@/app/interface/dto/backtesting";

interface useGetBacktestingDataProps {
  req: BacktestingReq;
  options?: Omit<
    UseQueryOptions<
      ApiResponse<BacktestingRes>,
      Error,
      BacktestingRes,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetBacktestingData({ req, options }: useGetBacktestingDataProps) {
  return useQuery({
    queryKey: [queryKeys.backtesting , req.ticker, req.startDate, req.endDate, req.rebalanceFrequency],
    queryFn: () =>
      getBacktestingData({
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

export default useGetBacktestingData;
