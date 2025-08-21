import { useMemo } from "react";
import { format } from "date-fns";
import { PortfolioSimulationData } from "@/app/interface/dto/portfolio";

interface MonthlyPortfolioData {
  yearMonth: string;
  cumulativeReturnsPercent: number;
  portfolioValue: number;
  date: Date;
}

export function useExtractMonthlyFromPortfolio(
  portfolioData: PortfolioSimulationData[]
) {
  return useMemo<MonthlyPortfolioData[]>(() => {
    if (!portfolioData.length) return [];

    const monthlyMap = new Map<string, PortfolioSimulationData>();

    // 각 월의 마지막 거래일 데이터만 추출
    portfolioData.forEach((data) => {
      const yearMonth = format(data.date, "yyyy-MM");

      // 해당 월의 가장 최근 데이터로 덮어쓰기 (월말 효과)
      if (
        !monthlyMap.has(yearMonth) ||
        data.date > monthlyMap.get(yearMonth)!.date
      ) {
        monthlyMap.set(yearMonth, data);
      }
    });

    // 정렬해서 반환
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((data) => ({
        yearMonth: format(data.date, "yyyy-MM"),
        cumulativeReturnsPercent: data.cumulativeReturnsPercent,
        portfolioValue: data.portfolioValue,
        date: data.date,
      }));
  }, [portfolioData]);
}
