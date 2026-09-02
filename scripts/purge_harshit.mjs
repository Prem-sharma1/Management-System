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
  console.log('=== PURGING HARSHIT COMPLETELY FROM DATABASE ===');

  // Find Admin user for re-assignment
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  const adminId = admin ? admin.id : undefined;

  // Find Harshit user(s)
  const harshitUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Harshit', mode: 'insensitive' } },
        { email: { contains: 'harshit', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${harshitUsers.length} Harshit user(s) in User table.`);
  const harshitIds = harshitUsers.map(u => u.id);

  // 1. Update ClientTasks where workingOn contains 'Harshit'
  const teamList = ['Masoom', 'Nouman', 'Divyansh'];
  const harshitClientTasks = await prisma.clientTask.findMany({
    where: {
      OR: [
        { workingOn: { contains: 'Harshit', mode: 'insensitive' } },
        { assignTo: { contains: 'Harshit', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${harshitClientTasks.length} ClientTasks referencing Harshit.`);
  for (const task of harshitClientTasks) {
    const match = (task.clientId || '').match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 1;
    const fallbackEditor = teamList[Math.abs(num - 1) % teamList.length];

    const newWorkingOn = (task.workingOn && task.workingOn.toLowerCase().includes('harshit')) ? fallbackEditor : task.workingOn;
    const newAssignTo = (task.assignTo && task.assignTo.toLowerCase().includes('harshit')) ? 'AI Video Editor' : task.assignTo;

    await prisma.clientTask.update({
      where: { id: task.id },
      data: {
        workingOn: newWorkingOn,
        assignTo: newAssignTo
      }
    });
  }

  // 2. Update ClientDeliveries where workingOn contains 'Harshit'
  const harshitDeliveries = await prisma.clientDelivery.findMany({
    where: {
      workingOn: { contains: 'Harshit', mode: 'insensitive' }
    }
  });

  console.log(`Found ${harshitDeliveries.length} ClientDeliveries referencing Harshit.`);
  for (const del of harshitDeliveries) {
    const match = (del.clientId || '').match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 1;
    const fallbackEditor = teamList[Math.abs(num - 1) % teamList.length];

    await prisma.clientDelivery.update({
      where: { id: del.id },
      data: { workingOn: fallbackEditor }
    });
  }

  // 3. Update Tasks where assignedToId or createdById is Harshit
  if (harshitIds.length > 0) {
    if (adminId) {
      const updatedTasks = await prisma.task.updateMany({
        where: { assignedToId: { in: harshitIds } },
        data: { assignedToId: adminId }
      });
      console.log(`Reassigned ${updatedTasks.count} Tasks assigned to Harshit to Admin.`);

      const updatedCreatedTasks = await prisma.task.updateMany({
        where: { createdById: { in: harshitIds } },
        data: { createdById: adminId }
      });
      console.log(`Reassigned ${updatedCreatedTasks.count} Tasks created by Harshit to Admin.`);
    } else {
      const deletedTasks = await prisma.task.deleteMany({
        where: {
          OR: [
            { assignedToId: { in: harshitIds } },
            { createdById: { in: harshitIds } }
          ]
        }
      });
      console.log(`Deleted ${deletedTasks.count} Tasks referencing Harshit.`);
    }
  }

  // 4. Update AuditLogs referencing Harshit
  const auditLogs = await prisma.auditLog.updateMany({
    where: {
      performedByName: { contains: 'Harshit', mode: 'insensitive' }
    },
    data: {
      performedByName: admin ? admin.name : 'System Admin'
    }
  });
  console.log(`Updated ${auditLogs.count} AuditLogs referencing Harshit.`);

  // 5. Clean up child foreign key references for Harshit users
  if (harshitIds.length > 0) {
    if (adminId) {
      await prisma.callRecord.updateMany({
        where: { salesPersonId: { in: harshitIds } },
        data: { salesPersonId: adminId }
      });
    } else {
      await prisma.callRecord.deleteMany({
        where: { salesPersonId: { in: harshitIds } }
      });
    }

    if (prisma.leaveRequest) {
      await prisma.leaveRequest.deleteMany({
        where: { userId: { in: harshitIds } }
      });
    }

    if (prisma.attendance) {
      await prisma.attendance.deleteMany({
        where: { userId: { in: harshitIds } }
      });
    }

    // Delete Harshit User(s)
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: harshitIds } }
    });
    console.log(`Deleted ${deletedUsers.count} Harshit user record(s) from database.`);
  }

  // 6. Final verification query
  const remainingUsers = await prisma.user.count({
    where: { name: { contains: 'Harshit', mode: 'insensitive' } }
  });
  const remainingCT = await prisma.clientTask.count({
    where: { workingOn: { contains: 'Harshit', mode: 'insensitive' } }
  });
  const remainingDel = await prisma.clientDelivery.count({
    where: { workingOn: { contains: 'Harshit', mode: 'insensitive' } }
  });

  console.log('\n=== PURGE VERIFICATION SUMMARY ===');
  console.log(`Harshit Users remaining: ${remainingUsers}`);
  console.log(`Harshit ClientTasks remaining: ${remainingCT}`);
  console.log(`Harshit ClientDeliveries remaining: ${remainingDel}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
