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
  console.log('=== SETTING HARSHIT GAJBHIYE TO SOCIAL MEDIA EXECUTIVE ===');

  const updatedUser = await prisma.user.updateMany({
    where: {
      OR: [
        { email: 'harshit@aidigital.com' },
        { name: { contains: 'Harshit', mode: 'insensitive' } }
      ]
    },
    data: {
      department: 'Social Media Executive',
      designation: 'Social Media Executive',
      role: 'EMPLOYEE'
    }
  });

  console.log(`Updated ${updatedUser.count} user record(s).`);

  const harshit = await prisma.user.findFirst({
    where: { email: 'harshit@aidigital.com' }
  });

  console.log('Updated Harshit User Record:', harshit);
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
