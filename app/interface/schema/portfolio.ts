import z from "zod";
import { RebalanceFrequency } from "../enum/rebanalceFrequency";


export const portfolioCreateSchema = z.object({
  name: z.string(),
  initAmount: z.number(),
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
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export type PortfolioCreateSchema = z.infer<typeof portfolioCreateSchema>;
