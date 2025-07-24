import { getTrends } from "@/api/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import { ETFPriceDTO, ETFTrendDTO } from "@/app/interface/dto/etf";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { queryKeys } from "./keys";

interface useGetTrendsProps {
  options?: Omit<
    UseQueryOptions<
       ETFPriceDTO[],
      Error,
      ETFPriceDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetTrends({ options }: useGetTrendsProps) {
  const defaultOptions = {
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 3,
    refetchOnWindowFocus: false,
    // select로 실제 데이터만 추출
    select: (data:  ApiResponse<ETFPriceDTO[]>):ETFPriceDTO[] => {
      
      console.log("data", data);
      
      return data.data || []},
  };

  return useQuery({
    queryKey: queryKeys.trends,
    queryFn: async () => {
      const result = await getTrends();
      console.log("result", result);

      return result;
    },
    ...defaultOptions,
    ...options,
  });
}

export default useGetTrends;
