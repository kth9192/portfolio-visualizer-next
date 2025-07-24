import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getETFList } from "@/api/etf";
import { ETFInfoDTO } from "@/app/interface/dto/etf";
import { queryKeys } from "./keys";
import { ApiResponse } from "@/app/interface/dto/api";

interface useGetEtfInfosProps {
  options?: Omit<
    UseQueryOptions<
      ApiResponse<ETFInfoDTO[]>,
      Error,
      ETFInfoDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetEtfInfos({ options }: useGetEtfInfosProps) {
  return useQuery({
    queryKey: queryKeys.list,
    queryFn: getETFList,
    select: (data) => (data.success ? data.data : []),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useGetEtfInfos;
