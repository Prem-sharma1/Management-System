const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing client ABC (AID-0007) task assignments...');

  const clientId = 'AID-0007';

  // 1. Graphic tasks -> Swapnil
  await prisma.clientTask.updateMany({
    where: { clientId, postType: { contains: 'Graphic', mode: 'insensitive' } },
    data: { workingOn: 'Swapnil' }
  });

  // 2. Reel tasks -> Sanmeet
  await prisma.clientTask.updateMany({
    where: { clientId, postType: { contains: 'Reel', mode: 'insensitive' } },
    data: { workingOn: 'Sanmeet' }
  });

  // 3. AI Video tasks -> Divyansh
  await prisma.clientTask.updateMany({
    where: { clientId, postType: { contains: 'AI Video', mode: 'insensitive' } },
    data: { workingOn: 'Divyansh' }
  });

  // 4. Script tasks -> Harshit
  await prisma.clientTask.updateMany({
    where: { clientId, postType: { contains: 'Script', mode: 'insensitive' } },
    data: { workingOn: 'Harshit' }
  });

  // 5. Onboarding / Access / Ads -> Rama
  await prisma.clientTask.updateMany({
    where: {
      clientId,
      OR: [
        { postType: { contains: 'Onboarding', mode: 'insensitive' } },
        { postType: { contains: 'Ads', mode: 'insensitive' } }
      ]
    },
    data: { workingOn: 'Rama' }
  });

  // 6. Reports -> Pujan
  await prisma.clientTask.updateMany({
    where: { clientId, postType: { contains: 'Report', mode: 'insensitive' } },
    data: { workingOn: 'Pujan' }
  });

  // 7. Deliveries update
  await prisma.clientDelivery.updateMany({
    where: { clientId, postType: { contains: 'Graphic', mode: 'insensitive' } },
    data: { workingOn: 'Swapnil' }
  });
  await prisma.clientDelivery.updateMany({
    where: { clientId, postType: { contains: 'Reel', mode: 'insensitive' } },
    data: { workingOn: 'Sanmeet' }
  });
  await prisma.clientDelivery.updateMany({
    where: { clientId, postType: { contains: 'AI Video', mode: 'insensitive' } },
    data: { workingOn: 'Divyansh' }
  });

  console.log('Client ABC (AID-0007) tasks cleanly updated in DB!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
