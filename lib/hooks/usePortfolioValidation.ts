import {
  PortfolioCreateDTO,
  PortfolioSettingCreateDTO,
} from "@/app/interface/dto/portfolio";
import { useMemo } from "react";

interface usePortfolioValidationProps {
  portfolio: PortfolioCreateDTO;
  setting: PortfolioSettingCreateDTO;
}

export const usePortfolioValidation = ({
  portfolio,
  setting,
}: usePortfolioValidationProps) => {
  const getTotalWeight = (portfolio: PortfolioCreateDTO) => {
    return portfolio.assets.reduce((acc, asset) => acc + asset.weight, 0);
  };

  const isWeightValid = (portfolio: PortfolioCreateDTO) => {
    return portfolio.assets.every(
      (asset) => asset.weight >= 0 && asset.weight <= 1
    );
  };

  return useMemo(() => {
    const errors: string[] = [];

    if (!setting) {
      errors.push("설정 객체에 문제가 있습니다.");
    }

    if (portfolio.assets.length === 0) {
      errors.push("포트폴리오에 자산이 추가되지 않았습니다.");
    }

    if (portfolio.assets.some((asset) => asset.weight === 0)) {
      errors.push("비중이 0인 자산이 존재합니다.");
    }

    if(portfolio.initialAmount === 0 || !portfolio.initialAmount ){ 
    errors.push("초기자금을 입력해주세요")
    }

    const totalWeight = getTotalWeight(portfolio);
    if (Math.abs(totalWeight - 1) > 0.0001) {
      errors.push(
        `포트폴리오의 비중 합계가 100%이어야 합니다 (현재 ${totalWeight}%)`
      );
    }

    if (!setting.startDate) {
      errors.push("시작일을 선택해주세요.");
    }

    if (!setting.endDate) {
      errors.push("종료일을 선택해주세요.");
    }

    if (setting.startDate && setting.endDate) {
      if (setting.startDate > setting.endDate) {
        errors.push("시작일이 종료일보다 빠릅니다.");
      }
    }

    const tickers = portfolio.assets.map((item) => item.symbol);
    const uniqueTickers = new Set(tickers);
    if (uniqueTickers.size !== tickers.length) {
      errors.push("중복된 ETF가 있습니다");
    }

    if (!isWeightValid(portfolio)) {
      errors.push(
        `각 ETF의 비중은 0~100% 사이여야 합니다 (현재 ${getTotalWeight(
          portfolio
        )}%)`
      );
    }

    return {
      isPortfolioValid: errors.length === 0,
      errors,
      totalWeight,
    };
  }, [portfolio, setting]);
};
