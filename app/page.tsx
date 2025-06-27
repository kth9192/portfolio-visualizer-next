"use client";

import Link from "next/link";
import useGetPortfolios from "./lib/hooks/query/useGetPortfolios";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import CustomSpinner from "@/components/spinner/customSpinner";

export default function Home() {
  const { data, isLoading, error } = useGetPortfolios({
    options: {},
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-10 p-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">홈</h1>
      </div>

      {isLoading ? (
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
      ) : data && data.length > 0 ? (
        // 데이터 있을 때
        <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900">포트폴리오 목록</h2>

          <ol className="flex flex-col gap-4">
            {data.map((portfolio) => (
              <li
                key={portfolio.id}
                className="flex justify-between items-center gap-2 border-b border-gray-200 py-4"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/portfolio/${portfolio.id}`}
                    className="underline"
                  >
                    <span className="font-medium">{portfolio.name}</span>
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {portfolio.description ?? "ipsum rorem"}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm">
                    {portfolio.assets?.length}개의 자산
                  </span>
                  <ul className="flex gap-2">
                    {portfolio.assets?.map((asset) => (
                      <li key={asset.id}>{asset.symbol}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-lg text-gray-600 mb-8 mx-auto">
            과거 데이터를 기반으로 포트폴리오 성과를 미리 확인하고, 데이터
            기반의 투자 결정을 내려보세요!
          </p>
          <Button className="w-full mx-auto">포트폴리오 추가하기</Button>
        </div>
      )}
    </section>
  );
}
