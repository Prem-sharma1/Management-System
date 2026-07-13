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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const requester = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    if (!requester || !['CEO', 'ADMIN', 'TL', 'EMPLOYEE'].includes(requester.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetTask = await prisma.clientTask.findUnique({ where: { id } });
    if (!targetTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      taskId,
      taskTitle,
      date,
      assignTo,
      workingOn,
      status,
      postType,
      notes,
      reason,
      workSampleUrl
    } = body;

    const data = {};
    if (taskId) data.taskId = taskId;
    if (taskTitle) data.taskTitle = taskTitle;
    if (date) data.date = date;
    if (assignTo !== undefined) data.assignTo = assignTo;
    if (workingOn !== undefined) data.workingOn = workingOn;
    if (status) data.status = status;
    if (postType !== undefined) data.postType = postType;
    if (notes !== undefined) data.notes = notes;
    if (reason !== undefined) data.reason = reason;
    if (workSampleUrl !== undefined) data.workSampleUrl = workSampleUrl;
    if (body.priority !== undefined) data.priority = body.priority;

    const updatedTask = await prisma.clientTask.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        action: `Updated client task deliverable: ${updatedTask.taskTitle} (${updatedTask.taskId}) - Status: ${updatedTask.status}`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Client task PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const requester = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetTask = await prisma.clientTask.findUnique({ where: { id } });
    if (!targetTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.clientTask.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Deleted client task deliverable: ${targetTask.taskTitle} (${targetTask.taskId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client task DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
