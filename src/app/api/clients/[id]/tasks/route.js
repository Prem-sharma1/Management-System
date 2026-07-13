import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const tasks = await prisma.clientTask.findMany({
      where: { clientId: client.clientId },
      include: { Client: true }
    });
    
    tasks.sort((a, b) => {
      const d1 = new Date(a.date).getTime() || 0;
      const d2 = new Date(b.date).getTime() || 0;
      return d1 - d2;
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Client tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
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
    
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
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
      priority
    } = body;
    
    if (!taskId || !taskTitle || !date) {
      return NextResponse.json({ error: 'Missing required task fields.' }, { status: 400 });
    }
    
    const existing = await prisma.clientTask.findUnique({ where: { taskId } });
    if (existing) {
      return NextResponse.json({ error: 'Task ID already exists.' }, { status: 400 });
    }
    
    const task = await prisma.clientTask.create({
      data: {
        taskId,
        clientId: client.clientId,
        businessName: client.businessName,
        taskTitle,
        date,
        assignTo: assignTo || '',
        workingOn: workingOn || '',
        status: status || 'Not Started',
        service: client.services,
        packageName: client.packageName,
        postType: postType || '',
        notes: notes || '',
        priority: priority || 'Normal'
      }
    });
    
    await prisma.auditLog.create({
      data: {
        action: `Created task deliverable: ${taskTitle} (${taskId}) for client ${client.businessName}`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Client tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
