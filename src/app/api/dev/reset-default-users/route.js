import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const salt = await bcrypt.genSalt(10);
    const ceoHash = await bcrypt.hash("AiDigitals@246", salt);
    const adminHash = await bcrypt.hash("admin123", salt);
    const tlHash = await bcrypt.hash("tl123", salt);
    const empHash = await bcrypt.hash("emp123", salt);

    // 1. CEO
    const ceo = await prisma.user.upsert({
      where: { email: 'nikhil@aidigital.com' },
      update: {
        password: ceoHash,
        name: 'John Doe',
        role: 'CEO',
        department: 'Executive',
        salary: 250000,
        status: 'ACTIVE',
        avatar: '👨‍💼'
      },
      create: {
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

    // 2. Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@workforce.com' },
      update: {
        password: adminHash,
        name: 'Jane Smith',
        role: 'ADMIN',
        department: 'HR',
        salary: 95000,
        status: 'ACTIVE',
        avatar: '👩‍💼'
      },
      create: {
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

    // 3. Team Leader
    const tl = await prisma.user.upsert({
      where: { email: 'tl@workforce.com' },
      update: {
        password: tlHash,
        name: 'Harshit',
        role: 'TL',
        department: 'Content',
        salary: 80000,
        status: 'ACTIVE',
        avatar: '👨‍💼'
      },
      create: {
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

    // 4. Standard Employee
    const employee = await prisma.user.upsert({
      where: { email: 'employee@workforce.com' },
      update: {
        password: empHash,
        name: 'Bob Johnson',
        role: 'EMPLOYEE',
        department: 'Engineering',
        salary: 75000,
        status: 'ACTIVE',
        avatar: '👨‍💻'
      },
      create: {
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

    // 5. Actual Employees List
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

    const results = [];
    for (const emp of employeesList) {
      const empSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(emp.password, empSalt);

      const u = await prisma.user.upsert({
        where: { email: emp.email },
        update: {
          name: emp.name,
          password: hashedPassword,
          role: emp.role,
          department: emp.department,
          salary: 40000,
          status: 'ACTIVE',
          avatar: emp.role === 'TL' ? '👨‍💼' : '👤'
        },
        create: {
          name: emp.name,
          email: emp.email,
          password: hashedPassword,
          role: emp.role,
          department: emp.department,
          salary: 40000,
          status: 'ACTIVE',
          avatar: emp.role === 'TL' ? '👨‍💼' : '👤'
        }
      });
      results.push({ name: u.name, email: u.email });
    }

    return NextResponse.json({
      success: true,
      message: 'All default and real employee user accounts have been successfully pushed/reset in the database.',
      users: {
        ceo: ceo.email,
        admin: admin.email,
        tl: tl.email,
        employee: employee.email,
        realEmployees: results
      }
    });
  } catch (error) {
    console.error('Reset default users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
