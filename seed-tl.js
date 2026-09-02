const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('tl123', salt);
  const empHashedPassword = await bcrypt.hash('emp123', salt);




  const employees = ['Divyansh', 'Nouman', 'Masoom'];
  for (const emp of employees) {
    const email = `${emp.toLowerCase()}@workforce.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: emp,
        email: email,
        password: empHashedPassword,
        role: 'EMPLOYEE',
        department: 'Content',
        salary: 40000,
        avatar: '👤',
        status: 'ACTIVE'
      }
    });
    console.log('Created Employee:', user.name);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
