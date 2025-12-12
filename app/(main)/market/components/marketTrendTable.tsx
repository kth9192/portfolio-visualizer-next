"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import React from "react";
import Image from "next/image";
import { MarketTrending } from "@/app/interface/dto/market";
import NullImage from "@/public/null.svg";

interface MarketTrendTableProps {
  data: MarketTrending[];
}

function MarketTrendTable({ data }: MarketTrendTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <CardTitle className="text-2xl">거래 트렌드 분석 (2년)</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          거래대금 증가율과 수익률 기반 분석
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-32">티커</TableHead>
                <TableHead className="text-right">거래대금 증가율</TableHead>
                <TableHead className="text-right">총 수익률 (2년간)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.symbol}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-gray-100">
                        <Image
                          src={item.logoUrl || NullImage}
                          alt={item.shortName || item.symbol}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="font-mono w-fit">
                          {item.symbol}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.shortName}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.tradingValueGrowth2Y > 0 ? "default" : "secondary"
                      }
                      className={
                        item.tradingValueGrowth2Y > 0
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {item.tradingValueGrowth2Y > 0 ? "+" : ""}
                      {item.tradingValueGrowth2Y.toFixed(2)}%
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      variant="default"
                      className={
                        item.totalReturn2Y > 0
                          ? "bg-green-100 text-green-700"
                          : item.totalReturn2Y < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {item.totalReturn2Y > 0 ? "+" : ""}
                      {item.totalReturn2Y.toFixed(2)}%
                    </Badge>
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

export default MarketTrendTable;
