import 'dotenv/config';
import fs from 'fs';
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
  const harshitUser = await prisma.user.findFirst({
    where: { email: 'harshit@aidigital.com' }
  });

  if (!harshitUser) {
    console.error('Harshit Gajbhiye user not found');
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminId = admin ? admin.id : harshitUser.id;

  if (fs.existsSync('july_data_dump.json')) {
    const dump = JSON.parse(fs.readFileSync('july_data_dump.json', 'utf8'));
    const clientTasks = dump.clientTasks || [];

    let restoredFromDump = 0;
    for (const ct of clientTasks) {
      if (ct.workingOn === 'Harshit' || ct.workingOn === 'Harshit Gajbhiye') {
        if (ct.postType === 'Script' || (ct.taskTitle && ct.taskTitle.toLowerCase().includes('script')) || ct.assignTo === 'AI Video Lead') {
          continue;
        }

        // Ensure Client exists
        let client = await prisma.client.findUnique({ where: { clientId: ct.clientId } });
        if (!client) {
          client = await prisma.client.create({
            data: {
              clientId: ct.clientId,
              businessName: ct.businessName || ct.clientId,
              clientName: ct.businessName || ct.clientId,
              email: `${ct.clientId.toLowerCase()}@client.com`,
              contact: '0000000000',
              active: true,
              joiningDate: '01/01/2026',
              services: 'Various',
              packageName: 'Standard',
              packageAmount: 1000
            }
          });
        }

        await prisma.clientTask.upsert({
          where: { taskId: ct.taskId },
          update: {
            clientId: ct.clientId,
            businessName: ct.businessName,
            taskTitle: ct.taskTitle,
            date: ct.date,
            assignTo: ct.assignTo,
            workingOn: 'Harshit Gajbhiye',
            status: ct.status,
            postType: ct.postType
          },
          create: {
            taskId: ct.taskId,
            clientId: ct.clientId,
            businessName: ct.businessName,
            taskTitle: ct.taskTitle,
            date: ct.date,
            assignTo: ct.assignTo,
            workingOn: 'Harshit Gajbhiye',
            status: ct.status,
            postType: ct.postType
          }
        });

        // Also add to internal Task table
        const existingTask = await prisma.task.findFirst({
          where: { title: ct.taskTitle, assignedToId: harshitUser.id }
        });
        if (!existingTask) {
          await prisma.task.create({
            data: {
              title: ct.taskTitle,
              description: `Client: ${ct.businessName} | Task ID: ${ct.taskId}`,
              status: ct.status === 'Completed' || ct.status === 'DONE' ? 'DONE' : 'TODO',
              assignedToId: harshitUser.id,
              createdById: adminId,
              dueDate: ct.date || '2026-05-01'
            }
          });
        }

        restoredFromDump++;
      }
    }

    console.log(`Restored ${restoredFromDump} tasks from july_data_dump.json to Harshit Gajbhiye.`);
  }

  const count = await prisma.clientTask.count({
    where: { workingOn: 'Harshit Gajbhiye' }
  });
  const internalCount = await prisma.task.count({
    where: { assignedToId: harshitUser.id }
  });

  console.log(`\n=== FINAL RESTORATION SUMMARY ===`);
  console.log(`User Name: ${harshitUser.name}`);
  console.log(`Email: ${harshitUser.email}`);
  console.log(`Role: ${harshitUser.role}`);
  console.log(`Total ClientTasks assigned in DB: ${count}`);
  console.log(`Total Internal Tasks assigned in DB: ${internalCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
