'use client';

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo } from "react";

import { differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import CustomSpinner from "@/components/spinner/customSpinner";
import { twMerge } from "tailwind-merge";
import CustomTooltip from "@/components/tooltip/customTooltip";
import useGetEtfInfos from "@/lib/hooks/query/useGetEtfInfos";
import useGetTrends from "@/lib/hooks/query/useGetTrends";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import { DEFAULT_TICKERS } from "@/lib/resource";

function TrendList() {
  const {
    data: etfList,
    isLoading: etfLoading,
    error: etfError,
  } = useGetEtfInfos({});

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useGetTrends({});

  const dataSource = useMemo(() => {

    console.log('trends' , trends);
    
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

  useEffect(() => {
    
    console.log(dataSource , trends)
  }, [ dataSource , trends ])

  const getChangeColor = (changePercent: number) => {
    return changePercent > 0
      ? "text-green-600"
      : changePercent < 0
      ? "text-red-600"
      : "text-gray-600";
  };

  const {
    scrollContainerRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    handleMouseDown,
    checkScrollability,
    scrollTo,
  } = useHorizontalScroll();

  // 데이터 변경 시 스크롤 상태 업데이트
  useEffect(() => {
    checkScrollability();
  }, [dataSource, checkScrollability]);

  return (
    <div className="flex flex-col w-full gap-6 ">
      <h2 className="text-xl font-bold text-gray-900">🔥 시장 현황</h2>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollTo("left")}
          disabled={!canScrollLeft}
          className="h-8 w-8 border border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollTo("right")}
          disabled={!canScrollRight}
          className="h-8 w-8 border border-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide cursor-grab select-none"
        onMouseDown={handleMouseDown}
        onScroll={checkScrollability}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {trendsLoading ? (
          <div className="flex flex-col items-center justify-center w-full gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <CustomSpinner />
          </div>
        ) : trendsError ? (
          <p>{trendsError.message}</p>
        ) : (
          <ol
            className="flex  gap-4  items-stretch"
            onMouseDown={handleMouseDown}
          >
            {dataSource?.map((trend) => (
              <li
                key={trend.symbol}
                className={twMerge(
                  "flex w-[320px] flex-col gap-4 bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0 flex-grow-0",
                  "hover:bg-gray-100 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ease-in-out "
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{trend.symbol}</span>

                  <CustomTooltip
                    content={
                      <div>
                        {
                          etfList?.find((etf) => etf.symbol === trend.symbol)
                            ?.longName
                        }
                      </div>
                    }
                    triggerClass="text-gray-500  text-sm "
                    contentClass="bg-black fill-black"
                  >
                    <span>
                      {
                        etfList?.find((etf) => etf.symbol === trend.symbol)
                          ?.longName
                      }
                    </span>
                  </CustomTooltip>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    <CustomTooltip
                      content={"가장 가까운 미국 시장 마감 후 가격입니다."}
                      contentClass="bg-black fill-black"
                    >
                      <Info className="size-4" />
                    </CustomTooltip>
                    {trend.prices[1]?.adj_close?.toFixed(2)} $
                  </div>
                  {trendsLoading ? (
                    <CustomSpinner className="size-5" />
                  ) : trend?.prices[1].adj_close - trend?.prices[0].adj_close >
                  0 ? (
                    <div
                      className={twMerge(
                        "flex ml-auto gap-2 font-medium text-lg",
                        getChangeColor(
                          trend?.prices[1].adj_close -
                            trend?.prices[0].adj_close
                        )
                      )}
                    >
                      <span>
                        <span>📈</span>
                        {(
                          trend?.prices[1].adj_close -
                          trend?.prices[0].adj_close
                        ).toFixed(2)}
                        $
                      </span>
                    </div>
                  ) : (
                    <div className="flex ml-auto gap-2 text-red-500 font-medium text-lg">
                      <span>
                        <span>📉</span>
                        {(
                          trend?.prices[1].adj_close -
                          trend?.prices[0].adj_close
                        ).toFixed(2)}
                        $
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default TrendList;
