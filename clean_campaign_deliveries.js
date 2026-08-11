require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

let prisma;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log('=== REMOVING CAMPAIGN DELIVERIES DATA ===');

  const deliveryResult = await prisma.clientDelivery.deleteMany({});
  console.log(`Deleted ${deliveryResult.count} records from ClientDelivery table.`);

  const taskResult = await prisma.clientTask.deleteMany({});
  console.log(`Deleted ${taskResult.count} records from ClientTask table.`);

  console.log('Successfully cleared campaign deliveries data.');
}

main()
  .catch((err) => {
    console.error('Error removing campaign deliveries:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
