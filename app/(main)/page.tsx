import PageContainer from "@/components/container/pageContainer";
import BenchmarkCharts from "./widget/benchmarkCharts";
import PortfolioList from "./widget/portfolioList";
import PortfolioPresets from "./widget/portfolioPresets";
import TitleComponent from "./widget/titleComponent";
import TrendList from "./widget/trendList";

export default function Home() {
  return (
    <PageContainer>
      <TitleComponent />

      <PortfolioList />
      <PortfolioPresets />
      <TrendList />

      <div className="flex flex-col w-full bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900">🎯 벤치마크</h2>
        <BenchmarkCharts />
      </div>
    </PageContainer>
  );
}
