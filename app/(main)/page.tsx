"use client";

import BenchmarkCharts from "./widget/benchmarkCharts";
import PortfolioList from "./widget/portfolioList";
import PortfolioPresets from "./widget/portfolioPresets";
import TrendList from "./widget/trendList";
import { authClient } from "@/lib/auth-clinet";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <section className="flex flex-col w-full 2xl:w-6/7 gap-10 p-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">
          환영합니다!{" "}
          {session?.user?.name.includes("guest")
            ? "- guest"
            : session?.user?.name}
          님
        </h1>
      </div>

      <PortfolioList />
      <PortfolioPresets />
      <TrendList />

      <div className="flex flex-col w-full bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900">🎯 벤치마크</h2>
        <BenchmarkCharts />
      </div>
    </section>
  );
}
