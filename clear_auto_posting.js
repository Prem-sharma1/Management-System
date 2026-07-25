require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg'); 

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Count AUTO tasks before
  const before = await prisma.clientTask.count({ where: { workingOn: 'AUTO' } });
  console.log(`Found ${before} tasks with workingOn = "AUTO"`);

  if (before === 0) {
    console.log('Nothing to clean up.');
    return;
  }

  // Update all AUTO tasks to empty string
  const result = await prisma.clientTask.updateMany({
    where: { workingOn: 'AUTO' },
    data: { workingOn: '' }
  });

  console.log(`Successfully cleared ${result.count} tasks (AUTO → unassigned).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
