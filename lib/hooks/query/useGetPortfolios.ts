import { ApiResponse } from "@/app/interface/dto/api";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getPortfolios } from "@/lib/api/portfolio";

interface useGetPortfoliosProps {
  options?: Omit<
    UseQueryOptions<
      ApiResponse<PortfolioDTO[]>,
      Error,
      PortfolioDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn" | "initalData"
  >;
}

function useGetPortfolios({ options }: useGetPortfoliosProps) {
  return useQuery({
    queryKey: queryKeys.portfolios,
    queryFn: getPortfolios,
    select: (data) => (data.success ? data.data : []),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useGetPortfolios;
