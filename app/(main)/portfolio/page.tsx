"use client";

import {
  RebalanceFrequency,
  rebalanceFrequencyToKorean,
} from "@/app/interface/enum/rebanalceFrequency";
import { Button } from "@/components/ui/button";
import useGetPortfolios from "@/lib/hooks/query/useGetPortfolios";
import { useRouter } from "next/navigation";
import React from "react";

function PortfolioListPage() {
  const { data: portfolios, isLoading, error } = useGetPortfolios({});
  const router = useRouter();

  const handleCreatePortfolio = () => {
    router.push("/backtesting");
  };

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-10 p-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">포트폴리오 목록</h1>
        <Button className="w-50" onClick={handleCreatePortfolio}>
          포트폴리오 생성
        </Button>
      </div>

      <ol className="flex flex-col gap-2">
        {portfolios?.map((portfolio) => (
          <li
            className="flex justify-between items-center rounded-lg shadow-md p-4"
            key={portfolio.id}
          >
            <div className="flex flex-col ">
              <span className="font-bold text-xl mb-4">{portfolio.name}</span>
              <span className="text-gray-500 mb-1">{portfolio.description}</span>
              <span className="w-fit bg-gray-900 text-xs text-white px-2 py-1 rounded">
                {rebalanceFrequencyToKorean(
                  portfolio.setting.rebalanceFrequency
                )}
              </span>
            </div>
          
          </li>
        ))}
      </ol>
    </section>
  );
}

export default PortfolioListPage;
