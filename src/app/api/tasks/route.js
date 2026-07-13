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

    let tasks;
    if (requester.role === 'EMPLOYEE') {
      tasks = await prisma.task.findMany({
        where: { assignedToId: requester.id },
        include: {
          assignedTo: { select: { name: true, avatar: true } },
          createdBy: { select: { name: true, role: true } }
        },
        orderBy: { id: 'desc' }
      });
    } else {
      tasks = await prisma.task.findMany({
        include: {
          assignedTo: { select: { name: true, avatar: true } },
          createdBy: { select: { name: true, role: true } }
        },
        orderBy: { id: 'desc' }
      });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN' && requester.role !== 'TL')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, assignedToId, dueDate, priority } = await request.json();

    if (!title || !assignedToId) {
      return NextResponse.json({ error: 'Title and Assignee are required' }, { status: 400 });
    }

    const assignee = await prisma.user.findUnique({ where: { id: parseInt(assignedToId) } });
    if (!assignee) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId: parseInt(assignedToId),
        createdById: requester.id,
        dueDate,
        status: 'TODO',
        priority: priority || 'Normal'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: `Created task "${title}" for ${assignee.name}`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
