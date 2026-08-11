import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Health check helper to verify real PostgreSQL connectivity
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('PostgreSQL Connection Health Check Failed:', error.message);
    return false;
  }
};

export default prisma;
