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
  console.log('=== UPDATING ALL SCRIPT TASKS IN DB ===');

  const teamNames = ['Masoom', 'Nouman', 'Divyansh'];

  const activeEditors = await prisma.user.findMany({
    where: {
      name: { in: teamNames }
    }
  });

  const editorMap = {};
  teamNames.forEach(name => {
    const found = activeEditors.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (found) editorMap[name] = found.name;
  });

  const teamList = teamNames.map(name => editorMap[name] || name);
  console.log('AI Video Editor Team Order:', teamList);

  // 1. Fetch all Script ClientTasks
  const scriptTasks = await prisma.clientTask.findMany({
    where: {
      OR: [
        { postType: { contains: 'Script', mode: 'insensitive' } },
        { taskTitle: { contains: 'Script', mode: 'insensitive' } },
        { assignTo: { contains: 'AI Video Lead', mode: 'insensitive' } },
        { workingOn: { contains: 'Harshit', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${scriptTasks.length} total Script ClientTasks matching criteria.`);

  let updatedCount = 0;
  for (const task of scriptTasks) {
    const match = (task.clientId || '').match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 1;
    const assignedEditor = teamList[Math.abs(num - 1) % teamList.length];

    await prisma.clientTask.update({
      where: { id: task.id },
      data: {
        workingOn: assignedEditor,
        assignTo: 'AI Video Editor'
      }
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} Script tasks!`);

  // Check Peachy Clothing (AID-0067) specifically
  const peachyTasks = await prisma.clientTask.findMany({
    where: { clientId: 'AID-0067' }
  });
  console.log('\n=== PEACHY CLOTHING (AID-0067) TASKS ===');
  peachyTasks.forEach(t => {
    console.log(`Task ID: ${t.taskId} | Title: ${t.taskTitle} | AssignTo: ${t.assignTo} | WorkingOn: ${t.workingOn}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
