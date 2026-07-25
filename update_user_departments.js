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
  console.log('=== MIGRATING USER DEPARTMENTS ===');

  const updates = [
    { from: 'Engineering', to: 'Software Development' },
    { from: 'Marketing', to: 'Social Media Marketing' },
    { from: 'Design', to: 'Graphics' }
  ];

  for (const item of updates) {
    const res = await prisma.user.updateMany({
      where: { department: item.from },
      data: { department: item.to }
    });
    console.log(`Updated ${res.count} user(s) from "${item.from}" to "${item.to}".`);
  }

  console.log('User department migration complete.');
}

main()
  .catch((err) => {
    console.error('Error updating departments:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
