import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pujan = await prisma.user.findFirst({ where: { name: { contains: 'Pujan' } } });
    if (!pujan) return NextResponse.json({ error: 'No Pujan' });
    
    const tasks = await prisma.task.findMany({ where: { assignedToId: pujan.id } });
    const cTasks = await prisma.clientTask.findMany({ where: { workingOn: pujan.name } });
    
    return NextResponse.json({ pujan, tasksCount: tasks.length, cTasksCount: cTasks.length, tasks, cTasks });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
