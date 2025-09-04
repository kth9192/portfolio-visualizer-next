import { MonthlyPriceData } from "@/app/interface/dto/backtesting";
import { PortfolioAssetPackage } from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { startOfDay, subYears } from "date-fns";
import {
  checkRebalanceCondition,
  createMonthPriceMap,
  getCommonMonths,
  rebalancePortfolioForChart,
} from "../backtestCalculator";
import useGetBacktestingMonthlyData from "./query/useGetBacktestingMonthlyData";

interface useMonthlySeriesProps {
  portfolio: PortfolioAssetPackage[];
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  initialAmount: number;
}

const calculateCumulative = (
  portfolio: PortfolioAssetPackage,
  priceMap: MonthlyPriceData,
  commonMonths: string[],
  initialAmount: number,
  rebalanceFrequency: RebalanceFrequency
) => {
  const result: {
    name: string;
    year_month: string;
    cumulativeReturn: number;
    cumulativeReturnsPercent: number;
    portfolio_value: number;
    monthlyReturn: number;
  }[] = [];

  if (commonMonths.length === 0) {
    console.warn("No common months found");
    return result;
  }

  //주식 수량
  let currentShares = new Map<string, number>();

  //첫 달의 가격맵
  const firstMonthPrices = priceMap[commonMonths[0]];
  if (!firstMonthPrices) {
    console.error("First month prices not found");
    return result;
  }

  // 초기 포트폴리오 구성
  portfolio.assets.forEach((asset) => {
    const price = firstMonthPrices[asset.symbol];
    if (!price || price <= 0) {
      console.error(`Invalid price for ${asset.symbol}: ${price}`);
      return;
    }

    //자산이 초기 자금에 대해 할당 받는 금액 정도
    const targetAmount = asset.weight * initialAmount;
    // 주식 수량
    const shares = targetAmount / price;
    currentShares.set(asset.symbol, shares);
  });

  // 각 월별 계산
  commonMonths.forEach((yearMonth, idx) => {
    const monthPrices = priceMap[yearMonth];
    if (!monthPrices) return;

    // 리밸런싱 체크
    const isRebalanceMonth = checkRebalanceCondition(
      yearMonth,
      idx,
      rebalanceFrequency
    );

    // 포트폴리오 가치 계산
    let portfolioValue = 0;
    portfolio.assets.forEach((asset) => {
      const shares = currentShares.get(asset.symbol) || 0;
      const price = monthPrices[asset.symbol] || 0;
      portfolioValue += shares * price;
    });

    // 첫번쨰 달이 아니면서 리밸런싱에 해당하는 월이라면
    if (isRebalanceMonth && idx > 0) {
      // 리밸런싱 실행

      //데이터 문제로 가격이 없는 구간이 있다면
      const allPriceValide = portfolio.assets.every((asset) => {
        const price = monthPrices[asset.symbol] || 0;
        return price > 0;
      });

      //리밸런싱 하지 않음
      if (!allPriceValide) {
        console.error("Invalid price data for rebalance month");
        return;
      }

      currentShares = rebalancePortfolioForChart(
        portfolio,
        portfolioValue,
        monthPrices
      );
    }

    // 수익률 계산
    const cumulativeReturn = (portfolioValue - initialAmount) / initialAmount;
    const cumulativeReturnsPercent = cumulativeReturn * 100;

    let monthlyReturn = 0;
    //첫번쨰 달이 아니면서 이전 결과가 존한다면
    if (idx > 0 && result[idx - 1]) {
      const prevValue = result[idx - 1].portfolio_value;
      //이전 달의 포트폴리오 가치로 이전 달의 수익률 계산
      monthlyReturn =
        prevValue > 0 ? (portfolioValue - prevValue) / prevValue : 0;
    }

    result.push({
      name: portfolio.name,
      year_month: yearMonth,
      cumulativeReturn,
      portfolio_value: portfolioValue,
      cumulativeReturnsPercent,
      monthlyReturn,
    });
  });

  return result;
};

export const useMonthlySeries = ({
  portfolio,
  startDate,
  endDate,
  rebalanceFrequency,
  initialAmount,
}: useMonthlySeriesProps) => {
  // 자산당 기간내 월별 데이터를 가져옴
  const { data: backtestingMonthlyData } = useGetBacktestingMonthlyData({
    req: {
      ticker: portfolio.flatMap((portfolioInfo) =>
        portfolioInfo.assets.map((asset) => asset.symbol)
      ),
      startDate: startOfDay(subYears(new Date(), 3)),
      endDate: startOfDay(new Date()),
      rebalanceFrequency,
    },
  });

  if (!backtestingMonthlyData || backtestingMonthlyData.length === 0) {
    console.warn("No backtesting monthly data available");
    return [];
  }

  // 날짜 필터링
  const filteredData = backtestingMonthlyData.filter((data) => {
    // 1. 데이터의 년월을 숫자로 분리
    // 예: "2021-12" → [2021, 12]

    const [dataYear, dataMonth] = data.year_month.split("-").map(Number);

    // 시작/종료 날짜를 년월로 변환
    // 시작 날짜: 2021-12-15 → 년: 2021, 월: 12
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;

    // 년월 숫자로 비교 (예: 202112)
    const dataYearMonth = dataYear * 100 + dataMonth;
    const startYearMonth = startYear * 100 + startMonth;
    const endYearMonth = endYear * 100 + endMonth;

    return dataYearMonth >= startYearMonth && dataYearMonth <= endYearMonth;
  });

  console.log("filteredData", filteredData);

  //탐색 효율을 위해 가격을 맵으로 만듦
  const priceMap = createMonthPriceMap(filteredData);

  const result = portfolio.map((portfolioInfo) => {
    //유효 날짜 계산
    const commonMonths = getCommonMonths(priceMap, portfolioInfo.assets);

    if (commonMonths.length === 0) {
      console.warn("No common months found for portfolio");
      return [];
    }

    //기간내 월당 누적 수익률 등에 대해 계산
    return calculateCumulative(
      portfolioInfo,
      priceMap,
      commonMonths,
      initialAmount,
      rebalanceFrequency
    );
  });

  return result;
};
