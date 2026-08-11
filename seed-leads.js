const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find a sales user
  let salesUser = await prisma.user.findFirst({
    where: { role: 'SALES' }
  });

  if (!salesUser) {
    salesUser = await prisma.user.findFirst();
  }

  if (!salesUser) {
    console.error('No users found in the database. Cannot seed leads.');
    return;
  }

  console.log(`Seeding leads for user: ${salesUser.name} (ID: ${salesUser.id})`);

  const dummyLeads = [
    {
      clientName: 'Saidur Rahman',
      phoneNumber: '+91-9798164634',
      status: 'INTERESTED',
      notes: '[Campaign: Facebook Campaign] Interested in the new package.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-08T11:20:00Z')
    },
    {
      clientName: 'Gora Ranger Pura Velpura',
      phoneNumber: '+91-9316770306',
      status: 'PENDING',
      notes: '[Campaign: Facebook Campaign] Needs a follow-up.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-08T11:20:00Z')
    },
    {
      clientName: 'Ke Sh Av',
      phoneNumber: '+91-9926600904',
      status: 'CALLBACK',
      notes: '[Campaign: Facebook Campaign] Asked to call back later.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-08T11:06:00Z')
    },
    {
      clientName: 'Elena Gilbert',
      phoneNumber: '+1-555-019-2831',
      status: 'ANSWERED',
      notes: '[Campaign: LinkedIn Campaign] Discussed annual plans.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-09T09:15:00Z')
    },
    {
      clientName: 'Michael Scott',
      phoneNumber: '+1-412-555-9012',
      status: 'NOT_ANSWERED',
      notes: '[Campaign: Google Campaign] Left a voicemail.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-10T14:30:00Z')
    },
    {
      clientName: 'Sarah Connor',
      phoneNumber: '+1-310-555-4433',
      status: 'INTERESTED',
      notes: '[Campaign: Facebook Campaign] Ready to sign.',
      salesPersonId: salesUser.id,
      callDate: new Date('2026-08-10T10:00:00Z')
    }
  ];

  for (const lead of dummyLeads) {
    await prisma.callRecord.create({ data: lead });
  }

  console.log('Successfully seeded 6 dummy leads!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
