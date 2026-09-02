import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('tl123', salt);
    const empHashedPassword = await bcrypt.hash('emp123', salt);



    const employees = ['Divyansh', 'Nouman', 'Masoom'];
    const created = [];
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
      created.push(user.name);
    }

    return NextResponse.json({ message: 'Seed successful', tl: tl.name, created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
