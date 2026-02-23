"use client";

import { rebalanceFrequencyToKorean } from "@/app/interface/enum/rebanalceFrequency";
import PageContainer from "@/components/container/pageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useGetPortfolio from "@/lib/hooks/query/useGetPortfolio";
import { formatWithCommas } from "@/lib/utils";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
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

function PortfolioDetailPage() {
  const params = useParams();

  const {
    data: portfolioData,
    isLoading: portfolioLoading,
    isError: portfolioError,
  } = useGetPortfolio({ id: params.id as string });

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

  const getReturnIcon = () => {
    if (returnStatus === "positive") return <TrendingUp className="h-5 w-5" />;
    if (returnStatus === "negative")
      return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getReturnColorClass = () => {
    if (returnStatus === "positive") return "text-green-600";
    if (returnStatus === "negative") return "text-red-600";
    return "text-gray-600";
  };

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
              {getReturnIcon()}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getReturnColorClass()}`}>
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
      </div>
    </PageContainer>
  );
}

export default PortfolioDetailPage;
