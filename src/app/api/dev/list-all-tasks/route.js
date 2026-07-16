import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tasks = await prisma.clientTask.findMany({
      select: {
        id: true,
        taskId: true,
        taskTitle: true,
        date: true,
        createdAt: true,
        businessName: true
      }
    });
    return NextResponse.json({ count: tasks.length, tasks });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
