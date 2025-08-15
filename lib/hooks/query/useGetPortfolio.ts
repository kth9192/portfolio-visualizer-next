import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getPortfolioById } from "@/api/portfolio";
import { ApiResponse } from "@/app/interface/dto/api";
import { PortfolioDTO } from "@/app/interface/dto/portfolio";

interface useGetPortfolioProps {
    id: string;
    options?: Omit<
        UseQueryOptions<
          ApiResponse<PortfolioDTO>,
          Error,
          PortfolioDTO,
          readonly unknown[]
        >,
        "queryKey" | "queryFn"
      >;
}


function useGetPortfolio({id, options}: useGetPortfolioProps){
 return useQuery({
    queryKey:[queryKeys.portfolio, id] as const,
    queryFn: () => getPortfolioById(id),
    select: (data) => (data.success ? data.data : null),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
 })   
}

export default useGetPortfolio