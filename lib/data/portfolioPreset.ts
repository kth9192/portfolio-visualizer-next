import {
  createPortfolioAssetReqDTO,
  PortfolioPreset
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { RiskType } from "@/app/interface/enum/riskType";

export const INITIAL_AMOUNT = 10000;

export const PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    id: "three-fund", // 3펀드 포트폴리오
    name: "3펀드 포트폴리오",
    description: "미국주식, 해외주식, 채권으로 구성된 전 세계에서 가장 유명한 기본 분산투자 전략",
    riskType: RiskType.MEDIUM,
    rebalanceFrequency: RebalanceFrequency.QUARTERLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "VTI", weight: 0.6, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VXUS", weight: 0.3, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "BND", weight: 0.1, shares: 0 }),
    ],
  },
  {
    id: "all-equity", // 100% 주식형
    name: "100% 주식형",
    description: "젊은 투자자를 위한 최대 성장 추구 포트폴리오",
    riskType: RiskType.VERY_HIGH,
    rebalanceFrequency: RebalanceFrequency.QUARTERLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "VTI", weight: 0.5, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "QQQ", weight: 0.3, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VXUS", weight: 0.2, shares: 0 }),
    ],
  },
  {
    id: "lazy-portfolio", // 게으른 포트폴리오
    name: "게으른 포트폴리오",
    description: "최소한의 관리로 최대 효과를 내는 단순 전략",
    riskType: RiskType.MEDIUM,
    rebalanceFrequency: RebalanceFrequency.QUARTERLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "VTI", weight: 0.5, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "BND", weight: 0.5, shares: 0 }),
    ],
  },
  {
    id: "retirement-safe", // 은퇴자 안전형
    name: "은퇴자 안전형",
    description: "안정적인 소득 창출에 집중한 저위험 포트폴리오",
    riskType: RiskType.VERY_LOW,
    rebalanceFrequency: RebalanceFrequency.SEMIANNUALLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "BND", weight: 0.6, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VTI", weight: 0.25, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VXUS", weight: 0.15, shares: 0 }),
    ],
  },
  {
    id: "bond-focused", // 채권 중심형
    name: "채권 중심형",
    description: "채권 비중을 높인 안정성 중시 포트폴리오",
    riskType: RiskType.LOW,
    rebalanceFrequency: RebalanceFrequency.QUARTERLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "BND", weight: 0.5, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "TLT", weight: 0.2, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "IEF", weight: 0.3, shares: 0 }),
    ],
  },
  {
    id: "growth-focused", // 성장 중심형
    name: "성장 중심형",
    description: "기술주와 성장주에 집중한 공격적 포트폴리오",
    riskType: RiskType.HIGH,
    rebalanceFrequency: RebalanceFrequency.MONTHLY,
    assets: [
      createPortfolioAssetReqDTO({ symbol: "QQQ", weight: 0.4, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VTI", weight: 0.2, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "VXUS", weight: 0.3, shares: 0 }),
      createPortfolioAssetReqDTO({ symbol: "TLT", weight: 0.05, shares: 0 }),
    ],
  },
];