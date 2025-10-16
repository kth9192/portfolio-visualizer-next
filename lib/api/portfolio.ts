import { ApiResponse } from "@/app/interface/dto/api";
import {
  PortfolioCreateDTO,
  PortfolioDTO,
} from "@/app/interface/dto/portfolio";
import apiInstance from "./apiInstance";

export const getPortfolios = async (): Promise<ApiResponse<PortfolioDTO[]>> => {
  const res = await apiInstance.get<ApiResponse<PortfolioDTO[]>>("/portfolio");

  return res.data;
};

export const getPortfolioById = async (
  portfolioId: string
): Promise<ApiResponse<PortfolioDTO>> => {
  const res = await apiInstance.get<ApiResponse<PortfolioDTO>>(
    `/portfolio/${portfolioId}`
  );

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

export const deletePortfolio = async (
  portfolioId: string
): Promise<ApiResponse<PortfolioDTO>> => {
  const res = await apiInstance.delete<ApiResponse<PortfolioDTO>>(
    `/portfolio/${portfolioId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return res.data;
};
