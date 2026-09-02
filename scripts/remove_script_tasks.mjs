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
  console.log('=== REMOVING ALL STANDALONE SCRIPT TASKS FROM DATABASE ===');

  const scriptTasks = await prisma.clientTask.findMany({
    where: {
      OR: [
        { postType: { equals: 'Script', mode: 'insensitive' } },
        { taskTitle: { contains: 'Script', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${scriptTasks.length} standalone Script ClientTasks.`);

  const deleted = await prisma.clientTask.deleteMany({
    where: {
      OR: [
        { postType: { equals: 'Script', mode: 'insensitive' } },
        { taskTitle: { contains: 'Script', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Deleted ${deleted.count} Script ClientTasks from database.`);

  // Check Peachy Clothing (AID-0067) tasks
  const peachyTasks = await prisma.clientTask.findMany({
    where: { clientId: 'AID-0067' }
  });
  console.log('\n=== REMAINING PEACHY CLOTHING (AID-0067) TASKS ===');
  peachyTasks.forEach(t => {
    console.log(`Task ID: ${t.taskId} | Title: ${t.taskTitle} | PostType: ${t.postType} | AssignTo: ${t.assignTo} | WorkingOn: ${t.workingOn}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
