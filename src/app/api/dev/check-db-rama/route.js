import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rama = await prisma.user.findFirst({ where: { name: 'Rama' } });
    if (!rama) return NextResponse.json({ error: 'Rama not found' });
    
    const tasks = await prisma.task.findMany({ where: { assignedToId: rama.id } });
    const cTasks = await prisma.clientTask.findMany({ where: { workingOn: 'Rama' } });
    
    return NextResponse.json({ 
      ramaId: rama.id,
      taskCount: tasks.length,
      cTaskCount: cTasks.length,
      tasks,
      cTasks
    });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
