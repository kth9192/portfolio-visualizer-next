"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { formatWithCommas } from "@/lib/utils";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import NullImage from "@/public/null.svg";

interface CapSortedTableProps {
  stockRankings: MarketRanking[];
}

function CapSortedTable({ stockRankings }: CapSortedTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <CardTitle className="text-2xl">미국 시장 시가총액 순위</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">순위</TableHead>
                <TableHead className="w-32">티커</TableHead>
                <TableHead>종목명</TableHead>
                <TableHead className="text-right">현재가</TableHead>
                <TableHead className="text-right">거래량</TableHead>
                <TableHead className="text-right w-28">변동</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockRankings.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <Badge
                      variant={"secondary"}
                      className="w-8 h-8 flex items-center justify-center font-bold"
                    >
                      {item.rank}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-gray-100">
                        <Image
                          src={item.logoUrl || NullImage}
                          alt={item.shortName}
                          fill
                          className="object-cover"
                          sizes="100%"
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono font-semibold"
                      >
                        {item.symbol}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {item.shortName}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 font-semibold">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {item.regularMarketPrice.toLocaleString()}
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono text-sm">
                    {formatWithCommas(item.regularMarketVolume)}
                  </TableCell>

                  <TableCell className="text-right">
                    {item.change > 0 ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />+
                        {item.change.toFixed(2)}%
                      </Badge>
                    ) : item.change < 0 ? (
                      <Badge
                        variant="default"
                        className="bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {item.change.toFixed(2)}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100">
                        <Minus className="h-3 w-3 mr-1" />
                        0.00%
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default CapSortedTable;
