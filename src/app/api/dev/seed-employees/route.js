import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

const employeesList = [
  { name: 'Danish Khan', department: 'Graphic Designer', password: 'Danish@Ai123', email: 'danish@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Swapnil', department: 'Graphic Designer', password: 'Swapnil@Ai231', email: 'swapnil@aidigital.com', role: 'EMPLOYEE' },

  { name: 'Divyansh', department: 'Ai Video Editor', password: 'Divyansh@Ai546', email: 'divyansh@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Nouman', department: 'Ai Video Editor', password: 'Nouman@Ai645', email: 'nouman@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Masoom', department: 'Ai Video Editor', password: 'Masoom@Ai564', email: 'masoom@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Rama', department: 'Digital Marketing Executive', password: 'Rama@Ai789', email: 'rama@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Pujan', department: 'Digital Marketing Executive', password: 'Pujan@Ai879', email: 'pujan@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Preet', department: 'Digital Marketing Executive', password: 'Preet@Ai978', email: 'preet@aidigital.com', role: 'EMPLOYEE' },
  { name: 'Sanmeet', department: 'Video Editor', password: 'Sanmeet@Ai901', email: 'sanmeet@aidigital.com', role: 'EMPLOYEE' }
];

export async function GET() {
  try {
    const salt = await bcrypt.genSalt(10);
    const created = [];

    for (const emp of employeesList) {
      const hashedPassword = await bcrypt.hash(emp.password, salt);
      
      const user = await prisma.user.upsert({
        where: { email: emp.email },
        update: {
          name: emp.name,
          password: hashedPassword,
          role: emp.role,
          department: emp.department
        },
        create: {
          name: emp.name,
          email: emp.email,
          password: hashedPassword,
          role: emp.role,
          department: emp.department,
          salary: 40000,
          avatar: emp.role === 'TL' ? '👨‍💼' : '👤',
          status: 'ACTIVE'
        }
      });
      created.push(user.name);
    }

    return NextResponse.json({ message: 'Seed successful', created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
