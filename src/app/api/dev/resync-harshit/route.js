import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const harshit = await prisma.user.findFirst({ where: { name: 'Harshit' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    if (!harshit) return NextResponse.json({ error: 'No Harshit found' });
    
    // 1. Get all Harshit's client tasks
    const ct = await prisma.clientTask.findMany({
      where: { workingOn: 'Harshit' }
    });

    // 2. Delete all existing internal tasks for Harshit to avoid duplicates and ensure sync
    await prisma.task.deleteMany({
      where: { assignedToId: harshit.id }
    });

    // 3. Re-create internal tasks
    let imported = 0;
    for (const task of ct) {
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
    
    return NextResponse.json({ success: true, message: `Successfully re-synced all ${imported} tasks for Harshit.` });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
