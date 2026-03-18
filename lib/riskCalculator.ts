export function calcETFRiskReturn(monthlyReturns: number[]) {
  if (monthlyReturns.length < 2)
    return { annualizedReturn: 0, annualizedRisk: 0, weight: 0 };

  //평균 월별 수익률
  const mean =
    monthlyReturns.reduce((acc, val) => acc + val, 0) / monthlyReturns.length;

  // 분산 -> 표준편차 -> 연환산
  const variance =
    monthlyReturns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    monthlyReturns.length;
  const annualizedRisk = Math.sqrt(variance) * Math.sqrt(12) * 100;

  //CAGR
  const totalReturn = monthlyReturns.reduce((acc, val) => acc * (1 + val), 1);
  const years = monthlyReturns.length / 12;
  const annualizedReturn = Math.pow(totalReturn, 1 / years) * 100 - 100;

  return { annualizedReturn, annualizedRisk };
}
