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

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, status, assignedToId, dueDate, reason, workSampleUrl, priority } = await request.json();

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isPowerUser = requester.role === 'CEO' || requester.role === 'ADMIN';

    if (!isPowerUser) {
      if (task.assignedToId !== requester.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (!status) {
        return NextResponse.json({ error: 'Status is required' }, { status: 400 });
      }

      const updateData = { status };
      if (reason !== undefined) updateData.reason = reason;
      if (workSampleUrl !== undefined) updateData.workSampleUrl = workSampleUrl;

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json({ task: updatedTask });
    }

    const data = {};
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (status) data.status = status;
    if (assignedToId) data.assignedToId = parseInt(assignedToId);
    if (dueDate !== undefined) data.dueDate = dueDate;
    if (reason !== undefined) data.reason = reason;
    if (workSampleUrl !== undefined) data.workSampleUrl = workSampleUrl;
    if (priority !== undefined) data.priority = priority;

    const updatedTask = await prisma.task.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        action: `Updated task "${updatedTask.title}" (ID: ${id})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Deleted task "${task.title}" (ID: ${id})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
