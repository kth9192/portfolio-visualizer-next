enum RebalanceFrequency {

    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMIANNUALLY = "semiannually",
    ANNUALLY = "annually",
  }
  
  const rebalanceFrequencyToKorean = (frequency: RebalanceFrequency) => {
    switch (frequency) {
  
      case RebalanceFrequency.MONTHLY:
        return "월간";
      case RebalanceFrequency.QUARTERLY:
        return "분기별";
      case RebalanceFrequency.SEMIANNUALLY:
        return "반기별";
      case RebalanceFrequency.ANNUALLY:
        return "연간";
    }
  };
  
  const rebalanceOptions = Object.values(RebalanceFrequency).map((frequency) => ({
    value: frequency,
    label: rebalanceFrequencyToKorean(frequency),
  }));
  
  export { RebalanceFrequency, rebalanceFrequencyToKorean,rebalanceOptions };
  