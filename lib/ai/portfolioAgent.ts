import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { getGeminiClient, GEMINI_MODEL } from "./gemini";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";

export interface PortfolioAnalysisInput {
  assets: {
    symbol: string;
    weight: number;
  }[];

  metrics: {
    cagr: number;
    mdd: number;
    volatility: number;
    sharpRatio: number;
    finalAmount: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  rebalanceFrequency: RebalanceFrequency;
}

export const createPortfolioAnalysisInput = (
  input: PortfolioDTO,
): PortfolioAnalysisInput => ({
  assets: input.assets.map((asset) => ({
    symbol: asset.symbol,
    weight: asset.weight,
  })),

  period: {
    startDate: input.setting.startDate,
    endDate: input.setting.endDate,
  },

  rebalanceFrequency: input.setting.rebalanceFrequency,

  metrics: input.metrics,
});

export interface AgentMessage {
  role: "user" | "model";
  content: string;
}

const SYSTEM_PROMPT = `당신은 금융회사에서 금융 전문가로 고객의 포트폴리오 분석을 담당하고 있는 AI입니다.
고객의 백테스팅 결과를 분석하고 투자 인사이트를 제공해야 합니다.

규칙:
- 투자 권유가 아닌 정보 제공 목적임을 항상 명시
- CAGR, MDD, 샤프비율 등 금융지표를 쉽게 설명 할 것
- 포트폴리오 개선 방향을 구체적으로 제시할 것
- 한국어로 답변할 것
- 답변은 명확하고 간결하게 유지할 것`;

//단순 분석(스트리밍 없음)
export async function analyzePortfolio(
  input: PortfolioAnalysisInput,
): Promise<string> {
  const prompt = buildAnalysisPrompt(input);
  const gemini = await getGeminiClient();

  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return response.text ?? "분석 결과를 가져오는데 실패했습니다.";
}

//스트리밍 분석
export async function* analyzePortfolioStream(input: PortfolioAnalysisInput) {
  const prompt = buildAnalysisPrompt(input);
  const gemini = await getGeminiClient();

  const stream = await gemini.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) yield text;
  }
}

//멀티턴 채팅(히스토리 유지)
export async function chatWithAgent(
  messages: AgentMessage[],
  portfolioContext?: PortfolioAnalysisInput,
): Promise<string> {
  const gemini = await getGeminiClient();

  const contextPrefix = portfolioContext
    ? `[현재 포트폴리오 컨텍스트]\n${buildAnalysisPrompt(portfolioContext)}\n\n`
    : "";

  const contents = messages.map((msg) => ({
    role: msg.role,
    parts: [
      {
        text:
          msg.role === "user" && messages.indexOf(msg) === 0
            ? contextPrefix + msg.content
            : msg.content,
      },
    ],
  }));

  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  return response.text ?? "분석 결과를 가져오는데 실패했습니다.";
}

function buildAnalysisPrompt(input: PortfolioAnalysisInput): string {
  const assetsList = input.assets
    .map((asset) => `- ${asset.symbol} (${asset.weight}%)`)
    .join("\n");

  return `
  다음 포트폴리오 백테스팅 결과를 분석해주세요.

[포트폴리오 구성]
${assetsList}

[분석 기간]
${input.period.startDate} ~ ${input.period.endDate}
리밸런싱 : ${input.rebalanceFrequency}

[성과 지표]
CAGR(연평균 수익률) : ${(input.metrics.cagr * 100).toFixed(2)}%
MDD(최대 낙폭) : ${(input.metrics.mdd * 100).toFixed(2)}
연간 변동성 : ${(input.metrics.volatility * 100).toFixed(2)}
샤프 비율 : ${(input.metrics.sharpRatio * 100).toFixed(2)}
총 수익률 : ${(input.metrics.finalAmount * 100).toFixed(2)}

위 결과에 대해:
1. 전반적인 포트폴리오 성과 평가
2. 리스크 대비 수익률 분석
3. 개선 방향 제안
을 제공해주세요.
  `.trim();
}
