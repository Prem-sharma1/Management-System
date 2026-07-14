import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;

    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized staff session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    if (!user || !['CEO', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized role permissions' }, { status: 403 });
    }

    const feedback = await prisma.clientFeedback.findUnique({ where: { id } });
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback record not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status field is required' }, { status: 400 });
    }

    const updated = await prisma.clientFeedback.update({
      where: { id },
      data: { status }
    });

    // Write an audit log for the admin action
    await prisma.auditLog.create({
      data: {
        action: `Admin "${user.name}" marked ${updated.type} ID ${updated.id} as ${status}`,
        performedByName: user.name,
        performedByRole: user.role
      }
    });

    return NextResponse.json({ success: true, feedback: updated });
  } catch (error) {
    console.error('Client feedback status PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
