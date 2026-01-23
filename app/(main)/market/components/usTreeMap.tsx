"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import TreeMapChart from "@/components/chart/treeMapChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";
import { Sparkles } from "lucide-react";
import React, { useEffect, useMemo } from "react";

interface UsTreeMapProps {
  stockRankings: MarketRanking[];
  yesterdayRankings: MarketRanking[];
}

function UsTreeMap({ stockRankings, yesterdayRankings }: UsTreeMapProps) {
  const chartData = useMemo(() => {
    if (stockRankings.length === 0 || yesterdayRankings.length === 0) {
      console.log("데이터 없음");

      return null;
    }

    const yesterdayMap = new Map(
      yesterdayRankings.map((item) => [item.symbol, item]),
    );

    const data = stockRankings
      .map((item) => {
        const prevItem = yesterdayMap.get(item.symbol);

        if (!prevItem) {
          console.log("prevItem is null");

          return null;
        }

        const changePercent =
          ((item.regularMarketPrice - prevItem.regularMarketPrice) /
            prevItem.regularMarketPrice) *
          100;

        const getColorByChange = (changePercent: number) => {
          if (changePercent > 5) return "#00B248";
          if (changePercent > 2) return "#66BB6A";
          if (changePercent > 0) return "#A5D6A7";
          if (changePercent === 0) return "#9E9E9E";
          if (changePercent < -5) return "#db2a2a";
          if (changePercent < -2) return "#de5454";
          if (changePercent < 0) return "#EF9A9A";

          return "#d40808";
        };

        return {
          x: item.symbol,
          y: Number(item.marketCap) / 100000000,
          fillColor: getColorByChange(changePercent),
          meta: {
            shortName: item.shortName,
            change: changePercent,
            currentPrice: item.regularMarketPrice,
          },
        };
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(b.meta.change) - Math.abs(a.meta.change)); // 상승률 높은 순

    return [{ data }];
  }, [stockRankings, yesterdayRankings]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <CardTitle className="text-2xl">미국 시장 대형주 변동</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <TreeMapChart
          series={chartData}
          options={
            {
              chart: {
                type: "treemap",
              },
              plotOptions: {
                treemap: {
                  distributed: true,
                  enableShades: false,
                },
              },
            } as ApexOptions
          }
        />
      </CardContent>
    </Card>
  );
}

export default UsTreeMap;
