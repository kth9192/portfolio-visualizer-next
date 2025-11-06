"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import React, { useMemo } from "react";

interface LowerCardProps {
  stockRankings: MarketRanking[];
}

function LowerCard({ stockRankings }: LowerCardProps) {
  const loweredStocks = useMemo(() => {
    return stockRankings.filter((item) => {
      item.change < 0;
    });
  }, [stockRankings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">하락 종목</CardTitle>
        <TrendingDown className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl  ">
          {loweredStocks.length > 0
            ? loweredStocks.map((item) => (
                <span className="text-red-600 font-bold">{item.shortName}</span>
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

export default LowerCard;
