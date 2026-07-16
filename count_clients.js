require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const clients = await prisma.client.findMany();
  console.log(`Total clients in database: ${clients.length}`);

  // Grouping by createdAt (DateTime)
  let juneCreated = 0;
  let julyCreated = 0;
  let otherCreated = 0;

  // Grouping by parsed joiningDate (String)
  let juneJoined = 0;
  let julyJoined = 0;
  let otherJoined = 0;

  for (const client of clients) {
    // 1. Check createdAt
    if (client.createdAt) {
      const createdDate = new Date(client.createdAt);
      const year = createdDate.getUTCFullYear();
      const month = createdDate.getUTCMonth(); // 0-indexed: 5 = June, 6 = July
      if (year === 2026 && month === 5) {
        juneCreated++;
      } else if (year === 2026 && month === 6) {
        julyCreated++;
      } else {
        otherCreated++;
      }
    }

    // 2. Check joiningDate string (formats: "DD-MMM-YYYY" like "15-Jun-2026", or "YYYY-MM-DD")
    if (client.joiningDate) {
      const jd = client.joiningDate.toLowerCase();
      if (jd.includes('jun') || jd.includes('-06-') || jd.startsWith('2026-06')) {
        juneJoined++;
      } else if (jd.includes('jul') || jd.includes('-07-') || jd.startsWith('2026-07')) {
        julyJoined++;
      } else {
        otherJoined++;
      }
    }
  }

  console.log(`\n=== CLIENTS COUNT BY CREATION DATE (createdAt - 2026) ===`);
  console.log(`June 2026: ${juneCreated}`);
  console.log(`July 2026: ${julyCreated}`);
  
  console.log(`\n=== CLIENTS COUNT BY JOINING DATE (joiningDate) ===`);
  console.log(`June: ${juneJoined}`);
  console.log(`July: ${julyJoined}`);

  console.log(`\n=== RAW LIST FOR JUNE & JULY CLIENTS ===`);
  clients.forEach(c => {
    const jd = c.joiningDate || '';
    const cd = c.createdAt ? new Date(c.createdAt).toISOString() : 'N/A';
    const isJune = jd.toLowerCase().includes('jun') || jd.includes('-06-') || jd.startsWith('2026-06');
    const isJuly = jd.toLowerCase().includes('jul') || jd.includes('-07-') || jd.startsWith('2026-07');
    if (isJune || isJuly) {
      console.log(`- ID: ${c.clientId} | Name: ${c.businessName} | Joined: "${c.joiningDate}" | Created: ${cd}`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
