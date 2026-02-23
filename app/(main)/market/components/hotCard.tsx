import { MarketTradingValueTrend } from "@/app/interface/dto/market";
import CustomTooltip from "@/components/tooltip/customTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface HotCardProps {
  marketTradingValueTrends: MarketTradingValueTrend[];
}

function HotCard({ marketTradingValueTrends }: HotCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">HOT 종목</CardTitle>
        <span className="size-4">🔥</span>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <div className="text-2xl font-bold">
          {marketTradingValueTrends
            .sort(
              (pre, post) =>
                post.tradingValueGrowth2Y - pre.tradingValueGrowth2Y,
            )
            .slice(0, 3)
            .map((item, idx) => (
              <CustomTooltip
                key={item.symbol}
                content={<div>{item.shortName}</div>}
                contentClass="bg-black fill-black"
              >
                <div className="">
                  <span>{item.symbol}</span>
                  {idx !== 2 && <span>,</span>}
                </div>
              </CustomTooltip>
            ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          거래대금 증가율 상위 3위
        </p>
      </CardContent>
    </Card>
  );
}

export default HotCard;
