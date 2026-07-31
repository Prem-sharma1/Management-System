import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { removeWorkSampleFile, isPostedStatus } from '@/lib/fileCleanup';

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    const clientIdStr = cookieStore.get('clientId')?.value;
    
    let requester = null;
    let isClient = false;
    
    if (userIdStr) {
      requester = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    } else if (clientIdStr) {
      requester = await prisma.client.findUnique({ where: { clientId: clientIdStr } });
      isClient = true;
    }
    
    if (!requester || (isClient && !requester.active) || (!isClient && !['CEO', 'ADMIN', 'TL', 'EMPLOYEE'].includes(requester.role))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetTask = await prisma.clientTask.findUnique({ where: { id } });
    if (!targetTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (isClient && targetTask.clientId !== requester.clientId) {
      return NextResponse.json({ error: 'Unauthorized access to this task' }, { status: 403 });
    }

    const body = await request.json();

    if (isClient) {
      const { status, notes } = body;
      if (status !== 'Revision' && status !== 'Completion') {
        return NextResponse.json({ error: 'Clients can only approve (Completion) or request revisions (Revision)' }, { status: 400 });
      }

      const updatedTask = await prisma.clientTask.update({
        where: { id },
        data: {
          status: status,
          notes: notes !== undefined ? notes : targetTask.notes,
          statusChangedAt: new Date()
        }
      });

      await prisma.auditLog.create({
        data: {
          action: `Client "${requester.businessName}" updated task status to "${status}": ${updatedTask.taskTitle} (${updatedTask.taskId})`,
          performedByName: requester.clientName || requester.businessName,
          performedByRole: 'CLIENT'
        }
      });

      return NextResponse.json({ task: updatedTask });
    }

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
    if (status) {
      data.status = status;
      if (status !== targetTask.status) {
        data.statusChangedAt = new Date();
      }
    }
    if (postType !== undefined) data.postType = postType;
    if (notes !== undefined) data.notes = notes;
    if (reason !== undefined) data.reason = reason;
    if (workSampleUrl !== undefined) data.workSampleUrl = workSampleUrl;
    if (body.priority !== undefined) data.priority = body.priority;

    const checkStatus = status || targetTask.status;
    const checkPostType = postType !== undefined ? postType : targetTask.postType;
    const checkTitle = taskTitle !== undefined ? taskTitle : targetTask.taskTitle;

    if (isPostedStatus(checkStatus, checkPostType, checkTitle)) {
      data.workSampleUrl = null;

      if (targetTask.workSampleUrl) {
        await removeWorkSampleFile(targetTask.workSampleUrl);
      }
      if (workSampleUrl) {
        await removeWorkSampleFile(workSampleUrl);
      }

      if (targetTask.taskId) {
        try {
          const linkedTasks = await prisma.task.findMany({
            where: {
              OR: [
                { description: { contains: targetTask.taskId } },
                { title: targetTask.taskTitle }
              ]
            }
          });
          for (const t of linkedTasks) {
            if (t.workSampleUrl) {
              await removeWorkSampleFile(t.workSampleUrl);
            }
          }
          await prisma.task.updateMany({
            where: {
              OR: [
                { description: { contains: targetTask.taskId } },
                { title: targetTask.taskTitle }
              ]
            },
            data: { workSampleUrl: null }
          });
        } catch (tErr) {
          console.warn('Could not clear linked task workSampleUrl:', tErr);
        }
      }
    }

    const updatedTask = await prisma.clientTask.update({
      where: { id },
      data
    });

    if (updatedTask.taskId && status) {
      try {
        await prisma.clientDelivery.updateMany({
          where: { linkedTaskId: updatedTask.taskId },
          data: { status: status }
        });
      } catch (dErr) {
        console.warn('Could not sync client delivery status:', dErr);
      }
    }

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

    // 1. Delete matching internal employee Task records if any
    await prisma.task.deleteMany({
      where: {
        OR: [
          { description: { contains: targetTask.taskId } },
          {
            AND: [
              { title: targetTask.taskTitle },
              { description: { contains: targetTask.businessName } }
            ]
          }
        ]
      }
    });

    // 2. Delete matching ClientDelivery records if linked
    if (targetTask.taskId) {
      await prisma.clientDelivery.deleteMany({
        where: { linkedTaskId: targetTask.taskId }
      });
    }

    // 3. Delete the ClientTask record itself
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
