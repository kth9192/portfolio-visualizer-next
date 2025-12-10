import { MarketTrending } from "@/app/interface/dto/market";
import PageContainer from "@/components/container/pageContainer";
import { createMarketService } from "@/lib/server/database";
import { subDays } from "date-fns";
import CapSortedTable from "./components/capSortedTable";
import HotCard from "./components/hotCard";
import LowerCard from "./components/lowerCard";
import RaiseCard from "./components/raiseCard";
import UsHeatMap from "./components/usHeatMap";
import MarketTrendTable from "./components/marketTrendTable";
import UsTreeMap from "./components/usTreeMap";

async function MarketInfoPage() {
  const marketService = createMarketService();
  const stockRankings = await marketService.getUsStockRanking();

  console.log("this is log for market page", stockRankings);

  const returnValueInfo: MarketTrending[] = (
    await marketService.getTradingVolumeTrending(
      stockRankings.current.map((item) => item.symbol)
    )
  ).map((item) => ({
    ...item,
    logoUrl: stockRankings.current.find((i) => i.symbol === item.symbol)
      ?.logoUrl,
    shortName: stockRankings.current.find((i) => i.symbol === item.symbol)
      ?.shortName,
  }));

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* 헤더 섹션 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">시장 분석</h1>
          <p className="text-muted-foreground">
            실시간 미국 주식 시장 데이터 및 트렌드 분석
          </p>
        </div>

        {/* 시장 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RaiseCard stockRankings={stockRankings.current} />
          <LowerCard stockRankings={stockRankings.current} />
          <HotCard marketTradingValueTrends={returnValueInfo} />
        </div>

        {/* 시가총액 순위 테이블 */}
        <CapSortedTable stockRankings={stockRankings.current} />

        {/* 거래 트렌드 분석 테이블 */}
        <MarketTrendTable data={returnValueInfo} />
      </div>

      <UsTreeMap
        stockRankings={stockRankings.current}
        yesterdayRankings={stockRankings.yesterday}
      />
    </PageContainer>
  );
}

export default MarketInfoPage;
