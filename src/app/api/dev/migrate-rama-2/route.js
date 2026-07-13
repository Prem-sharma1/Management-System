import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rama = await prisma.user.findFirst({ where: { name: 'Rama' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    if (!rama) return NextResponse.json({ error: 'No Rama found' });
    
    const ct = await prisma.clientTask.findMany({
      where: { workingOn: 'Rama' }
    });

    let imported = 0;
    
    for (const task of ct) {
      const existing = await prisma.task.findFirst({
        where: { title: task.taskTitle, assignedToId: rama.id }
      });
      if (!existing) {
        await prisma.task.create({
          data: {
            title: task.taskTitle,
            description: `Client: ${task.businessName} | Task ID: ${task.taskId} | Service: ${task.service}`,
            status: task.status === 'Complete Task' ? 'DONE' : 'TODO',
            assignedToId: rama.id,
            createdById: admin ? admin.id : rama.id,
            dueDate: task.date || "2026-05-01"
          }
        });
        imported++;
      }
    }
    return NextResponse.json({ success: true, message: `Imported ${imported} NEW tasks into Task model for Rama. Total CT found: ${ct.length}` });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
