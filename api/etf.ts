import apiInstance from "./apiInstance";
import { ETFInfoDTO, ETFPriceDTO, ETFTrendDTO } from "@/app/interface/dto/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import { AxiosResponse } from "axios";

export const getETFList = async (): Promise<ApiResponse<ETFInfoDTO[]>> => {
  const response = await apiInstance.get<ApiResponse<ETFInfoDTO[]>>("/etf");
  console.log("getetflist", response);

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
