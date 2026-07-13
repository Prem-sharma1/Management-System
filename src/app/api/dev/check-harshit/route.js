import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const harshit = await prisma.user.findFirst({ where: { name: { contains: 'Harshit' } } });
    if (!harshit) return NextResponse.json({ error: 'No Harshit' });
    
    const tasks = await prisma.task.findMany({ where: { assignedToId: harshit.id } });
    const cTasks = await prisma.clientTask.findMany({ where: { workingOn: harshit.name } });
    
    return NextResponse.json({ harshit, tasksCount: tasks.length, cTasksCount: cTasks.length });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
