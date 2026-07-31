require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

const pool = new pg.Pool({
  connectionString: dbUrl,
  connectionTimeoutMillis: 5000,
  ssl: dbUrl.includes('sslmode=') || dbUrl.includes('prisma.io') ? { rejectUnauthorized: false } : false
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const newEmail = 'praveen@aidigital.com';
  const newPasswordRaw = 'Admin@#123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPasswordRaw, salt);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@workforce.com' },
        { email: 'admin@worforce.com' },
        { email: newEmail },
        { role: 'ADMIN' }
      ]
    }
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: newEmail,
        password: hashedPassword,
        name: 'Business Head',
        role: 'ADMIN'
      }
    });
    console.log('Successfully updated Admin credentials in database:', updated.email);
  } else {
    const created = await prisma.user.create({
      data: {
        email: newEmail,
        name: 'Business Head',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'HR',
        salary: 95000,
        status: 'ACTIVE',
        avatar: '👨‍💼'
      }
    });
    console.log('Successfully created Admin account in database:', created.email);
  }
}

main()
  .catch(err => {
    console.error('Error updating admin user:', err.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
