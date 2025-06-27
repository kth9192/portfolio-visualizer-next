import { AxiosResponse } from "axios";
import apiInstance from "./apiInstance";
import { ApiResponse } from "@/app/interface/dto/api";
import { PortfolioCreateDTO } from "@/app/interface/dto/portfolio";

export const postSavePortfolio = async (
  portfolio: PortfolioCreateDTO
): Promise<ApiResponse<any>> => {
  const res = await apiInstance.post("/portfolio", portfolio, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return res.data;
};
