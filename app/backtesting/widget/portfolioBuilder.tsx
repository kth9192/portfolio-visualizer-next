"use client";

import { ETFInfoDTO } from "@/app/interface/dto/etf";
import useGetEtfInfos from "@/app/lib/hooks/query/useGetEtfInfos";
import {
  PortfolioStoreActions,
  PortfolioStoreState,
  usePortfolioStore,
} from "@/app/lib/store/portfolioStore";
import PieChart from "@/components/chart/pieChart";
import CustomSelect from "@/components/select/customSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import React, { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useShallow } from "zustand/react/shallow";

interface PortfolioBuilderProps {}

function PortfolioBuilder({}: PortfolioBuilderProps) {
  const {
    name,
    assets,
    setName,
    setAssets,
    addAsset,
    initialAmount,
    setInitAmount,
  } = usePortfolioStore(
    useShallow((state: PortfolioStoreState & PortfolioStoreActions) => ({
      name: state.name,
      assets: state.assets,
      setName: state.setName,
      setAssets: state.setAssets,
      addAsset: state.addAsset,
      initialAmount: state.initialAmount,
      setInitAmount: state.setInitAmount,
    }))
  );

  const {
    data: etfList,
    isLoading,
    isError,
  } = useGetEtfInfos({
    optios: {},
  });

  const ratioData = useMemo(() => {
    const result = assets.map((asset) => ({
      label: asset.symbol,
      value: asset.weight * 100,
    }));
    return result;
  }, [assets]);

  const totalWeight = useMemo(() => {
    const result = assets.reduce((acc, asset) => acc + asset.weight, 0);
    return result;
  }, [assets]);

  function handleETFSelect(value: string): void {
    const searchedETF = etfList?.find((asset) => asset.symbol === value);
    searchedETF &&
      addAsset({
        symbol: searchedETF.symbol,
        weight: 0,
        shares: 0,
      });
  }

  const updateWeight = (symbol: string, weight: number) => {
    setAssets(
      assets.map((asset) =>
        asset.symbol === symbol ? { ...asset, weight: weight / 100 } : asset
      )
    );
  };

  const removeAsset = (symbol: string) => {
    setAssets(assets.filter((asset) => asset.symbol !== symbol));
  };

  const resetWeights = () => {
    setAssets(assets.map((asset) => ({ ...asset, weight: 0 })));
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ol className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-3">포트폴리오 구성</h3>

          <li className="info-row">
            <label
              htmlFor="portfolioName"
              className="text-gray-700 text-sm font-medium"
            >
              포트폴리오 이름
            </label>
            <Input
              type="text"
              id="portfolioName"
              name="portfolioName"
              placeholder="포트폴리오의 제목을 입력하세요"
              className="border border-gray-300 px-2 py-1 rounded w-1/2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </li>
          <li className="info-row">
            <label
              htmlFor="initialAmount"
              className="text-gray-700 text-sm font-medium"
            >
              시작 금액($)
            </label>
            <Input
              id="initialAmount"
              type="number"
              placeholder="포트폴리오의 시작 금액(달러)을 입력하세요"
              className="border border-gray-300 px-2 py-1 rounded w-1/2"
              value={initialAmount}
              onChange={(e) => setInitAmount(Number(e.target.value))}
            />
          </li>
        </ol>

        <div className="info-row">
          <span className="text-sm font-medium text-gray-700">ETF 선택</span>
          {isLoading ? (
            <div>loading...</div>
          ) : isError ? (
            <div>error</div>
          ) : (
            <CustomSelect
              items={etfList
                ?.filter(
                  (etf) => !assets.some((asset) => asset.symbol === etf.symbol)
                )
                ?.map((etf) => ({
                  value: etf.symbol,
                  label: `${etf.symbol} - ${etf.shortName}`,
                }))}
              triggerClass="w-1/2 "
              mode="single"
              placeholder="ETF를 선택하세요"
              onSelect={(value) => handleETFSelect(value)}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 ">
          <div className="flex justify-between">
            <div className="flex flex-row justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">
                선택된 ETF ({assets.length}개)
              </h4>
            </div>
            <div className="flex flex-row  items-center gap-2 text-sm text-gray-700">
              <div className="space-x-2">
                <span>총 비중:</span>
                <span
                  className={twMerge(
                    "font-semibold",

                    Math.abs(totalWeight * 100 - 100) < 0.0001
                      ? "text-green-500"
                      : "text-red-500"
                  )}
                >
                  {totalWeight * 100}%
                </span>
              </div>
              {assets.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={resetWeights}
                    variant="outline"
                    className="text-sm hover:bg-blue-600 hover:text-white"
                  >
                    비중 초기화
                  </Button>
                </div>
              )}
            </div>
          </div>

          <ul className="space-y-2 max-h-64 overflow-y-auto py-1">
            {assets.map((asset) => (
              <li
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-500"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{asset.symbol}</span>
                  <span className="text-sm text-gray-600">
                    {
                      etfList?.find((info) => info.symbol === asset.symbol)
                        ?.longName
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={asset.weight * 100}
                    onInput={(e) =>
                      e?.currentTarget.value &&
                      updateWeight(
                        asset.symbol,
                        Number(e?.currentTarget?.value)
                      )
                    }
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <Button
                    onClick={() => removeAsset(asset.symbol)}
                    variant="destructive"
                    title="제거"
                  >
                    X
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {assets.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p>ETF를 선택해서 포트폴리오를 구성해보세요</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-lg text-gray-700  mb-3 ">
          포트폴리오 비중
        </h4>
        {assets.length > 0 && ratioData.some((item) => item.value > 0) ? (
          <div className="flex-1 min-h-0 h-40">
            <PieChart
              series={ratioData.map((item) => item.value)}
              containerClass="h-80"
              options={{
                chart: { type: "pie", height: "100%", toolbar: { show: true } },
                dataLabels: {
                  enabled: true,
                  formatter: function (val: number) {
                    return val.toFixed(1) + "%";
                  },
                },
                labels: ratioData.map((item) => item.label),
                legend: { show: true },
                theme: { mode: "light" },
                tooltip: {
                  enabled: true,
                  custom: function ({
                    series,
                    seriesIndex,
                    dataPointIndex,
                    w,
                  }) {
                    const ticker = w.config.labels[seriesIndex];
                    return `<div class="p-3 shadow-lg rounded-lg ">
                                            <div class="font-semibold text-gray-800">${ticker}</div>
                                            <div class="flex items-center mt-1">
                                              <span class="font-medium text-gray-600">비중 : </span>
                                              <span class="ml-1 font-bold text-blue-600">${series}%</span>
                                            </div>
                                          </div>`;
                  },
                },
                colors: [
                  "#008FFB",
                  "#00E396",
                  "#FEB019",
                  "#FF4560",
                  "#775DD0",
                  "#3F51B5",
                  "#546E7A",
                  "#D4526E",
                  "#8D5B4C",
                  "#F86624",
                ],
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-80 py-8">
            <p className="text-gray-500">비중을 설정하면 차트가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioBuilder;
