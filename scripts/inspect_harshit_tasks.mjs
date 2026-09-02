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
  console.log('=== INSPECTING HARSHIT TASKS IN DATABASE ===');

  const users = await prisma.user.findMany({
    where: { name: { contains: 'Harshit', mode: 'insensitive' } }
  });

  console.log('Users matching Harshit:', users);

  const clientTasks = await prisma.clientTask.findMany({
    where: {
      OR: [
        { workingOn: { contains: 'Harshit', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`\nFound ${clientTasks.length} ClientTasks where workingOn contains Harshit:`);
  clientTasks.forEach(t => {
    console.log(`[${t.clientId}] ${t.businessName} | Task: ${t.taskTitle} | Date: ${t.date} | AssignTo: ${t.assignTo} | WorkingOn: ${t.workingOn}`);
  });

  // Also check tasks for Sanskruti Pre School (AID-0011 or AID-0007)
  const sanskrutiTasks = await prisma.clientTask.findMany({
    where: { businessName: { contains: 'Sanskruti', mode: 'insensitive' } }
  });
  console.log(`\nFound ${sanskrutiTasks.length} tasks for Sanskruti Pre School:`);
  sanskrutiTasks.forEach(t => {
    console.log(`[${t.clientId}] ${t.businessName} | Task: ${t.taskTitle} | AssignTo: ${t.assignTo} | WorkingOn: ${t.workingOn}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
