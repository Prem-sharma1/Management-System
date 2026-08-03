const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing task assignments for Shree Renuka Opticals...');

  const clientName = 'Shree Renuka Opticals';

  // 1. Client Login / Access Collection, Create Accounts, Create Page, Ads Run -> Rama
  await prisma.clientTask.updateMany({
    where: {
      businessName: { contains: clientName, mode: 'insensitive' },
      OR: [
        { taskTitle: { contains: 'Login', mode: 'insensitive' } },
        { taskTitle: { contains: 'Access', mode: 'insensitive' } },
        { taskTitle: { contains: 'Page', mode: 'insensitive' } },
        { taskTitle: { contains: 'Accounts', mode: 'insensitive' } },
        { taskTitle: { contains: 'Ads Run', mode: 'insensitive' } }
      ]
    },
    data: { workingOn: 'Rama' }
  });

  // 2. Weekly Reports -> Preet
  await prisma.clientTask.updateMany({
    where: {
      businessName: { contains: clientName, mode: 'insensitive' },
      postType: { contains: 'Report', mode: 'insensitive' }
    },
    data: { workingOn: 'Preet' }
  });

  // 3. ClientDeliveries update
  await prisma.clientDelivery.updateMany({
    where: {
      clientName: { contains: clientName, mode: 'insensitive' },
      postType: { contains: 'Report', mode: 'insensitive' }
    },
    data: { workingOn: 'Preet' }
  });

  console.log('Shree Renuka Opticals tasks cleanly updated!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
