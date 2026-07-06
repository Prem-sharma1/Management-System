import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || (status !== 'APPROVED' && status !== 'REJECTED' && status !== 'PENDING')) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        action: `${status} leave request (ID: ${id}) for ${leave.user.name}`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ leave: updatedLeave });
  } catch (error) {
    console.error('Leave PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
