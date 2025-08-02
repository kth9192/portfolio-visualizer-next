import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useGetPortfolios from "@/lib/hooks/query/useGetPortfolios";
import CustomSpinner from "../spinner/customSpinner";
import { format } from "date-fns";

interface BacktestingViewDialogProps {
  portfolioId: string;
  children: React.ReactNode;
  asChild?: boolean;
}

function BacktestingViewDialog({
  portfolioId,
  children,
  asChild,
}: BacktestingViewDialogProps) {
  const { data: portfolios, isLoading, error } = useGetPortfolios({});

  const currentPortfolio = portfolios?.find(
    (portfolio) => portfolio.id === portfolioId
  );

  if (isLoading) {
    return <CustomSpinner />;
  }

  if (error) {
    return <div>에러 발생</div>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentPortfolio.name}</DialogTitle>
          <div className="flex gap-2 text-xs">
            <div>생성일: {format(currentPortfolio.created, "yyyy-MM-dd")}</div>
            <div>수정일: {format(currentPortfolio.updated, "yyyy-MM-dd")}</div>
          </div>
          <DialogDescription>{currentPortfolio.description}</DialogDescription>
 
        </DialogHeader>

        <div>
          <h2 className="font-medium mb-2">보유 자산</h2>
          <ul>
            {currentPortfolio.assets.map((asset) => (
              <li key={asset.id} className="w-fit text-sm rounded-full px-2 py-1 bg-primary text-white">{asset.symbol}</li>
            ))}
          </ul>
        </div>
        <DialogFooter className="flex justify-end items-center">
          <DialogClose>닫기</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BacktestingViewDialog;
