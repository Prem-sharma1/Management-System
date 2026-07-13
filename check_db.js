const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clientCount = await prisma.client.count();
  const deliveryCount = await prisma.clientDelivery.count();
  const taskCount = await prisma.clientTask.count();
  const userCount = await prisma.user.count();
  const planCount = await prisma.plan.count();
  
  console.log('Database Statistics:');
  console.log('- Clients:', clientCount);
  console.log('- ClientDeliveries:', deliveryCount);
  console.log('- ClientTasks:', taskCount);
  console.log('- Users:', userCount);
  console.log('- Plans:', planCount);

  if (clientCount > 0) {
    const sampleClients = await prisma.client.findMany({ take: 5 });
    console.log('Sample Clients:', sampleClients.map(c => ({ id: c.id, clientId: c.clientId, businessName: c.businessName })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
