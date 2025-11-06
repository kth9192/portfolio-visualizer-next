"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

interface RaiseCardProps {
  stockRankings: MarketRanking[];
}

function RaiseCard({ stockRankings }: RaiseCardProps) {
  const raisedStocks = useMemo(() => {
    return stockRankings.filter((item) => {
      item.change > 0;
    });
  }, [stockRankings]);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">상승 종목</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl  ">
          {raisedStocks.length > 0
            ? raisedStocks.map((item) => (
                <span className="text-green-600 font-bold">
                  {item.shortName}
                </span>
              ))
            : "-"}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          전체 {stockRankings.length}개 중
        </p>
      </CardContent>
    </Card>
  );
}

export default RaiseCard;
