import { getBenchMarks } from "@/lib/api/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import {
  useQuery,
  type UseQueryOptions
} from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { BenchmarkData } from "@/app/interface/dto/benchmark";
import { format } from "date-fns";

interface useGetBenchmarksProps {
  startDate: Date;
  endDate: Date;
  options?: Omit<
    UseQueryOptions<
      ApiResponse<BenchmarkData[]>,
      Error,
      BenchmarkData[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >;
}

function useGetBenchmarkInfos({ startDate, endDate, options }: useGetBenchmarksProps) {
  return useQuery({
    queryKey: [queryKeys.benchmarks, format(startDate , 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: () => getBenchMarks(startDate, endDate),
    select: (data) => (data.success ? data.data : []),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export default useGetBenchmarkInfos;
