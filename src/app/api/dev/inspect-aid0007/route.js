import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await prisma.client.findFirst({
      where: { clientId: 'AID-0007' }
    });

    const clientTasks = await prisma.clientTask.findMany({
      where: { clientId: 'AID-0007' }
    });

    const tasks = await prisma.task.findMany({
      include: { assignedTo: true }
    });

    return NextResponse.json({
      client,
      clientTasks,
      internalTasksCount: tasks.length,
      sampleInternalTasks: tasks.slice(0, 30).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assignedToName: t.assignedTo ? t.assignedTo.name : 'Unassigned',
        assignedToId: t.assignedToId
      }))
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
