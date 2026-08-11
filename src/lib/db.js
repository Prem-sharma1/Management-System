import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function initPrisma() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = initPrisma();
} else {
  if (!global.globalPrisma) {
    global.globalPrisma = initPrisma();
  }
  prisma = global.globalPrisma;
}

export { prisma };
export default prisma;
