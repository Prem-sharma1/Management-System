import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password, department } = await request.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json({ error: 'All fields (name, email, password, department) are required.' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (Role is strictly forced to EMPLOYEE for public signup)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        department,
        salary: 0.0,
        status: 'ACTIVE',
        avatar: '👤'
      }
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: `${name} self-registered as a new employee`,
        performedByName: name,
        performedByRole: 'EMPLOYEE'
      }
    });

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
