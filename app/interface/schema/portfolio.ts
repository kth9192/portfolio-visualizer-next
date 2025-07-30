import z from "zod";
import { RebalanceFrequency } from "../enum/rebanalceFrequency";

export const portfolioCreateSchema = z.object({
  name: z.string().min(1, "포트폴리오 이름을 입력해주세요"),
  initialAmount: z.number(),
  description: z.string().optional(),
  user_id: z.string().optional(),
  rebalanceFrequency: z.nativeEnum(RebalanceFrequency),
  assets: z.array(
    z.object({
      symbol: z.string(),
      weight: z.number(),
      shares: z.number(),
    })
  ),
  setting: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    rebalanceFrequency: z.nativeEnum(RebalanceFrequency),
  }),
});

export type PortfolioCreateSchema = z.infer<typeof portfolioCreateSchema>;
