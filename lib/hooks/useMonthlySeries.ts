import { ETFPriceMonthlyDTO } from "@/app/interface/dto/etf";
import { PortfolioAssetPackage } from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { startOfDay, subYears } from "date-fns";
import useGetBacktestingMonthlyData from "./query/useGetBacktestingMonthlyData";

interface useMonthlySeriesProps {
  portfolio: PortfolioAssetPackage[];
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: RebalanceFrequency;
  initialAmount: number;
}

const makePriceMap = (etfPriceInfo: ETFPriceMonthlyDTO[]) => {
  const monthlyPriceMap = new Map<string, Map<string, number>>();

  etfPriceInfo.forEach((data) => {
    //날짜가 존재하지 않는다면
    if (!monthlyPriceMap.has(data.year_month)) {
      //날짜에 맵 만들기
      monthlyPriceMap.set(data.year_month, new Map());
    }
    //날짜가 있으면 심볼-가격을 추가함
    monthlyPriceMap.get(data.year_month)?.set(data.symbol, data.close);
  });

  return monthlyPriceMap;
};

const getCommonMonths = (
  priceMap: Map<string, Map<string, number>>,
  assets: { symbol: string }[]
): string[] => {
  const symbols = assets.map((asset) => asset.symbol);
  const commonMonths: string[] = [];

  // 날짜 순서로 정렬
  const sortedKeys = Array.from(priceMap.keys()).sort();

  for (const yearMonth of sortedKeys) {
    //날짜에 해당하는 가격을 가져옴
    const monthPrices = priceMap.get(yearMonth);
    if (!monthPrices) continue;

    //모든 자산이 해당 날짜에 있으며 유효할떄
    const hasAllSymbols = symbols.every(
      (symbol) => monthPrices.has(symbol) && monthPrices.get(symbol)! > 0
    );

    //날짜가 유효성 검증이 됐으면 백테스트 가능한 공통날짜로 추가
    if (hasAllSymbols) {
      commonMonths.push(yearMonth);
    }
  }

  return commonMonths;
};

const calculateCumulative = (
  portfolio: PortfolioAssetPackage,
  priceMap: Map<string, Map<string, number>>,
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
  const firstMonthPrices = priceMap.get(commonMonths[0]);
  if (!firstMonthPrices) {
    console.error("First month prices not found");
    return result;
  }

  // 초기 포트폴리오 구성
  portfolio.assets.forEach((asset) => {
    const price = firstMonthPrices.get(asset.symbol);
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
    const monthPrices = priceMap.get(yearMonth);
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
      const price = monthPrices.get(asset.symbol) || 0;
      portfolioValue += shares * price;
    });

    // 첫번쨰 달이 아니면서 리밸런싱에 해당하는 월이라면
    if (isRebalanceMonth && idx > 0) {
      // 리밸런싱 실행

      //데이터 문제로 가격이 없는 구간이 있다면
      const allPriceValide = portfolio.assets.every((asset) => {
        const price = monthPrices.get(asset.symbol) || 0;
        return price > 0;
      });

      //리밸런싱 하지 않음
      if (!allPriceValide) {
        console.error("Invalid price data for rebalance month");
        return;
      }

      currentShares = rebalancePortfolio(
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

const checkRebalanceCondition = (
  yearMonth: string,
  index: number,
  rebalanceFrequency: RebalanceFrequency
): boolean => {
  if (index === 0) return false; // 첫 번째 월은 리밸런싱 하지 않음

  const [year, month] = yearMonth.split("-").map(Number);

  if (isNaN(year) || isNaN(month)) {
    console.error(`Invalid year_month format: ${yearMonth}`);
    return false;
  }

  switch (rebalanceFrequency) {
    case RebalanceFrequency.MONTHLY:
      return true;
    case RebalanceFrequency.QUARTERLY:
      return month % 3 === 0; // 3, 6, 9, 12월
    case RebalanceFrequency.SEMIANNUALLY:
      return month % 6 === 0; // 6, 12월
    case RebalanceFrequency.ANNUALLY:
      return month === 1; // 1월 (연 초)
    default:
      return false;
  }
};

const rebalancePortfolio = (
  portfolio: PortfolioAssetPackage,
  currentPortfolioValue: number,
  monthPrices: Map<string, number>
) => {
  let currentShares = new Map<string, number>();
  //구성 자산에 대해
  portfolio.assets.forEach((asset) => {
    //현재 포트폴리오 가치에 대해 비중만큼의 총액
    const targetAmount = asset.weight * currentPortfolioValue;
    //해당 월의 자산 가격
    const price = monthPrices.get(asset.symbol);

    //포트폴리오 가치로 다시 계산된 주식수량
    const newShares = targetAmount / price;
    currentShares.set(asset.symbol, newShares);
  });

  return currentShares;
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
    const [year, month] = data.year_month.split("-").map(Number);
    const dataDate = new Date(year, month - 1, 1); // month는 0-based
    //시작과 끝안에 들어간다면
    return dataDate >= startDate && dataDate <= endDate;
  });

  if (filteredData.length === 0) {
    console.warn("No data after filtering by date range");
    return [];
  }

  //탐색 효율을 위해 가격을 맵으로 만듦
  const priceMap = makePriceMap(filteredData);

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
