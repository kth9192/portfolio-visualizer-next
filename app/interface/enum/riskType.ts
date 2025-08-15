enum RiskType {
  VERY_HIGH = "VERY_HIGH",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  VERY_LOW = "VERY_LOW",
}

const riskTypeToKorean = (frequency: RiskType) => {
  switch (frequency) {
    case RiskType.VERY_HIGH:
      return "매우 위험";
    case RiskType.HIGH:
      return "위험";
    case RiskType.MEDIUM:
      return "보통";
    case RiskType.LOW:
      return "안전";
    case RiskType.VERY_LOW:
      return "매우 안전";
  }
};

const riskTypeOptions = Object.values(RiskType).map((risk) => ({
  value: risk,
  label: riskTypeToKorean(risk),
}));

export { RiskType, riskTypeToKorean, riskTypeOptions };
