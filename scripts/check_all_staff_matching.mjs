import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('No DATABASE_URL found in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, department: true }
  });
  console.log('=== ALL USERS IN DB ===');
  console.table(users);

  const distinctWorkingOn = await prisma.clientTask.groupBy({
    by: ['workingOn'],
    _count: { id: true }
  });
  console.log('\n=== DISTINCT workingOn VALUES IN ClientTask ===');
  console.table(distinctWorkingOn);
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
