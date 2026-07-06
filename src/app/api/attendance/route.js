import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const todayLog = await prisma.attendance.findFirst({
      where: {
        userId: requester.id,
        date: todayStr
      }
    });

    let logs;
    if (requester.role === 'EMPLOYEE') {
      logs = await prisma.attendance.findMany({
        where: { userId: requester.id },
        include: { user: { select: { name: true, department: true } } },
        orderBy: { id: 'desc' },
        take: 30
      });
    } else {
      logs = await prisma.attendance.findMany({
        include: { user: { select: { name: true, department: true } } },
        orderBy: { id: 'desc' },
        take: 50
      });
    }

    return NextResponse.json({
      todayLog,
      logs
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const activeLog = await prisma.attendance.findFirst({
      where: {
        userId: requester.id,
        date: todayStr,
        clockOut: null
      }
    });

    if (activeLog) {
      const updated = await prisma.attendance.update({
        where: { id: activeLog.id },
        data: { clockOut: now }
      });

      await prisma.auditLog.create({
        data: {
          action: `Clocked out`,
          performedByName: requester.name,
          performedByRole: requester.role
        }
      });

      return NextResponse.json({ message: 'Clocked out successfully', log: updated });
    } else {
      const alreadyLogged = await prisma.attendance.findFirst({
        where: {
          userId: requester.id,
          date: todayStr
        }
      });

      if (alreadyLogged && alreadyLogged.clockOut !== null) {
        return NextResponse.json({ error: 'You have already clocked in and out for today.' }, { status: 400 });
      }

      let status = 'PRESENT';
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (hours > 9 || (hours === 9 && minutes > 15)) {
        status = 'LATE';
      }

      const created = await prisma.attendance.create({
        data: {
          userId: requester.id,
          clockIn: now,
          status,
          date: todayStr
        }
      });

      await prisma.auditLog.create({
        data: {
          action: `Clocked in (${status})`,
          performedByName: requester.name,
          performedByRole: requester.role
        }
      });

      return NextResponse.json({ message: 'Clocked in successfully', log: created });
    }
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
