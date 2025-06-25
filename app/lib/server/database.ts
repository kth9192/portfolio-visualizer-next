// lib/server/database.ts
import { PrismaClient} from '@prisma/client'
import { ETFService } from './etfService';
import { PortfolioService } from '@/app/lib/server/portfolioService';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== 'production') {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient();
}

export { prisma };

export function createETFService() {
  return new ETFService(prisma);
}

export function createPortfolioService() {
  return new PortfolioService(prisma);
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}