import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = 'sales@aidigitals.com';
    const password = 'salespassword123';
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', email, password });
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

    return NextResponse.json({ message: 'Created Sales User successfully!', email, password });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
