const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup of Masoom client login & access tasks...');

  const rama = await prisma.user.findFirst({ where: { name: { contains: 'Rama' } } });
  const pujan = await prisma.user.findFirst({ where: { name: { contains: 'Pujan' } } });
  const preet = await prisma.user.findFirst({ where: { name: { contains: 'Preet' } } });
  const masoom = await prisma.user.findFirst({ where: { name: { contains: 'Masoom' } } });

  const smTeam = [
    { name: 'Rama', user: rama },
    { name: 'Pujan', user: pujan },
    { name: 'Preet', user: preet }
  ].filter(m => m.user !== null);

  if (smTeam.length === 0) {
    console.error('Error: None of Rama, Pujan, or Preet found in database.');
    process.exit(1);
  }

  console.log('Available SM Team members:', smTeam.map(m => m.name));

  const accessKeywords = ['login', 'access', 'account', 'page', 'onboarding', 'report', 'ads'];

  // 1. Clean ClientTask records
  const masoomClientTasks = await prisma.clientTask.findMany({
    where: {
      workingOn: { contains: 'Masoom' }
    }
  });

  let ctCount = 0;
  for (let i = 0; i < masoomClientTasks.length; i++) {
    const task = masoomClientTasks[i];
    const taskTitle = ((task.taskTitle || '') + ' ' + (task.postType || '')).toLowerCase();
    
    const isAccessTask = accessKeywords.some(kw => taskTitle.includes(kw));
    if (isAccessTask) {
      const assignedMember = smTeam[i % smTeam.length];
      await prisma.clientTask.update({
        where: { id: task.id },
        data: { workingOn: assignedMember.name }
      });
      ctCount++;
      console.log(`Updated ClientTask ${task.taskCode}: assigned to ${assignedMember.name}`);

      if (task.taskCode && assignedMember.user) {
        const internalTask = await prisma.task.findFirst({
          where: { title: { contains: task.taskCode } }
        });
        if (internalTask) {
          await prisma.task.update({
            where: { id: internalTask.id },
            data: { assignedToId: assignedMember.user.id }
          });
          console.log(`  -> Updated internal Task ${internalTask.id}: assigned to ${assignedMember.name}`);
        }
      }
    }
  }

  // 2. Clean ClientDelivery records
  const masoomDeliveries = await prisma.clientDelivery.findMany({
    where: {
      workingOn: { contains: 'Masoom' }
    }
  });

  let cdCount = 0;
  for (let i = 0; i < masoomDeliveries.length; i++) {
    const del = masoomDeliveries[i];
    const delType = ((del.postType || '') + ' ' + (del.clientName || '')).toLowerCase();
    
    if (accessKeywords.some(kw => delType.includes(kw)) || del.postType === 'Weekly Reports' || del.postType === 'Social Media Exec') {
      const assignedMember = smTeam[i % smTeam.length];
      await prisma.clientDelivery.update({
        where: { id: del.id },
        data: { workingOn: assignedMember.name }
      });
      cdCount++;
      console.log(`Updated ClientDelivery ${del.clientName} (${del.postType}): assigned to ${assignedMember.name}`);
    }
  }

  // 3. Clean internal Task records assigned to Masoom
  if (masoom) {
    const masoomTasks = await prisma.task.findMany({
      where: { assignedToId: masoom.id }
    });

    for (let i = 0; i < masoomTasks.length; i++) {
      const t = masoomTasks[i];
      const titleLower = (t.title || '').toLowerCase();
      if (accessKeywords.some(kw => titleLower.includes(kw))) {
        const assignedMember = smTeam[i % smTeam.length];
        await prisma.task.update({
          where: { id: t.id },
          data: { assignedToId: assignedMember.user.id }
        });
        console.log(`Updated internal Task ${t.title}: reassigned from Masoom to ${assignedMember.name}`);
      }
    }
  }

  console.log(`\nCleanup Complete! Updated ${ctCount} ClientTasks and ${cdCount} ClientDeliveries.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
