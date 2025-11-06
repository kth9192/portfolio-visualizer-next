"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import HeatMapChart from "@/components/chart/heatMapChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";
import { Grid3x3, Sparkles } from "lucide-react";
import React, { useEffect, useMemo } from "react";

interface UsHeatMapProps {
  stockRankings: MarketRanking[];
  yesterdayRankings: MarketRanking[];
}

function UsHeatMap({ stockRankings, yesterdayRankings }: UsHeatMapProps) {
  const chartData = useMemo(() => {
    const COLUMNS = 5; // 한 행에 5개씩

    const allData = stockRankings
      .map((item) => {
        const prevItem = yesterdayRankings.find(
          (prev) => prev.symbol === item.symbol
        );

        console.log("prevItem", prevItem, stockRankings, yesterdayRankings);

        if (!prevItem) return null;

        const changePercent =
          ((item.regularMarketPrice - prevItem.regularMarketPrice) /
            prevItem.regularMarketPrice) *
          100;

        return {
          symbol: item.symbol,
          shortName: item.shortName,
          change: changePercent,
          currentPrice: item.regularMarketPrice,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.change - a.change); // 상승률 높은 순

    console.log("allData", allData);

    // 5개씩 행으로 나누기
    const series = [];
    for (let i = 0; i < allData.length; i += COLUMNS) {
      const rowData = allData.slice(i, i + COLUMNS).map((item) => ({
        x: item.symbol,
        y: Number(item.change),
        meta: {
          shortName: item.shortName,
          currentPrice: item.currentPrice,
        },
      }));

      series.push({
        name: `Row ${Math.floor(i / COLUMNS) + 1}`,
        data: rowData,
      });
    }

    return series;
  }, [stockRankings, yesterdayRankings]);

  useEffect(() => {
    console.log("chartData", chartData, stockRankings, yesterdayRankings);
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <CardTitle className="text-2xl">미국 시장 대형주 변동</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <HeatMapChart series={chartData} />
      </CardContent>
    </Card>
  );
}

export default UsHeatMap;
