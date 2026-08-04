import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const tasks = await prisma.clientTask.findMany({
      where: { clientId: 'AID-0050' },
      select: { taskId: true, taskTitle: true, postType: true, workingOn: true }
    });

    const aiMatch1 = await prisma.clientTask.findMany({
      where: {
        clientId: 'AID-0050',
        OR: [
          { postType: { contains: 'AI Video', mode: 'insensitive' } },
          { taskTitle: { contains: 'AI Video', mode: 'insensitive' } }
        ],
        NOT: { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } }
      },
      select: { taskTitle: true, workingOn: true }
    });

    return NextResponse.json({ all: tasks, aiMatch: aiMatch1 });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
