import { ApiResponse } from "@/app/interface/dto/api";
import { BacktestingRes } from "@/app/interface/dto/backtesting";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { queryKeys } from "./keys";
import { getBacktestingData } from "@/api/backtesting";
import { BacktestingReq } from "@/app/interface/dto/backtesting";

interface useGetBacktestingDataProps{
    req:BacktestingReq,
    options?:Omit<UseQueryOptions<AxiosResponse<ApiResponse<BacktestingRes>>, Error, BacktestingRes, readonly unknown[]>, 'queryKey' | 'queryFn'>
}

function useGetBacktestingData({req,options}:useGetBacktestingDataProps) {
    return useQuery({
        queryKey: queryKeys.backtesting,
        queryFn: () => getBacktestingData({
            ticker:req.ticker,
            startDate:req.startDate,
            endDate:req.endDate,
            rebalanceFrequency:req.rebalanceFrequency
        }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 3,
        refetchOnWindowFocus: false,
        ...options
    })
}

export default useGetBacktestingData