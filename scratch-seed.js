const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Fetching clients from database...");
    const clients = await prisma.client.findMany();
    console.log(`Found ${clients.length} clients.`);

    const salt = await bcrypt.genSalt(10);
    const results = [];

    for (const client of clients) {
      let email = client.email ? client.email.trim() : '';
      if (!email || !email.includes('@')) {
        const cleanName = client.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        email = `${cleanName || 'client' + client.id}@gmail.com`;
      }

      const numericPart = client.clientId.replace(/[^0-9]/g, '');
      const plainPassword = `Client@${numericPart || '123'}`;
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      // 1. Save into User login table
      await prisma.user.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name: client.businessName,
          password: hashedPassword,
          role: 'CLIENT',
          department: client.clientId,
          status: 'ACTIVE'
        },
        create: {
          email: email.toLowerCase(),
          name: client.businessName,
          password: hashedPassword,
          role: 'CLIENT',
          department: client.clientId,
          status: 'ACTIVE',
          avatar: '💼'
        }
      });

      // 2. Save email & plain password back into Client table (so it stores in database)
      try {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            email: email.toLowerCase(),
            password: plainPassword
          }
        });
      } catch (colErr) {
        // Fallback: If password column is not pushed yet in Postgres, only update email
        await prisma.client.update({
          where: { id: client.id },
          data: {
            email: email.toLowerCase()
          }
        });
      }

      results.push({
        businessName: client.businessName,
        clientId: client.clientId,
        email: email.toLowerCase(),
        password: plainPassword
      });
    }

    console.log(`Successfully seeded ${results.length} client logins in DB.`);
    const fs = require('fs');
    fs.writeFileSync('scratch-seed.log', JSON.stringify(results, null, 2));
    console.log("Credentials written to scratch-seed.log");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
