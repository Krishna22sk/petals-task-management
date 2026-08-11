import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Testing Database URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful!');
    const usersCount = await prisma.user.count();
    console.log(`Users count in DB: ${usersCount}`);
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
