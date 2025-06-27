import { BacktestingRes } from "@/app/interface/dto/backtesting";
import { ApiResponse } from "@/app/interface/dto/api";
import { AxiosResponse } from "axios";
import apiInstance from "./apiInstance";
import { BacktestingReq } from "@/app/interface/dto/backtesting";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { format } from "date-fns";

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
