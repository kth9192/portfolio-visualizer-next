"use client";

import { rebalanceFrequencyToKorean } from "@/app/interface/enum/rebanalceFrequency";
import PageContainer from "@/components/container/pageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useGetPortfolio from "@/lib/hooks/query/useGetPortfolio";
import { formatWithCommas } from "@/lib/utils";
import { differenceInYears, format } from "date-fns";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  RefreshCw,
  BarChart3,
  Target,
  Minus,
} from "lucide-react";
import AiAnalyzePanel from "../widget/aiAnalyzePanel";
import BubbleChart from "@/components/chart/bubbleChart";
import { calcETFRiskReturn } from "@/lib/riskCalculator";
import PortfolioMetrics from "../../backtesting/widget/portfolioMetrics";
import { ApexOptions } from "apexcharts";
import { twColor } from "@/lib/resource";
import LineChart from "@/components/chart/lineChart";
import { ko } from "date-fns/locale/ko";
import useGetBacktestingData from "@/lib/hooks/query/useGetBacktestingData";
import { usePortfolioSimulationMonthly } from "@/lib/hooks/usePortfolioSimulationMonthly";
import useGetBacktestingMonthlyData from "@/lib/hooks/query/useGetBacktestingMonthlyData";
import useGetBenchmarkInfos from "@/lib/hooks/query/useGetBenchmarks";
import RiskBubbleCard from "./components/riskBubbleCard";

const getChartOptions = (startDate: Date, endDate: Date): ApexOptions =>
  ({
    chart: {
      height: 400,
      type: "line",
      toolbar: {
        show: true,
      },
    },
    colors: [twColor("red-500"), twColor("blue-600"), twColor("green-500")],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        format:
          differenceInYears(endDate, startDate) >= 2 ? "yy-MM" : "yyyy-MM-dd",
      },
    },
    yaxis: {
      title: {
        text: "누적 수익률 (%)",
      },
      labels: {
        formatter: (value) => `${value.toFixed(2)}%`,
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      x: {
        format: "yyyy-MM",
      },
      custom: function ({ series, dataPointIndex, w }) {
        const date = format(
          new Date(w.globals.seriesX[0][dataPointIndex]),
          "yyyy-MM",
          { locale: ko },
        );

        let tooltipContent = `<div class="p-3 bg-white shadow-lg rounded-lg ">
                      <div class="font-semibold text-gray-800 mb-3 text-center">${date}</div>
                      <div class="space-y-2">
                      `;

        series.forEach((seriesItem: number[], seriesIndex) => {
          const seriesName = w.config.series[seriesIndex].name;
          const seriesValue = seriesItem[dataPointIndex];
          const seriesColor = w.globals.colors[seriesIndex];

          const value =
            typeof seriesValue === "number" ? seriesValue : Number(seriesValue);

          if (!isNaN(value) && value !== null && value !== undefined) {
            tooltipContent += `
                          <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">${seriesName}:</span>
                            <span class="ml-2 font-bold " style="color:${seriesColor}">${value.toFixed(
                              2,
                            )}%</span>
                          </div>
                        `;
          }
        });

        tooltipContent += `</div></div>`;

        return tooltipContent;
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    grid: {
      borderColor: "#e7e7e7",
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
  }) as ApexOptions;

function PortfolioDetailPage() {
  const params = useParams();
  // const {} = calcETFRiskReturn();

  const {
    data: portfolioData,
    isLoading: portfolioLoading,
    isError: portfolioError,
  } = useGetPortfolio({ id: params.id as string });

  const { data: monthlyPortfolioData, refetch: executeMonthlyBacktest } =
    useGetBacktestingMonthlyData({
      req: {
        ticker: portfolioData?.assets.map((asset) => asset.symbol),
        startDate: portfolioData?.setting.startDate,
        endDate: portfolioData?.setting.endDate,
        rebalanceFrequency: portfolioData?.setting.rebalanceFrequency,
      },
      options: {
        enabled: !!portfolioData && !!portfolioData.assets?.length,
      },
    });

  const portfolioSimulationMonthlyData = usePortfolioSimulationMonthly({
    data: monthlyPortfolioData,
    initialAmount: portfolioData?.initialAmount,
    setting: portfolioData?.setting,
    assets: portfolioData?.assets,
  });

  const {
    data: benchmarks,
    // isLoading: benchmarkLoading,
    // error: benchmarkError,
  } = useGetBenchmarkInfos({
    startDate: portfolioData?.setting.startDate ?? new Date(),
    endDate: portfolioData?.setting.endDate ?? new Date(),
  });

  // 시뮬레이션 데이터와 벤치마크 데이터 통합

  const reworkChartSeries = useMemo(() => {
    const portfolioSeries = {
      name: "Portfolio",
      data:
        portfolioSimulationMonthlyData.length === 0
          ? [{ x: 0, y: 0 }]
          : portfolioSimulationMonthlyData.map((item) => ({
              x: new Date(item.yearMonth).getTime(),
              y: item.cumulativeReturnsPercent,
            })),
    };

    if (!benchmarks?.length) return [portfolioSeries];

    const start = new Date(portfolioData?.setting.startDate);
    const end = new Date(portfolioData?.setting.endDate);
    const toYM = (d: Date) => d.getFullYear() * 100 + d.getMonth() + 1;

    const filteredBenchmarks = benchmarks.filter(({ year_month }) => {
      const [y, m] = year_month.split("-").map(Number);
      const ym = y * 100 + m;
      return ym >= toYM(start) && ym <= toYM(end);
    });

    const symbols = [...new Set(filteredBenchmarks.map((b) => b.symbol))];

    const benchmarkSeries = symbols.map((symbol) => {
      const symbolData = filteredBenchmarks
        .filter((b) => b.symbol === symbol)
        .sort((a, b) => a.year_month.localeCompare(b.year_month));

      const baseValue = symbolData[0]?.cumulative_value || 100;

      return {
        name: `${symbol} (벤치마크)`,
        data: symbolData.map((d) => ({
          x: new Date(d.year_month).getTime(),
          y: ((d.cumulative_value - baseValue) / baseValue) * 100,
        })),
      };
    });

    return [portfolioSeries, ...benchmarkSeries];
  }, [benchmarks, portfolioData, portfolioSimulationMonthlyData]);

  // 수익률에 따른 색상 및 아이콘 결정
  const returnStatus = useMemo(() => {
    if (!portfolioData?.metrics?.totalReturn) return "neutral";
    const returnValue = parseFloat(
      portfolioData.metrics.totalReturn.toString(),
    );
    if (returnValue > 0) return "positive";
    if (returnValue < 0) return "negative";
    return "neutral";
  }, [portfolioData]);

  // const getReturnIcon = () => {
  //   if (returnStatus === "positive") return <TrendingUp className="h-5 w-5" />;
  //   if (returnStatus === "negative")
  //     return <TrendingDown className="h-5 w-5" />;
  //   return <Minus className="h-5 w-5" />;
  // };

  // const getReturnColorClass = () => {
  //   if (returnStatus === "positive") return "text-green-600";
  //   if (returnStatus === "negative") return "text-red-600";
  //   return "text-gray-600";
  // };

  const returnDisplay = useMemo(() => {
    const val = portfolioData?.metrics?.totalReturn ?? 0;
    if (val > 0)
      return {
        icon: <TrendingUp className="h-5 w-5" />,
        color: "text-green-600",
      };
    if (val < 0)
      return {
        icon: <TrendingDown className="h-5 w-5" />,
        color: "text-red-600",
      };
    return { icon: <Minus className="h-5 w-5" />, color: "text-gray-600" };
  }, [portfolioData]);

  if (portfolioLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">로딩 중...</div>
        </div>
      </PageContainer>
    );
  }

  if (portfolioError || !portfolioData) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            포트폴리오를 불러오는데 실패했습니다.
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* 헤더 섹션 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {portfolioData.name}
              </h1>
              {portfolioData.description && (
                <p className="text-muted-foreground mt-2">
                  {portfolioData.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              {format(portfolioData.created, "yyyy년 MM월 dd일")} 생성
            </Badge>
          </div>
        </div>

        {/* 핵심 지표 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 총 수익률 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 수익률</CardTitle>
              {returnDisplay.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${returnDisplay.color}`}>
                {portfolioData.metrics.totalReturn.toFixed(3)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                초기 투자금 대비
              </p>
            </CardContent>
          </Card>

          {/* 최종 자산 가치 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">자산 가치</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatWithCommas(portfolioData.metrics.finalAmount)}$
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                초기: {formatWithCommas(portfolioData.initialAmount)}$
              </p>
            </CardContent>
          </Card>

          {/* CAGR */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                연평균 수익률
              </CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioData.metrics.cagr}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">CAGR</p>
            </CardContent>
          </Card>

          {/* 샤프 비율 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">샤프 비율</CardTitle>
              <Activity className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioData.metrics.sharpRatio}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                위험 대비 수익
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 리스크 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MDD */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle className="text-xl">최대 낙폭 (MDD)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {portfolioData.metrics.mdd}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                투자 기간 중 최대 하락률
              </p>
            </CardContent>
          </Card>

          {/* 백테스팅 설정 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                <CardTitle className="text-xl">백테스팅 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">시작일</span>
                  <span className="font-semibold">
                    {format(portfolioData.setting.startDate, "yyyy-MM-dd")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">종료일</span>
                  <span className="font-semibold">
                    {format(portfolioData.setting.endDate, "yyyy-MM-dd")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    리밸런싱 주기
                  </span>
                  <Badge variant="secondary">
                    {rebalanceFrequencyToKorean(
                      portfolioData.setting.rebalanceFrequency,
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">백테스트 차트</CardTitle>
            <Activity className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <LineChart
              options={getChartOptions(
                portfolioData.setting.startDate,
                portfolioData.setting.endDate,
              )}
              series={reworkChartSeries}
              containerClass="w-full h-80"
            />
          </CardContent>
        </Card>

        <RiskBubbleCard
          portfolioData={portfolioData}
          monthlyPortfolioData={monthlyPortfolioData}
        />

        <AiAnalyzePanel portfolio={portfolioData} />
      </div>
    </PageContainer>
  );
}

export default PortfolioDetailPage;
