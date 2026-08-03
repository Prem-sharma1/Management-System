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

    const body = await request.json();
    const {
      clientId,
      businessName,
      clientName,
      joiningDate,
      services,
      packageName,
      packageAmount,
      contact,
      email,
      website,
      sector,
      requirement,
      accountReady,
      active,
      notes
    } = body;

    const targetClient = await prisma.client.findUnique({ where: { id } });
    if (!targetClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If changing Client ID, make sure it is still unique
    if (clientId && clientId !== targetClient.clientId) {
      const existing = await prisma.client.findUnique({ where: { clientId } });
      if (existing) {
        return NextResponse.json({ error: 'New Client ID is already in use.' }, { status: 400 });
      }
    }

    const data = {};
    if (clientId) data.clientId = clientId;
    if (businessName) data.businessName = businessName;
    if (clientName !== undefined) data.clientName = clientName;
    if (joiningDate) data.joiningDate = joiningDate;
    if (services) data.services = services;
    if (packageName) data.packageName = packageName;
    if (packageAmount !== undefined) data.packageAmount = parseFloat(packageAmount) || 0;
    if (contact !== undefined) data.contact = contact;
    if (email !== undefined) data.email = email;
    if (website !== undefined) data.website = website;
    if (sector !== undefined) data.sector = sector;
    if (requirement !== undefined) data.requirement = requirement;
    if (accountReady !== undefined) data.accountReady = !!accountReady;
    if (active !== undefined) data.active = !!active;
    if (notes !== undefined) data.notes = notes;

    const updatedClient = await prisma.client.update({
      where: { id },
      data
    });

    // Sync all associated client tasks, deliveries, and feedbacks if client details were updated
    const oldClientId = targetClient.clientId;
    await prisma.clientTask.updateMany({
      where: { clientId: oldClientId },
      data: {
        clientId: updatedClient.clientId,
        businessName: updatedClient.businessName,
        ...(data.packageName ? { packageName: updatedClient.packageName } : {}),
        ...(data.services ? { service: updatedClient.services } : {})
      }
    });

    await prisma.clientDelivery.updateMany({
      where: { clientId: oldClientId },
      data: {
        clientId: updatedClient.clientId,
        clientName: updatedClient.businessName || updatedClient.clientName || ''
      }
    });

    await prisma.clientFeedback.updateMany({
      where: { clientId: oldClientId },
      data: {
        clientId: updatedClient.clientId,
        businessName: updatedClient.businessName,
        clientName: updatedClient.clientName || ''
      }
    });

    if (body.staffAssignments && typeof body.staffAssignments === 'object') {
      const typeMap = {
        c: ['Graphic', 'Creatives', 'C'],
        graphic: ['Graphic', 'Creatives', 'C'],
        r: ['Reel', 'Reels', 'Shorts', 'R'],
        reel: ['Reel', 'Reels', 'Shorts', 'R'],
        a: ['AI Video', 'AiVideo', 'AI', 'A'],
        aiVideo: ['AI Video', 'AiVideo', 'AI', 'A'],
        script: ['Script'],
        poster: ['Posting', 'Post', 'Poster'],
        posting: ['Posting', 'Post', 'Poster'],
        sm: ['Report', 'Weekly Report', 'Weekly Reports', 'Onboarding', 'Access', 'Setup', 'Ads']
      };

      for (const [key, toUser] of Object.entries(body.staffAssignments)) {
        if (!toUser || toUser === 'AUTO') continue;
        const targetUser = await prisma.user.findFirst({
          where: { name: { equals: toUser, mode: 'insensitive' } }
        });
        const targetName = targetUser ? targetUser.name : toUser;
        const postTypes = typeMap[key] || [];

        if (postTypes.length === 0) continue;

        for (const pType of postTypes) {
          const taskWhere = {
            clientId: updatedClient.clientId,
            OR: [
              { postType: { contains: pType, mode: 'insensitive' } },
              { taskTitle: { contains: pType, mode: 'insensitive' } }
            ]
          };

          if (key === 'c' || key === 'graphic') {
            taskWhere.NOT = { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } };
          }

          await prisma.clientTask.updateMany({
            where: taskWhere,
            data: { workingOn: targetName }
          });

          await prisma.clientDelivery.updateMany({
            where: taskWhere,
            data: { workingOn: targetName }
          });

          if (targetUser) {
            const matchedTasks = await prisma.clientTask.findMany({
              where: taskWhere,
              select: { taskId: true, taskCode: true }
            });
            const codes = matchedTasks.flatMap(t => [t.taskId, t.taskCode]).filter(Boolean);
            if (codes.length > 0) {
              await prisma.task.updateMany({
                where: {
                  OR: [
                    ...codes.map(c => ({ description: { contains: c } })),
                    ...codes.map(c => ({ title: { contains: c } }))
                  ]
                },
                data: { assignedToId: targetUser.id }
              });
            }
          }
        }
      }
    }

    if (body.reassignStaff) {
      const { fromUser, toUser, postType } = body.reassignStaff;
      if (toUser) {
        const targetUser = await prisma.user.findFirst({
          where: { name: { equals: toUser, mode: 'insensitive' } }
        });
        const sourceUser = fromUser ? await prisma.user.findFirst({
          where: { name: { equals: fromUser, mode: 'insensitive' } }
        }) : null;

        const targetName = targetUser ? targetUser.name : toUser;

        const taskWhere = { clientId: updatedClient.clientId };
        if (fromUser) taskWhere.workingOn = { equals: fromUser, mode: 'insensitive' };
        if (postType) taskWhere.postType = { equals: postType, mode: 'insensitive' };

        await prisma.clientTask.updateMany({
          where: taskWhere,
          data: { workingOn: targetName }
        });

        const deliveryWhere = { clientId: updatedClient.clientId };
        if (fromUser) deliveryWhere.workingOn = { equals: fromUser, mode: 'insensitive' };

        await prisma.clientDelivery.updateMany({
          where: deliveryWhere,
          data: { workingOn: targetName }
        });

        if (targetUser) {
          if (sourceUser) {
            await prisma.task.updateMany({
              where: { assignedToId: sourceUser.id },
              data: { assignedToId: targetUser.id }
            });
          } else {
            const clientTasks = await prisma.clientTask.findMany({
              where: taskWhere,
              select: { taskId: true }
            });
            const tIds = clientTasks.map(t => t.taskId);
            if (tIds.length > 0) {
              await prisma.task.updateMany({
                where: { OR: tIds.map(tId => ({ description: { contains: tId } })) },
                data: { assignedToId: targetUser.id }
              });
            }
          }
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        action: `Updated client profile: ${updatedClient.businessName} (${updatedClient.clientId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Client PUT error:', error);
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

    const targetClient = await prisma.client.findUnique({ where: { id } });
    if (!targetClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // 1. Delete associated client portal user accounts if any
    await prisma.user.deleteMany({
      where: {
        role: 'CLIENT',
        OR: [
          { department: targetClient.clientId },
          { email: targetClient.email || undefined }
        ]
      }
    });

    // 2. Delete internal employee tasks referencing this client
    await prisma.task.deleteMany({
      where: {
        OR: [
          { description: { contains: targetClient.clientId } },
          { description: { contains: targetClient.businessName } }
        ]
      }
    });

    // 3. Delete Client record (Prisma cascade handles ClientTask, ClientDelivery, ClientFeedback)
    await prisma.client.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Deleted client account: ${targetClient.businessName} (${targetClient.clientId})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
