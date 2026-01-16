"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import CustomTooltip from "@/components/tooltip/customTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import React, { useMemo } from "react";
import CardTicker from "./cardTicker";

interface LowerCardProps {
  stockRankings: MarketRanking[];
}

function LowerCard({ stockRankings }: LowerCardProps) {
  const loweredStocks = useMemo(() => {
    return stockRankings.filter((item) => item.change < 0);
  }, [stockRankings]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between h-full pb-2">
        <CardTitle className="text-sm font-medium">하락 종목</CardTitle>
        <TrendingDown className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div className="flex text-2xl gap-2  ">
          {loweredStocks.length > 0
            ? loweredStocks.map((item) => (
                <CardTicker key={`lower-${item.symbol}`} item={item} />
              ))
            : "-"}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          전체 {loweredStocks.length}개 중
        </p>
      </CardContent>
    </Card>
  );
}

export default LowerCard;
