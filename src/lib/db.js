import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Resolve database path relative to root
const dbPath = path.resolve(process.cwd(), 'dev.db');

let prisma;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.globalPrisma) {
    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    global.globalPrisma = new PrismaClient({ adapter });
  }
  prisma = global.globalPrisma;
}

export { prisma };
export default prisma;
