"use client";

import {
  rebalanceFrequencyToKorean
} from "@/app/interface/enum/rebanalceFrequency";
import DeletePortfolioDialog from "@/components/dialog/deletePortfolioDialog";
import CustomSpinner from "@/components/spinner/customSpinner";
import { Button } from "@/components/ui/button";
import useDeletePortfolio from "@/lib/hooks/mutation/useDeleteProtfolio";
import useGetPortfolios from "@/lib/hooks/query/useGetPortfolios";
import { formatWithCommas } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar,
  CircleOff,
  DollarSign,
  SquarePen,
  Trash,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";

function PortfolioListPage() {
  const { data: portfolios, isLoading, error } = useGetPortfolios({});
  const router = useRouter();

  const { mutate: deletePortfolio, isPending } = useDeletePortfolio();

  const handleCreatePortfolio = () => {
    router.push("/backtesting");
  };

  const handleViewPortfolio = (portfolioId: string) => {
    router.push(`/portfolios/${portfolioId}`);
  };

  const handleEditPortfolio = (portfolioId: string) => {
    router.push(`/backtesting?edit=${portfolioId}`);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    deletePortfolio(portfolioId);
  };

  if (isLoading) {
    return (
      <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <CustomSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">포트폴리오를 불러오는데 실패했습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
          <p className="text-gray-600 mt-1">저장된 포트폴리오를 관리하세요</p>
        </div>
        {portfolios.length > 0 && (
          <Button onClick={handleCreatePortfolio} className="px-6">
            포트폴리오 생성
          </Button>
        )}
      </div>

      {/* 포트폴리오 목록 */}
      {!portfolios || portfolios.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="mx-auto mb-4 bg-gray-400 rounded-lg w-fit p-4">
            <CircleOff className="text-white" />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 포트폴리오가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            첫 번째 포트폴리오를 생성해보세요
          </p>
          <Button onClick={handleCreatePortfolio}>포트폴리오 생성하기</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {portfolio.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {rebalanceFrequencyToKorean(
                        portfolio.setting.rebalanceFrequency
                      )}
                    </span>
                  </div>

                  {portfolio.description && (
                    <p className="text-gray-600 mb-4 max-w-2xl">
                      {portfolio.description}
                    </p>
                  )}

        
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-4" />
                      <span>{formatWithCommas(portfolio.initialAmount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>
                        생성일:{" "}
                        {format(portfolio.created, "yyyy.MM.dd", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SquarePen className="size-4" />
                      <span>
                        수정일:{" "}
                        {format(portfolio.updated, "yyyy.MM.dd", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                  <ul className="flex gap-2 text-sm">
                    {portfolio.assets.map((asset) => (
                      <li key={asset.id} className="text-gray-600">
                        {asset.symbol} ({asset.weight * 100}%)
                      </li>
                    ))}
                  </ul>

                </div>

                <div className="flex gap-2 ml-4">
            
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/backtesting?id=${portfolio.id}`)
                    }
                    className="flex items-center gap-1"
                  >
                    <Zap />
                    수정
                  </Button>

                  <DeletePortfolioDialog
                    portfolioId={portfolio.id}
                    onDelete={() => handleDeletePortfolio(portfolio.id)}
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Trash />
                      삭제
                    </Button>
                  </DeletePortfolioDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {portfolios && portfolios.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
          총 {portfolios.length}개의 포트폴리오
        </div>
      )}
    </section>
  );
}

export default PortfolioListPage;
