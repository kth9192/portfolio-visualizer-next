import apiInstance from "./apiInstance";
import {
  ETFDetail,
  ETFDetailDTO,
  ETFInfoDTO,
  ETFPriceDTO,
  ETFTimeSeriesDTO,
  ETFTrendDTO,
} from "@/app/interface/dto/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import { AxiosResponse } from "axios";
import { BenchmarkData } from "@/app/interface/dto/benchmark";
import { format } from "date-fns";

export const getETFList = async (): Promise<ApiResponse<ETFInfoDTO[]>> => {
  const response = await apiInstance.get<ApiResponse<ETFInfoDTO[]>>("/etf");

  return response.data;
};

export const getSearchEtf = async (
  ticker: string
): Promise<ApiResponse<ETFInfoDTO[]>> => {
  const response = await apiInstance.get<ApiResponse<ETFInfoDTO[]>>(
    "/etf/search",
    {
      params: {
        ticker,
      },
    }
  );

  return response.data;
};

export const getTrends = async (): Promise<ApiResponse<ETFPriceDTO[]>> => {
  const response = await apiInstance.get<ApiResponse<ETFPriceDTO[]>>(
    "/etf/trends"
  );

  

  return response.data;
};

export const getBenchMarks = async ( startDate: Date, endDate: Date): Promise<
  ApiResponse<BenchmarkData[]>
> => {
  const response = await apiInstance.get<ApiResponse<BenchmarkData[]>>(
    "/benchmark",
    {params: {
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
    }}
  );

  return response.data;
};
