"use client";


import { riskTypeToKorean } from "@/app/interface/enum/riskType";
import CustomSpinner from "@/components/spinner/customSpinner";
import CustomTag from "@/components/tag/customTag";
import CustomTooltip from "@/components/tooltip/customTooltip";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_PRESETS } from "@/lib/data/portfolioPreset";
import useGetEtfInfos from "@/lib/hooks/query/useGetEtfInfos";
import { ArrowRight } from "lucide-react";
import { useId } from "react";
import { twMerge } from "tailwind-merge";

function PortfolioPresets() {
  const { data: etfInfos, isLoading, isError } = useGetEtfInfos({});
  const loadingKey = useId();

  return (
    <div className="flex flex-col w-full bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        📋 추천 포트폴리오
      </h2>

      <ul>
        {PORTFOLIO_PRESETS.map((preset) => (
          <li
            key={preset.name}
            className="flex items-center justify-between p-2 border-b last:border-b-0 border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className=" font-semibold">{preset.name}</p>
                  <CustomTag
                    content={riskTypeToKorean(preset.riskType)}
                    className={twMerge(
                      "text-white",
                      preset.riskType === "VERY_LOW"
                        ? "bg-blue-500"
                        : preset.riskType === "LOW"
                        ? "bg-cyan-500"
                        : preset.riskType === "MEDIUM"
                        ? "bg-green-500"
                        : preset.riskType === "HIGH"
                        ? "bg-yellow-500"
                        : preset.riskType === "VERY_HIGH"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    )}
                  />
                </div>
                <p className="text-xs text-gray-500">{preset.description}</p>
                <ul className="flex items-center gap-1 text-sm">
                  {preset.assets.map((asset) =>
                    isLoading ? (
                      <CustomSpinner key={`${loadingKey}-${asset.symbol}`} />
                    ) : (
                      <li key={asset.symbol} className="text-gray-400">
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
                    )
                  )}
                </ul>
              </div>
            </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 w-10 h-10 group transition-all duration-200"
                aria-label="포트폴리오 분석 시작"
              >
                <ArrowRight className="size-6 group-hover:translate-x-0.5 transition-transform" />
              </Button>
          
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PortfolioPresets;
