import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const harshit = await prisma.user.findFirst({ where: { name: 'Harshit' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    if (!harshit) return NextResponse.json({ error: 'No Harshit found' });
    
    const ct = await prisma.clientTask.findMany({
      where: { workingOn: 'Harshit' }
    });

    let imported = 0;
    
    for (const task of ct) {
      // Check using description which contains the unique Task ID
      const existing = await prisma.task.findFirst({
        where: { 
          assignedToId: harshit.id,
          description: { contains: task.taskId }
        }
      });

      if (!existing) {
        await prisma.task.create({
          data: {
            title: task.taskTitle,
            description: `Client: ${task.businessName} | Task ID: ${task.taskId} | Service: ${task.service}`,
            status: task.status === 'Complete Task' || task.status === 'DONE' ? 'DONE' : 'TODO',
            assignedToId: harshit.id,
            createdById: admin ? admin.id : harshit.id,
            dueDate: task.date || "2026-05-01"
          }
        });
        imported++;
      }
    }
    return NextResponse.json({ success: true, message: `Imported ${imported} missing tasks into Task model for Harshit. Total CT found: ${ct.length}` });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
