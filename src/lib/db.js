import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma;

function initPrisma() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

  const pool = new pg.Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
    ssl: dbUrl.includes('sslmode=') || dbUrl.includes('prisma.io') ? { rejectUnauthorized: false } : false
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

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
