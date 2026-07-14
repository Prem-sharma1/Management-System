import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Auto-seed default users if they don't exist in the database yet
    if (!user) {
      if (email === 'nikhil@aidigital.com') {
        const salt = await bcrypt.genSalt(10);
        const ceoHash = await bcrypt.hash("AiDigitals@246", salt);
        user = await prisma.user.create({
          data: {
            email: 'nikhil@aidigital.com',
            password: ceoHash,
            name: 'John Doe',
            role: 'CEO',
            department: 'Executive',
            salary: 250000,
            status: 'ACTIVE',
            avatar: '👨‍💼'
          }
        });
      } else if (email === 'admin@workforce.com') {
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash("admin123", salt);
        user = await prisma.user.create({
          data: {
            email: 'admin@workforce.com',
            password: adminHash,
            name: 'Jane Smith',
            role: 'ADMIN',
            department: 'HR',
            salary: 95000,
            status: 'ACTIVE',
            avatar: '👩‍💼'
          }
        });
      } else if (email === 'tl@workforce.com') {
        const salt = await bcrypt.genSalt(10);
        const tlHash = await bcrypt.hash("tl123", salt);
        user = await prisma.user.create({
          data: {
            email: 'tl@workforce.com',
            password: tlHash,
            name: 'Harshit',
            role: 'TL',
            department: 'Content',
            salary: 80000,
            status: 'ACTIVE',
            avatar: '👨‍💼'
          }
        });
      } else if (email === 'employee@workforce.com') {
        const salt = await bcrypt.genSalt(10);
        const empHash = await bcrypt.hash("emp123", salt);
        user = await prisma.user.create({
          data: {
            email: 'employee@workforce.com',
            password: empHash,
            name: 'Bob Johnson',
            role: 'EMPLOYEE',
            department: 'Engineering',
            salary: 75000,
            status: 'ACTIVE',
            avatar: '👨‍💻'
          }
        });
      } else {
        // Auto-seed real employee accounts from the seed-employees list
        const employeesList = [
          { name: 'Danish Khan', department: 'Graphic Designer', password: 'Danish@Ai123', email: 'danish@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Swapnil', department: 'Graphic Designer', password: 'Swapnil@Ai231', email: 'swapnil@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Harshit', department: 'Ai Video Lead', password: 'Harshit@Ai456', email: 'harshit@aidigital.com', role: 'TL' },
          { name: 'Divyansh', department: 'Ai Video Editor', password: 'Divyansh@Ai546', email: 'divyansh@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Nouman', department: 'Ai Video Editor', password: 'Nouman@Ai645', email: 'nouman@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Masoom', department: 'Ai Video Editor', password: 'Masoom@Ai564', email: 'masoom@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Rama', department: 'Digital Marketing Executive', password: 'Rama@Ai789', email: 'rama@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Pujan', department: 'Digital Marketing Executive', password: 'Pujan@Ai879', email: 'pujan@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Preet', department: 'Digital Marketing Executive', password: 'Preet@Ai978', email: 'preet@aidigital.com', role: 'EMPLOYEE' },
          { name: 'Sanmeet', department: 'Video Editor', password: 'Sanmeet@Ai901', email: 'sanmeet@aidigital.com', role: 'EMPLOYEE' }
        ];

        const emp = employeesList.find(e => e.email === email);
        if (emp) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(emp.password, salt);
          user = await prisma.user.create({
            data: {
              email: emp.email,
              password: hashedPassword,
              name: emp.name,
              role: emp.role,
              department: emp.department,
              salary: 40000,
              status: 'ACTIVE',
              avatar: emp.role === 'TL' ? '👨‍💼' : '👤'
            }
          });
        }
      }
    }

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Invalid credentials or inactive account' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `${user.name} logged in`,
        performedByName: user.name,
        performedByRole: user.role
      }
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
