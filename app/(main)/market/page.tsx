import PageContainer from "@/components/container/pageContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createMarketService } from "@/lib/server/database";
import { formatWithCommas } from "@/lib/utils";
import NullImage from "@/public/null.png";
import { DollarSign, Triangle } from "lucide-react";
import Image from "next/image";

async function MaketInfoPage() {
  const marketService = createMarketService();
  const stockRankings = await marketService.getUsStockRanking();
  console.log(stockRankings);

  const returnValueInfo = (
    await marketService.getTradingVolumeTrending(
      stockRankings.map((item) => item.symbol)
    )
  ).map((item) => ({
    ...item,
    logoUrl: stockRankings.find((i) => i.symbol === item.symbol)?.logoUrl,
    shortName: stockRankings.find((i) => i.symbol === item.symbol)?.shortName,
  }));

  return (
    <PageContainer>
      <div>
        <h1>시장 분석</h1>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <h2 className="font-bold text-3xl mb-4">미국 시장 시가총액 순위</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순위</TableHead>
              <TableHead>티커</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>거래량</TableHead>
              <TableHead>변동</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockRankings.map((item) => (
              <TableRow key={item.id} className="text-lg">
                <TableCell>
                  <span className="w-10 mr-4 font-bold text-lg text-slate-800">
                    {item.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.logoUrl ? item.logoUrl : NullImage}
                      alt={item.shortName}
                      width={24}
                      height={24}
                      className="rounded-full border border-gray-100"
                    />

                    <span className=" font-medium bg-gray-200 p-1 rounded-sm">
                      {item.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.shortName}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-0.5 mr-4">
                    {item.regualrMarketPrice}
                    <DollarSign className="size-4" />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="mr-4">
                    {formatWithCommas(item.regularMarketVolume)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {item.change > 0 ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <Triangle className="size-4" />
                        {item.change}
                      </span>
                    ) : item.change < 0 ? (
                      <span className="text-red-600">{item.change}</span>
                    ) : (
                      <span>{"-"}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">티커</TableHead>
              <TableHead>거래대금 증가율</TableHead>
              <TableHead>수익률</TableHead>
              <TableHead>수익률 - 시총증가</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnValueInfo.map((item) => (
              <TableRow key={item.symbol} className="text-lg">
                <TableCell>
                  <div className="flex flex-col  w-full">
                    <Image
                      src={item.logoUrl ? item.logoUrl : NullImage}
                      alt={item.shortName}
                      width={24}
                      height={24}
                      className="rounded-full border border-gray-100"
                    />
                    <span>{item.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>{item.tradingValueGrowth2Y}%</TableCell>
                <TableCell>{item.totalReturn2Y}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}

export default MaketInfoPage;
