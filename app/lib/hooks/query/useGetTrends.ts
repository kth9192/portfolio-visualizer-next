import { getTrends } from "@/api/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import { ETFPriceDTO } from "@/app/interface/dto/etf";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { queryKeys } from "./keys";

interface useGetTrendsProps {
  days: number;
  options?: Omit<
    UseQueryOptions<
      ApiResponse<ETFPriceDTO[]>,
      Error,
      ETFPriceDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetTrends({ options, days }: useGetTrendsProps) {
  return useQuery({
    queryKey: queryKeys.trends,
    queryFn: () => getTrends(days),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useGetTrends;
