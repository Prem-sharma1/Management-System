const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log('\n=== TODAY STRING (ISO) ===');
  console.log('todayStr:', todayStr);

  // Sample ClientTask dates
  const sampleTasks = await prisma.clientTask.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log('\n=== SAMPLE ClientTask dates ===');
  sampleTasks.forEach(t => {
    console.log(`  date: "${t.date}" | assignTo: "${t.assignTo}" | status: "${t.status}" | matches today: ${t.date && t.date.slice(0,10) === todayStr}`);
  });

  // Sample ClientDelivery postDates
  const sampleDeliveries = await prisma.clientDelivery.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log('\n=== SAMPLE ClientDelivery postDates ===');
  sampleDeliveries.forEach(d => {
    console.log(`  postDate: "${d.postDate}" | workingOn: "${d.workingOn}" | status: "${d.status}" | matches today: ${d.postDate && d.postDate.slice(0,10) === todayStr}`);
  });

  // Count today matches
  const allTasks = await prisma.clientTask.findMany();
  const allDeliveries = await prisma.clientDelivery.findMany();

  const todayTasks = allTasks.filter(t => t.date && t.date.slice(0, 10) === todayStr);
  const todayDeliveries = allDeliveries.filter(d => d.postDate && d.postDate.slice(0, 10) === todayStr);

  console.log('\n=== TODAY COUNT ===');
  console.log('ClientTasks today:', todayTasks.length);
  console.log('ClientDeliveries today:', todayDeliveries.length);

  if (todayTasks.length > 0) {
    console.log('\n--- Today ClientTasks ---');
    todayTasks.forEach(t => console.log(`  [${t.assignTo}] "${t.taskTitle}" | ${t.status}`));
  }
  if (todayDeliveries.length > 0) {
    console.log('\n--- Today ClientDeliveries ---');
    todayDeliveries.forEach(d => console.log(`  [${d.workingOn}] ${d.postType} | ${d.status} | postDate: ${d.postDate}`));
  }

  // All unique date values in ClientTask
  const allDates = [...new Set(allTasks.map(t => t.date ? t.date.slice(0, 10) : 'null'))].sort().slice(-10);
  console.log('\n=== Recent ClientTask dates in DB ===');
  console.log(allDates);

  const allPostDates = [...new Set(allDeliveries.map(d => d.postDate ? d.postDate.slice(0, 10) : 'null'))].sort().slice(-10);
  console.log('\n=== Recent ClientDelivery postDates in DB ===');
  console.log(allPostDates);
}

main().catch(console.error).finally(() => prisma.$disconnect());
