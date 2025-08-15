import { ApiResponse } from "@/app/interface/dto/api";
import { BacktestingReq, BacktestingRes } from "@/app/interface/dto/backtesting";
import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import { format } from "date-fns";
import apiInstance from "./apiInstance";

export const getBacktestingData = async ({
  ticker,
  startDate,
  endDate,
  rebalanceFrequency,
}: BacktestingReq): Promise<ApiResponse<BacktestingRes>> => {
  if (ticker.length === 0) {
    throw new Error("ticker is empty");
  }

  if (!startDate || !endDate) {
    throw new Error("startDate or endDate is undefined");
  }

  if (!rebalanceFrequency) {
    throw new Error("rebalanceFrequency is undefined");
  }

  const response = await apiInstance.get<ApiResponse<BacktestingRes>>(
    "/backtesting",
    {
      params: {
        ticker: ticker.join(","),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        rebalanceFrequency,
      },
    }
  );
  return response.data;
};

export const getBacktestDataMonthly = async ({
  ticker,
  startDate,
  endDate,
  rebalanceFrequency,
}: BacktestingReq): Promise<ApiResponse<ETFPriceMonthlyDTO[]>> => {
  if (ticker.length === 0) {
    throw new Error("ticker is empty");
  }

  if (!startDate || !endDate) {
    throw new Error("startDate or endDate is undefined");
  }

  if (!rebalanceFrequency) {
    throw new Error("rebalanceFrequency is undefined");
  }

  const response = await apiInstance.get<ApiResponse<ETFPriceMonthlyDTO[]>>(
    "/backtesting/monthly",
    {
      params: {
        ticker: ticker.join(","),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        rebalanceFrequency,
      },
    }
  );
  return response.data;
};
