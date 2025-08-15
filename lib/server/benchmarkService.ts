import {
  BenchmarkData,
  createBenchmarkData,
} from "@/app/interface/dto/benchmark";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

export class BenchmarkService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getBenchmarkForPeriod(
    symbols: string[],
    startDate: Date,
    endDate: Date
  ): Promise<BenchmarkData[]> {
    try {
      const startYearMonth = format(startDate, "yyyy-MM");
      const endYearMonth = format(endDate, "yyyy-MM");

      const result = await this.prisma.benchmark_data.findMany({
        where: {
          symbol: {
            in: symbols,
          },
            year_month: {
              gte: startYearMonth,
              lte: endYearMonth,
            },
        },
      });


      return result.map((item) =>
        createBenchmarkData({
          symbol: item.symbol,
          year_month: item.year_month,
          monthly_return: Number(item.monthly_return),
          cumulative_value: Number(item.cumulative_value),
          close: Number(item.close),
        })
      );
    } catch (error) {
      console.error("getBenchmarkForPeriod error", error);

      return [];
    }
  }
}
