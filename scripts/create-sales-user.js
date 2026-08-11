const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'sales@aidigitals.com';
  const password = 'salespassword123';
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('User already exists. Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      name: 'Sales Tester',
      password: hashedPassword,
      role: 'SALES',
      department: 'Sales',
      status: 'ACTIVE'
    }
  });

  console.log('Created Sales User successfully!');
  console.log('Email:', email);
  console.log('Password:', password);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
