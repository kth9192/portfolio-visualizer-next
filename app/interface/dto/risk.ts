export interface ETFRiskReturn {
  symbol: string;
  annualizedReturn: number; // CAGR (%)
  annualizedRisk: number; // 연환산 변동성 (%)
  weight: number; // 포트폴리오 비중 (%)
}
