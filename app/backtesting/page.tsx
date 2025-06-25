'use client';

import React from "react";
import PortfolioBuilder from "./widget/portfolioBuilder";
import PortfolioSetting from "./widget/portfolioSetting";
import { Button } from "@/components/ui/button";
import { usePortfolioValidation } from "../lib/hooks/usePortfolioValidationt";
import { usePortfolioStore } from "../lib/store/portfolioStore";
import { createPortfolioCreateDTO } from "../interface/dto/portfolio";
import { RebalanceFrequency } from "../interface/enum/rebanalceFrequency";

function BacktestingPage() {
  const { assets, setting } = usePortfolioStore();

  const { isPortfolioValid, errors, totalWeight } = usePortfolioValidation({
    portfolio: createPortfolioCreateDTO({
      name: "",
      initAmount: 0,
      rebalanceFrequency: RebalanceFrequency.MONTHLY,
      assets,
      setting,
    }),
    setting,
  });

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-10 p-6 ">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 ">
          ETF 포트폴리오 백테스팅
        </h1>
        <p className="text-gray-600">
          포트폴리오를 구성하고 과거 성과를 분석해보세요
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <PortfolioBuilder />
        <div className="grid grid-cols-[1fr_2fr] gap-6">
          <PortfolioSetting />
          <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold ">검증 상태</h4>
            <ul className="flex flex-col gap-2">
              {errors.map((error, index) => (
                <li key={index} className="text-destructive text-sm">
                  {error}
                </li>
              ))}
            </ul>
            <Button className="w-full" disabled={!isPortfolioValid}>
              백테스트 실행
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BacktestingPage;
