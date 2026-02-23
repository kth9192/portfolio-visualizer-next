"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import CustomTooltip from "@/components/tooltip/customTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import CardTicker from "./cardTicker";

interface RaiseCardProps {
  stockRankings: MarketRanking[];
}

function RaiseCard({ stockRankings }: RaiseCardProps) {
  const raisedStocks = useMemo(() => {
    return stockRankings.filter((item) => item.change > 0);
  }, [stockRankings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">상승 종목</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex flex-wrap gap-2 ">
          {raisedStocks.length > 0
            ? raisedStocks.map((item) => (
                <CardTicker key={`raised-${item.symbol}`} item={item} />
              ))
            : "-"}
        </div>
        <p className="text-xs text-muted-foreground mt-auto">
          전체 {raisedStocks.length}개 중
        </p>
      </CardContent>
    </Card>
  );
}

export default RaiseCard;
