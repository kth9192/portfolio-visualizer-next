import z from "zod";
import { RebalanceFrequency } from "../enum/rebanalceFrequency";
import { isAfter } from "date-fns";

export const portfolioCreateSchema = z.object({
  name: z
    .string()
    .min(1, "포트폴리오 이름을 입력해주세요")
    .max(100, "포트폴리오 이름은 100자 이하여야 합니다."),
  initialAmount: z
    .number()
    .min(10000, "초기자금이 없거나 너무 적습니다.")
    .max(1000000000, "초기자금이 너무 많습니다."),
  description: z.string().max(500, "설명은 500자 이하여야 합니다.").optional(),
  assets: z
    .array(
      z.object({
        symbol: z.string(),
        weight: z.number(),
        shares: z.number(),
      })
    )
    .refine(
      (data) => {
        const totalWeight = data.reduce((sum, asset) => sum + asset.weight, 0);
        return Math.abs(totalWeight - 1) < 0.0001; // 부동소수점 오차 고려
      },
      {
        message: "전체 비중의 합이 100%가 되어야 합니다",
        path: [],
      }
    ),
  setting: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      rebalanceFrequency: z.nativeEnum(RebalanceFrequency),
    })
    .refine(
      (data) => {
        return isAfter(data.endDate, data.startDate);
      },
      {
        message: "종료일은 시작일보다 늦어야 합니다",
        path: [],
      }
    ),
    metrics: z.object({
      totalReturn: z.number(),
      cagr: z.number(),
      mdd: z.number(),
      volatility: z.number(),
      sharpRatio: z.number(),
      finalAmount: z.number(),
    }).optional(),
});

export type PortfolioCreateSchemaType = z.infer<typeof portfolioCreateSchema>;


export const portfolioModifySchema = z.object({
  name: z
    .string()
    .min(1, "포트폴리오 이름을 입력해주세요")
    .max(100, "포트폴리오 이름은 100자 이하여야 합니다."),
  description: z.string().max(500, "설명은 500자 이하여야 합니다.").optional(),
})

export type PortfolioModifySchemaType = z.infer<typeof portfolioModifySchema>;