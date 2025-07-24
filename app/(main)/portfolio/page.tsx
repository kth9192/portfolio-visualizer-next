import React from "react";
import useGetPortfolios from "../../lib/hooks/query/useGetPortfolios";

function PortfolioListPage() {
  const { data: portfolios, isLoading, error } = useGetPortfolios({});

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-10 p-6 ">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">홈</h1>
      </div>

      <ol>
        {portfolios?.map((portfolio) => (
          <li className=""></li>
        ))}
      </ol>
    </section>
  );
}

export default PortfolioListPage;
