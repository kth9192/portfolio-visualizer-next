import BenchmarkCharts from "./widget/benchmarkCharts";
import PortfolioList from "./widget/portfolioList";
import PortfolioPresets from "./widget/portfolioPresets";
import TitleComponent from "./widget/titleComponent";
import TrendList from "./widget/trendList";

export default function Home() {
  return (
    <section className="flex flex-col w-full 2xl:w-6/7 gap-10 p-6">
      <TitleComponent />

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
