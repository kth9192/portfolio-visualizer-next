// lib/server/database.ts
import { prisma } from "@/lib/prisma";
import { ETFService } from "./etfService";
import { PortfolioService } from "@/lib/server/portfolioService";
import { BenchmarkService } from "./benchmarkService";
import { AuthGuestService } from "./authGuestService";
import { MarketService } from "./marketService";

export { prisma };

export function createETFService() {
  return new ETFService();
}

export function createPortfolioService() {
  return new PortfolioService();
}

export function createBenchmarkService() {
  return new BenchmarkService();
}

export function createAuthGuestService() {
  return new AuthGuestService();
}

export function createMarketService() {
  return new MarketService();
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
