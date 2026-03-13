"use client";

import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { rebalanceFrequencyToKorean } from "@/app/interface/enum/rebanalceFrequency";
import DeletePortfolioDialog from "@/components/dialog/deletePortfolioDialog";
import { Button } from "@/components/ui/button";
import useDeletePortfolio from "@/lib/hooks/mutation/useDeleteProtfolio";
import { cn, formatWithCommas } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  SquarePen,
  Trash,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import AiAnalyzePanel from "./aiAnalyzePanel";

interface PortfolioListItemProps {
  portfolio: PortfolioDTO;
  expendedItemId: string;
  handleAnalyzeOpen: (portfolioId: string) => void;
}

function PortfolioListItem({
  portfolio,
  expendedItemId,
  handleAnalyzeOpen,
}: PortfolioListItemProps) {
  const router = useRouter();

  const [isOpen, setOpen] = useState(false);

  const {
    mutate: deletePortfolio,
    isPending,
    deletingId,
  } = useDeletePortfolio();

  const handleDeletePortfolio = (portfolioId: string) => {
    deletePortfolio(portfolioId);
  };

  const handlePortfolioAnalyze = (portfolioId: string) => {
    handleAnalyzeOpen(portfolioId);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              {portfolio.name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {rebalanceFrequencyToKorean(portfolio.setting.rebalanceFrequency)}
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
            disabled={isPending}
            onClick={() => router.push(`/backtesting?id=${portfolio.id}`)}
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
              disabled={isPending}
              className="flex items-center gap-1"
            >
              <Trash />
              {portfolio.id === deletingId && isPending ? " 삭제중..." : "삭제"}
            </Button>
          </DeletePortfolioDialog>
        </div>
      </div>

      <Collapsible
        open={isOpen}
        onOpenChange={setOpen}
        className="flex flex-col w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePortfolioAnalyze(portfolio.id)}
            className="w-fit mt-1 ml-auto"
          >
            <ChevronDown
              className={cn(
                isOpen ? "rotate-180 " : "rotate-0",
                "transition-all",
              )}
            />
            AI 분석
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AiAnalyzePanel
            portfolio={portfolio}
            extendedItemId={expendedItemId}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default PortfolioListItem;
