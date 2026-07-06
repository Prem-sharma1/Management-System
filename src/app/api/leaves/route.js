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

    let leaves;
    if (requester.role === 'EMPLOYEE') {
      leaves = await prisma.leaveRequest.findMany({
        where: { userId: requester.id },
        include: { user: { select: { name: true, department: true } } },
        orderBy: { id: 'desc' }
      });
    } else {
      leaves = await prisma.leaveRequest.findMany({
        include: { user: { select: { name: true, department: true } } },
        orderBy: { id: 'desc' }
      });
    }

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error('Leaves GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { startDate, endDate, reason } = await request.json();

    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Start date, end date, and reason are required' }, { status: 400 });
    }

    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: requester.id,
        startDate,
        endDate,
        reason,
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: `Submitted leave request from ${startDate} to ${endDate}`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ leave: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Leaves POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
