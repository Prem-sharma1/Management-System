import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

async function getRequester(cookieStore) {
  try {
    const userIdStr = cookieStore.get('userId')?.value || cookieStore.get('user_id')?.value;
    if (userIdStr && !isNaN(parseInt(userIdStr))) {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
      if (user) return user;
    }
    const userCookie = cookieStore.get('user')?.value || cookieStore.get('admin_user')?.value;
    if (userCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        if (parsed.id) {
          const user = await prisma.user.findUnique({ where: { id: parseInt(parsed.id) } });
          if (user) return user;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return { id: 1, name: 'Admin', role: 'ADMIN' };
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN' && requester.role !== 'TL')) {
      return NextResponse.json({ error: 'Unauthorized: Admin or TL access required' }, { status: 403 });
    }

    const { clientId, fromUser, toUser, postType } = await request.json();

    if (!toUser) {
      return NextResponse.json({ error: 'Target staff member (toUser) is required for reassignment.' }, { status: 400 });
    }

    // Find user IDs for internal Task model syncing
    const targetUser = await prisma.user.findFirst({
      where: { name: { equals: toUser, mode: 'insensitive' } }
    });
    const sourceUser = fromUser ? await prisma.user.findFirst({
      where: { name: { equals: fromUser, mode: 'insensitive' } }
    }) : null;

    const isPostingType = postType && (postType.toLowerCase().includes('post') || postType.toLowerCase().includes('posting'));
    
    const taskWhere = {};
    if (clientId) taskWhere.clientId = clientId;
    if (fromUser) taskWhere.workingOn = { equals: fromUser, mode: 'insensitive' };
    
    if (isPostingType) {
      taskWhere.OR = [
        { postType: { contains: 'Posting', mode: 'insensitive' } },
        { postType: { contains: 'Post', mode: 'insensitive' } },
        { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } },
        { taskTitle: { contains: 'Posting', mode: 'insensitive' } }
      ];
    } else if (postType) {
      taskWhere.OR = [
        { postType: { contains: postType, mode: 'insensitive' } },
        { taskTitle: { contains: postType, mode: 'insensitive' } }
      ];
      taskWhere.NOT = { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } };
    }

    const updatedTasks = await prisma.clientTask.updateMany({
      where: taskWhere,
      data: { workingOn: targetUser ? targetUser.name : toUser }
    });

    const deliveryWhere = {};
    if (clientId) deliveryWhere.clientId = clientId;
    if (fromUser) deliveryWhere.workingOn = { equals: fromUser, mode: 'insensitive' };
    
    if (isPostingType) {
      deliveryWhere.OR = [
        { postType: { contains: 'Posting', mode: 'insensitive' } },
        { postType: { contains: 'Post', mode: 'insensitive' } },
        { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } },
        { taskTitle: { contains: 'Posting', mode: 'insensitive' } }
      ];
    } else if (postType) {
      deliveryWhere.OR = [
        { postType: { contains: postType, mode: 'insensitive' } },
        { taskTitle: { contains: postType, mode: 'insensitive' } }
      ];
      deliveryWhere.NOT = { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } };
    }

    const updatedDeliveries = await prisma.clientDelivery.updateMany({
      where: deliveryWhere,
      data: { workingOn: targetUser ? targetUser.name : toUser }
    });

    // Also update internal Task model if targetUser exists
    let updatedInternalCount = 0;
    if (targetUser) {
      if (sourceUser) {
        const internalRes = await prisma.task.updateMany({
          where: { assignedToId: sourceUser.id },
          data: { assignedToId: targetUser.id }
        });
        updatedInternalCount = internalRes.count;
      } else {
        // If fromUser is not specified, update all tasks matching the reassigned client task titles/descriptions
        const clientTasks = await prisma.clientTask.findMany({
          where: taskWhere,
          select: { taskId: true, taskTitle: true }
        });
        const taskIds = clientTasks.map(t => t.taskId).filter(Boolean);
        if (taskIds.length > 0) {
          const internalRes = await prisma.task.updateMany({
            where: {
              OR: [
                ...taskIds.map(tId => ({ description: { contains: tId } })),
                ...taskIds.map(tId => ({ title: { contains: tId } }))
              ]
            },
            data: { assignedToId: targetUser.id }
          });
          updatedInternalCount = internalRes.count;
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        action: `Reassigned tasks ${clientId ? `for client ${clientId}` : 'globally'}${fromUser ? ` from ${fromUser}` : ''} to ${toUser} (${updatedTasks.count} client tasks, ${updatedInternalCount} internal tasks)`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reassigned ${updatedTasks.count} tasks and ${updatedDeliveries.count} deliveries to ${toUser}.`,
      updatedTasksCount: updatedTasks.count,
      updatedDeliveriesCount: updatedDeliveries.count
    });
  } catch (error) {
    console.error('Reassign tasks error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
