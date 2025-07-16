"use client";

import { Button } from "@/components/ui/button";
import React, { useMemo } from "react";
import { formatWithCommas } from "../lib/utils";
import { PortfolioDTO } from "../interface/dto/portfolio";
import useGetTrends from "../lib/hooks/query/useGetTrends";
import { DEFAULT_TICKERS } from "../lib/resource";
import { differenceInDays } from "date-fns";
import CustomSpinner from "@/components/spinner/customSpinner";
import Link from "next/link";
import useGetPortfolios from "../lib/hooks/query/useGetPortfolios";
import CustomTooltip from "@/components/tooltip/customTooltip";
import useGetEtfInfos from "../lib/hooks/query/useGetEtfInfos";

function PortfolioList() {
  const {
    data: portfolios,
    isLoading,
    error,
  } = useGetPortfolios({
    options: {},
  });

  const {
    data: etfInfos,
    isLoading: etfInfosLoading,
    error: etfInfosError,
  } = useGetEtfInfos({});

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useGetTrends({});

  const dataSource = useMemo(() => {
    return DEFAULT_TICKERS.map((ticker) => {
      return {
        symbol: ticker,
        prices:
          trends
            ?.filter((item) => item.symbol === ticker)
            .sort((pre, post) => differenceInDays(post.date, pre.date)) ?? [],
      };
    });
  }, [trends]);

  const getCurrentAmount = (portfolio: PortfolioDTO) => {
    return formatWithCommas(
      portfolio.assets
        .reduce((acc, asset) => {
          return (
            acc +
            asset.shares *
              (trends?.find((item) => item.symbol === asset.symbol)
                ?.adj_close ?? 0)
          );
        }, 0)
        .toFixed(2)
    );
  };

  return isLoading ? (
    <div className="flex flex-col items-center justify-center w-full gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <CustomSpinner />
    </div>
  ) : error ? (
    <div className="flex flex-col items-center justify-center w-full gap-4 bg-white rounded-lg shadow-sm border border-red-200 p-12">
      <div className="text-red-500 text-center">
        <h3 className="text-lg font-semibold mb-2">
          데이터를 불러올 수 없습니다
        </h3>
        <p className="text-sm text-gray-600">
          {error?.message ||
            "포트폴리오 데이터를 가져오는 중 오류가 발생했습니다."}
        </p>
      </div>
    </div>
  ) : portfolios && portfolios.length > 0 ? (
    // 데이터 있을 때
    <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-xl font-bold text-gray-900">포트폴리오 목록</h2>

      <ol className="flex flex-col gap-4">
        {portfolios.map((portfolio) => (
          <li
            key={portfolio.id}
            className="flex justify-between items-center gap-2 border-y first:border-t-0  last:border-b-0 border-gray-200 py-2"
          >
            <div className="flex flex-col">
              <Link
                href={`/portfolio/${portfolio.id}`}
                className="underline text-lg font-semibold"
              >
                <span className="font-medium">{portfolio.name}</span>
              </Link>
              <span className="text-gray-500 text-sm">
                {portfolio.description || "ipsum rorem"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="font-medium">{getCurrentAmount(portfolio)} $</div>

              <span className="text-sm">
                {portfolio.assets?.length}개의 자산
              </span>
              <ul className="flex gap-2 text-gray-400 text-sm">
                {portfolio.assets?.map((asset) => (
                  <li key={asset.id}>
                    <CustomTooltip
                      contentClass="bg-black text-white p-2 rounded-md"
                      content={
                        <div className="flex flex-col gap-2">
                          <div>{asset.symbol}</div>
                          <div>
                            {
                              etfInfos?.find(
                                (item) => item.symbol === asset.symbol
                              )?.longName
                            }
                          </div>
                          <div>
                            {etfInfos
                              ?.find((item) => item.symbol === asset.symbol)
                              ?.holdings?.map((holding) => holding.name)}
                          </div>
                          <div>
                            {etfInfos
                              ?.find((item) => item.symbol === asset.symbol)
                              ?.sectors?.map((sector) => sector.sectorName)}
                          </div>
                        </div>
                      }
                    >
                      [ {asset.symbol} ]
                    </CustomTooltip>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  ) : (
    <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <p className="text-lg text-gray-600 mb-8 mx-auto">
        과거 데이터를 기반으로 포트폴리오 성과를 미리 확인하고, 데이터 기반의
        투자 결정을 내려보세요!
      </p>
      <Button className="w-full mx-auto">포트폴리오 추가하기</Button>
    </div>
  );
}

export default PortfolioList;
