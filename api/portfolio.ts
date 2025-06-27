import { AxiosResponse } from "axios";
import apiInstance from "./apiInstance";
import { ApiResponse } from "@/app/interface/dto/api";
import {
  PortfolioCreateDTO,
  PortfolioDTO,
} from "@/app/interface/dto/portfolio";

export const getPortfolios = async (): Promise<ApiResponse<PortfolioDTO[]>> => {
  const res = await apiInstance.get<ApiResponse<PortfolioDTO[]>>("/portfolio");
  console.log("getportfolios", res.data);

  return res.data;
};

export const postSavePortfolio = async (
  portfolio: PortfolioCreateDTO
): Promise<ApiResponse<PortfolioDTO>> => {
  const res = await apiInstance.post<ApiResponse<PortfolioDTO>>(
    "/portfolio",
    portfolio,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return res.data;
};
