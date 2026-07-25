require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== REBALANCING AI VIDEO TASKS COMPANY-BY-COMPANY ===');

  const teamNames = ['Masoom', 'Nouman', 'Divyansh'];

  // Fetch active AI Video Editors from User table
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

  // 1. Fetch all AI Video ClientTasks
  const aiTasks = await prisma.clientTask.findMany({
    where: {
      OR: [
        { assignTo: { contains: 'Ai Video Editor', mode: 'insensitive' } },
        { postType: { contains: 'AI Video', mode: 'insensitive' } },
        { taskTitle: { contains: 'AI Video', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${aiTasks.length} total AI Video ClientTasks.`);

  let updatedTasks = 0;
  for (const task of aiTasks) {
    const match = (task.clientId || '').match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 1;
    const assignedName = teamList[Math.abs(num - 1) % teamList.length];

    if (task.workingOn !== assignedName) {
      await prisma.clientTask.update({
        where: { id: task.id },
        data: { workingOn: assignedName }
      });
      updatedTasks++;
    }
  }
  console.log(`Updated ${updatedTasks} ClientTasks to company-by-company assigned editor.`);

  // 2. Fetch all AI Video ClientDeliveries
  const aiDeliveries = await prisma.clientDelivery.findMany({
    where: {
      postType: { contains: 'AI Video', mode: 'insensitive' }
    }
  });

  console.log(`Found ${aiDeliveries.length} total AI Video ClientDeliveries.`);

  let updatedDeliveries = 0;
  for (const del of aiDeliveries) {
    const match = (del.clientId || '').match(/\d+/);
    const num = match ? parseInt(match[0], 10) : 1;
    const assignedName = teamList[Math.abs(num - 1) % teamList.length];

    if (del.workingOn !== assignedName) {
      await prisma.clientDelivery.update({
        where: { id: del.id },
        data: { workingOn: assignedName }
      });
      updatedDeliveries++;
    }
  }
  console.log(`Updated ${updatedDeliveries} ClientDeliveries to company-by-company assigned editor.`);

  // Print Summary per Editor
  const taskCounts = {};
  for (const name of teamList) {
    const c = await prisma.clientTask.count({ where: { workingOn: name } });
    taskCounts[name] = c;
  }
  console.log('\n=== FINAL TASK COUNT PER EDITOR ===');
  console.log(taskCounts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
